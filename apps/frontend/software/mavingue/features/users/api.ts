import type { UserCreateFullRequest, UserResponse } from "./types";

async function parseError(res: Response) {
  const txt = await res.text().catch(() => "");
  try {
    const j = JSON.parse(txt);
    return j?.message ?? j;
  } catch {
    return txt || `Erro HTTP ${res.status}`;
  }
}

export async function listUsers(): Promise<UserResponse[]> {
  const res = await fetch("/api/proxy/api/users", {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error(String(await parseError(res)));
  return res.json();
}

export async function createUser(payload: UserCreateFullRequest): Promise<UserResponse> {
  const res = await fetch("/api/proxy/api/users", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await parseError(res);
    // Se backend devolve mapa {campo: "erro"}
    if (err && typeof err === "object" && !Array.isArray(err)) throw err;
    throw new Error(String(err));
  }

  return res.json();
}