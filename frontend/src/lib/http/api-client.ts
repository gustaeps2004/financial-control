import { ApiError } from "./api-error";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ErrorBody {
  code?: string;
  message?: string | string[];
}

async function request<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    // fetch rejects only when no response arrived: offline, server down, CORS.
    throw new ApiError("The request got no response.", 0, "NETWORK_ERROR");
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? `Request failed with status ${response.status}.`);
    throw new ApiError(message, response.status, body?.code ?? null);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export const apiClient = {
  get: <TResponse>(path: string, init?: RequestInit) =>
    request<TResponse>(path, { ...init, method: "GET" }),
  post: <TResponse, TBody = unknown>(path: string, body: TBody, init?: RequestInit) =>
    request<TResponse>(path, { ...init, method: "POST", body: JSON.stringify(body) }),
  patch: <TResponse, TBody = unknown>(path: string, body: TBody, init?: RequestInit) =>
    request<TResponse>(path, { ...init, method: "PATCH", body: JSON.stringify(body) }),
  put: <TResponse, TBody = unknown>(path: string, body: TBody, init?: RequestInit) =>
    request<TResponse>(path, { ...init, method: "PUT", body: JSON.stringify(body) }),
  delete: <TResponse = void>(path: string, init?: RequestInit) =>
    request<TResponse>(path, { ...init, method: "DELETE" }),
};

export function withAuth(token: string): RequestInit {
  return { headers: { Authorization: `Bearer ${token}` } };
}
