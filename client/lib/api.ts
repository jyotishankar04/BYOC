import api from "./axios";
import type { AxiosRequestConfig } from "axios";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const method = (options?.method ?? "GET") as AxiosRequestConfig["method"];
  const body = options?.body;

  const res = await api.request<T>({
    url: path,
    method,
    data: body,
    headers: options?.headers as Record<string, string>,
  });

  return res.data;
}
