// frontend/src/lib/api-client.ts
interface ApiResponse<T> {
  responseCode: number;
  responseMessage: string;
  data: T;
}

export async function apiRequest<T>(endpoint: string, options?: RequestInit) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const result = await response.json();

  // Rule: Standardized response must have responseCode
  if (result.responseCode !== 0) {
    // If there's an error (Codes 1-8), we throw it to be caught by the UI
    throw {
      code: result.responseCode,
      message: result.responseMessage,
      data: result.data
    };
  }

  return result; // Returns { responseCode, responseMessage, data, dataCount }
}