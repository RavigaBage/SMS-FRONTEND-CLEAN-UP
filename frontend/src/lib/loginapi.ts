// lib/api.ts
export async function authorizedFetch(url: string, options: any = {}) {
  let token = localStorage.getItem("accessToken");

  // Initial request
  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // If token is expired (401 Unauthorized)
  if (res.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    
    // Try to get a new access token
    const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem("accessToken", data.access);
      
      // Retry the original request with the NEW token
      res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${data.access}`,
          "Content-Type": "application/json",
        },
      });
    } else {
      // Refresh token is also expired, force login
      localStorage.clear();
      window.location.href = "/login";
    }
  }

  return res;
}