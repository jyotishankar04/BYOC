import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  const baseURL = api.defaults.baseURL ?? "";
  refreshPromise = fetch(`${baseURL}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// Unwrap the nested error shape from the backend: { error: { code, message } }
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (typeof error.config & { _retry?: boolean; url?: string })
      | undefined;
    const status = error.response?.status ?? 0;
    const message =
      error.response?.data?.error?.message ??
      error.message ??
      "An unexpected error occurred";
    const code = error.response?.data?.error?.code;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !String(originalRequest.url ?? "").includes("/api/v1/auth/refresh")
    ) {
      originalRequest._retry = true;
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return api(originalRequest);
      }
    }

    if (status === 401 && typeof window !== "undefined") {
      const from = encodeURIComponent(window.location.pathname);
      window.location.href = `/auth/login?from=${from}`;
    }

    const enriched = Object.assign(new Error(message), { code, status });
    return Promise.reject(enriched);
  },
);

export default api;
