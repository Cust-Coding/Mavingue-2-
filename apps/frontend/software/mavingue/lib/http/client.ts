function proxy(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `/api/proxy${p}`;
}

async function toErr(res: Response): Promise<Error> {
  let msg = `HTTP ${res.status}`;
  try {
    const t = await res.text();
    if (t) {
      try {
        const j = JSON.parse(t);
        msg = j.message || j.error || msg;
      } catch {
        msg = t;
      }
    }
  } catch {}
  return new Error(msg);
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "GET" });
}

async function apiRequest<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(proxy(path), {
    credentials: "include",
    ...init,
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
