import { ApiError } from "./api-error";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ErrorBody {
  message?: string | string[];
}

async function request<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? "Something went wrong. Please try again.");
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export const apiClient = {
  post: <TResponse, TBody = unknown>(path: string, body: TBody) =>
    request<TResponse>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <TResponse, TBody = unknown>(path: string, body: TBody, init?: RequestInit) =>
    request<TResponse>(path, { ...init, method: "PATCH", body: JSON.stringify(body) }),
};
