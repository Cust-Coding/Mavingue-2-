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
  const res = await fetch(proxy(path), { method: "GET", credentials: "include" });
  if (!res.ok) throw await toErr(res);
  return res.json();
}

export async function apiPost<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(proxy(path), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw await toErr(res);
  return res.status === 204 ? (null as any) : res.json();
}

export async function apiPut<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(proxy(path), {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw await toErr(res);
  return res.status === 204 ? (null as any) : res.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(proxy(path), { method: "DELETE", credentials: "include" });
  if (!res.ok) throw await toErr(res);
  return res.status === 204 ? (null as any) : res.json();
}