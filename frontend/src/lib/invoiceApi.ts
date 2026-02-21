import type { Invoice, InvoiceFilters, InvoiceListResponse } from "@/src/assets/types/invoice";

// ─── Core API Response Shape ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  status?: number;
  responseCode?: number;
  responseMessage?: string;
  results?: T extends Array<infer _> ? T : never;
  count?: number;
  next?: string | null;
  previous?: string | null;
  error?: string | null;
}

// ─── Core Request Helper ──────────────────────────────────────────────────────

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const getHeaders = (): HeadersInit => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    "Content-Type": "application/json",
    ...options.headers,
  });

  let response: Response;

  // ── 1. Initial request ────────────────────────────────────────────────────
  try {
    response = await fetch(url, { ...options, headers: getHeaders() });
  } catch (error) {
    console.error("Network Error:", error);
    throw new Error(
      "SERVER_OFFLINE: Unable to connect to the server. Please check your connection or backend status."
    );
  }

  // ── 2. Handle 401 → attempt token refresh ────────────────────────────────
  if (response.status === 401) {
    try {
      const errorData = await response.clone().json();

      const isTokenError =
        errorData.code === "token_not_valid" ||
        String(errorData.detail ?? "").toLowerCase().includes("token");

      if (isTokenError) {
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          try {
            const refreshRes = await fetch(
              `${baseUrl}/auth/refresh/`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh: refreshToken }),
              }
            );

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              localStorage.setItem("accessToken", refreshData.access);
              if (refreshData.refresh) {
                localStorage.setItem("refreshToken", refreshData.refresh);
              }

              // Retry original request with the new access token
              response = await fetch(url, {
                ...options,
                headers: {
                  ...getHeaders(),
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
              });
            } else {
              throw new Error("Session expired");
            }
          } catch (refreshError) {
            localStorage.clear();
            window.location.href = "/auth/login";
            throw new Error("Session expired or server unreachable.");
          }
        } else {
          localStorage.clear();
          window.location.href = "/auth/login";
          throw new Error("Session expired. Please login again.");
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("Session expired")) {
        throw error;
      }
      localStorage.clear();
      window.location.href = "/auth/login";
      throw new Error("Authentication failed. Please login again.");
    }
  }

  // ── 3. Handle 204 No Content ─────────────────────────────────────────────
  if (response.status === 204) {
    return {
      data: null as unknown as T,
      status: 204,
      responseCode: 0,
      responseMessage: "Success",
    };
  }

  // ── 4. Parse response body ────────────────────────────────────────────────
  let raw: Record<string, unknown> = {};
  const contentType = response.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      raw = await response.json();
    }
  } catch {
    raw = {};
  }

  // ── 5. Handle non-OK responses ────────────────────────────────────────────
  if (!response.ok) {
    return {
      data: null as unknown as T,
      status: response.status,
      error:
        (raw.detail as string) ||
        (raw.error as string) ||
        `Error ${response.status}: ${response.statusText}`,
    };
  }

  // ── 6. Normalise paginated vs plain response ──────────────────────────────
  const isPaginated = Array.isArray(raw.results);

  return {
    responseCode: 0,
    responseMessage: "none",
    data: (isPaginated ? raw.results : raw) as T,
    results: raw.results as ApiResponse<T>["results"],
    count: raw.count as number | undefined,
    next: (raw.next as string | null) ?? null,
    previous: (raw.previous as string | null) ?? null,
    error: null,
  };
}

// ─── Query String Builder ─────────────────────────────────────────────────────

function buildQueryString(filters: InvoiceFilters): string {
  const params = new URLSearchParams();

  if (filters.search)                              params.set("search",        filters.search);
  if (filters.status && filters.status !== "all") params.set("status",        filters.status);
  if (filters.term   && filters.term   !== "all") params.set("term",          filters.term);
  if (filters.academic_year)                       params.set("academic_year", filters.academic_year);
  if (filters.page   && filters.page   > 1)        params.set("page",          String(filters.page));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ─── Invoice API ──────────────────────────────────────────────────────────────

export const invoiceApi = {
  /**
   * GET /invoices/ — paginated, filtered list.
   * Returns a normalised InvoiceListResponse regardless of whether
   * DRF pagination is on or off.
   */
  async list(filters: InvoiceFilters = {}): Promise<InvoiceListResponse> {
    const qs = buildQueryString(filters);
    const res = await apiRequest<Invoice[]>(`/invoices/${qs}`);

    if (res.error) throw new Error(res.error);

    return {
      results:  res.results  ?? (Array.isArray(res.data) ? res.data : []),
      count:    res.count    ?? (Array.isArray(res.data) ? res.data.length : 0),
      next:     res.next     ?? null,
      previous: res.previous ?? null,
    };
  },

  /**
   * GET /invoices/:id/ — single invoice with items.
   */
  async get(id: number): Promise<Invoice> {
    const res = await apiRequest<Invoice>(`/invoices/${id}/`);
    if (res.error) throw new Error(res.error);
    return res.data;
  },
};