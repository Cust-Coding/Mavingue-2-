import { ApiClientError, type FieldErrors } from "@/lib/errors";

function proxy(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `/api/proxy${p}`;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function toErr(res: Response): Promise<ApiClientError> {
  let message = `HTTP ${res.status}`;
  let fieldErrors: FieldErrors = {};
  let code: string | undefined;

  try {
    const text = await res.text();
    if (text) {
      try {
        const json = JSON.parse(text) as {
          message?: string;
          error?: string;
          fieldErrors?: FieldErrors;
          code?: string;
        };

        message = json.message || json.error || message;
        fieldErrors = json.fieldErrors ?? {};
        code = json.code;
      } catch {
        message = text;
      }
    }
  } catch {}

  return new ApiClientError(message, res.status, fieldErrors, code);
}

async function apiRequest<T>(path: string, init: RequestInit): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(proxy(path), {
    credentials: "include",
    ...init,
    headers,
  });

  if (!res.ok) throw await toErr(res);

  if (res.status === 204) {
    return null as T;
  }

  const text = await res.text();
  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "GET" });
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "DELETE" });
}
