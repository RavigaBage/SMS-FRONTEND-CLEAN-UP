// The structure DRF uses internally
export interface PaginatedResponse<T> {
  count?: number;  
  next: string | null;
  previous: string | null;
  results: any[];
}

export interface Student {
  id: number;
  user: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  grade: string;
  status: string;
  profile_image?: string;
}


// Expected student shape from your backend
export interface StudentRaw {
  id: number;
  admission_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name: string;
  date_of_birth: string;
  age: number;
  gender: string;
  gender_display: string;
  address: string;
  nationality: string;
  religion?: string;
  blood_group?: string;
  medical_conditions?: string;
  status: 'active' | 'graduated' | 'inactive';
  status_display: string;
  admission_date: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

// Update your ApiResponse generic to handle paginated DRF responses
export interface ApiResponse<T> {
  id: ApiResponse<{ id: number; first_name: string; last_name: string; email: string; phone: string; date_of_birth: string; gender: string; }>;
  responseCode: number;
  responseMessage: string;
  data: T[];
  results?: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export interface ApiRequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean | null | undefined>;
}



export async function fetchWithAuth(url: string, options: any = {}) {
  let accessToken = localStorage.getItem("accessToken");

  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    try {
      const errorData = await response.clone().json();
      if (errorData.code === "token_not_valid" || errorData.detail?.includes("token")) {
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            
            localStorage.setItem("accessToken", refreshData.access);
            if (refreshData.refresh) localStorage.setItem("refreshToken", refreshData.refresh);
            const latestAccess = localStorage.getItem("accessToken"); 
            headers["Authorization"] = `Bearer ${latestAccess}`;

            response = await fetch(url, { ...options, headers });
          } else {
            localStorage.clear();
            window.location.href = "/auth/login";
            throw new Error("Session expired. Please login again.");
          }
        } else {
          // No refresh token available
          localStorage.clear();
          window.location.href = "/auth/login";
          throw new Error("Session expired. Please login again.");
        }
      }
    } catch (error) {
      // If we can't parse the error, still try to refresh
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          
          localStorage.setItem("accessToken", refreshData.access);
          if (refreshData.refresh) localStorage.setItem("refreshToken", refreshData.refresh);
          const latestAccess = localStorage.getItem("accessToken"); 
          headers["Authorization"] = `Bearer ${latestAccess}`;

          response = await fetch(url, { ...options, headers });
        } else {
          localStorage.clear();
          window.location.href = "/auth/login";
          throw new Error("Session expired. Please login again.");
        }
      } else {
        localStorage.clear();
        window.location.href = "/auth/login";
        throw new Error("Session expired. Please login again.");
      }
    }
  }

  return response;
}

export async function fetchStudentsByClass(
  className: string,
  academicYear: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const url = `${baseUrl}/students/?classes=${encodeURIComponent(
    className
  )}&academic_year=${encodeURIComponent(academicYear)}`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    throw new Error("Failed to fetch students");
  }

  return response.json();
}
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    "Content-Type": "application/json",
    ...options.headers,
  });

  let response: Response;

  try {
    response = await fetch(url, { ...options, headers: getHeaders() });
  } catch (error) {
    console.error("Network Error:", error);
    throw new Error("SERVER_OFFLINE: Unable to connect to the server. Please check your connection or backend status.");
  }

  if (response.status === 401) {
    try {
      const errorData = await response.clone().json();
      
      if (errorData.code === "token_not_valid" || errorData.detail?.includes("token")) {
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          try {
            const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh: refreshToken }),
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              localStorage.setItem("accessToken", refreshData.access);
              if (refreshData.refresh) localStorage.setItem("refreshToken", refreshData.refresh);

              response = await fetch(url, { 
                ...options, 
                headers: {
                  ...getHeaders(),
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                }
              });
            } else {
              throw new Error("Session expired");
            }
          } catch (refreshError) {
             localStorage.clear();
             window.location.href = "/auth/login";
             throw new Error("Session expired or Server unreachable.");
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

  if (response.status === 204) {
    return { 
      data: null as any, 
      status: 204, 
      responseCode: 0, 
      responseMessage: 'Success' 
    } as unknown as ApiResponse<T>;
  }

  let raw: any;
  const contentType = response.headers.get("content-type");
  try {
    if (contentType && contentType.includes("application/json")) {
      raw = await response.json();
    } else {
      raw = {};
    }
  } catch (e) {
    raw = {};
  }

  if (!response.ok) {
    throw new Error(raw.error || raw.detail || `Request failed with status ${response.status}`);
  }

  const isPaginated = Array.isArray(raw.results);

  return {
    responseCode: 0,
    responseMessage: 'none',
    data: isPaginated ? raw.results : raw, 
    results: raw.results,
    count: raw.count,
    next: raw.next,
    previous: raw.previous,
  } as unknown as ApiResponse<T>;
}