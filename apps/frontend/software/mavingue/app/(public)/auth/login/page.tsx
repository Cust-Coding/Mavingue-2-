"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { setSession } from "@/lib/auth/session";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

type UnsplashPhoto = {
  id: string;
  urls?: {
    regular?: string;
    full?: string;
  };
  user?: {
    name?: string;
  };
};

const UNSPLASH_KEY = "chev9GnfrEnrjUqH2453c_WzTsPgKmgKViPk6bCYY4A";
const RECENT_BG_KEY = "login_recent_unsplash_bg_ids";

const FALLBACK_BG =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80";
  

const BG_QUERIES = [
  "construction site africa",
  "construction workers africa",
  "modern construction site",
  "engineering project construction",
  "steel beams construction",
  "industrial building construction",
  "workers with hard hats",
  "commercial construction site",
];

function PremiumInput({
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  ...props
}: {
  icon?: React.ElementType;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  [key: string]: any;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={18} />
        </div>
      )}
      <input
        type={inputType}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 rounded-xl border bg-white text-gray-900 
          placeholder:text-gray-400 transition-all duration-200 
          focus:outline-none focus:ring-2 
          ${
            error
              ? "border-red-500 focus:ring-red-200 focus:border-red-500"
              : "border-gray-200 focus:ring-[#FF4500]/20 focus:border-[#FF4500]"
          }
          hover:border-gray-300
          ${Icon ? "pl-10" : "pl-4"}
          ${isPassword ? "pr-10" : "pr-4"}
        `}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
      {error && (
        <div className="flex items-center gap-1 mt-1 text-xs text-red-500 animate-pulse">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function dashboardForRole(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "FUNCIONARIO" || role === "STAFF") return "/staff";
  if (role === "CLIENTE") return "/cliente";
  return "/";
}

function readRecentIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_BG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeRecentIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RECENT_BG_KEY, JSON.stringify(ids.slice(0, 50)));
  } catch {}
}

async function fetchConstructionPhotos(
  accessKey: string,
  query: string
): Promise<UnsplashPhoto[]> {
  const res = await fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
      query
    )}&orientation=landscape&content_filter=high&count=10&sig=${Date.now()}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Erro API ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

export default function LoginPage() {
  const sp = useSearchParams();
  const nextParam = sp.get("next");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [fe, setFe] = useState<Record<string, string>>({});

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [bgUrl, setBgUrl] = useState("");
  const [bgAuthor, setBgAuthor] = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email é obrigatório";
    if (!password.trim()) e.password = "Senha é obrigatória";
    setFe(e);
    return Object.keys(e).length === 0;
  }

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function carregarImagem() {
      try {
        const recentIds = readRecentIds();
        const query = BG_QUERIES[Math.floor(Math.random() * BG_QUERIES.length)];

        const photos = await fetchConstructionPhotos(UNSPLASH_KEY, query);

        if (!mounted) return;

        const filtered = photos.filter((photo) => {
          if (!photo?.id) return false;
          if (!photo.urls?.regular && !photo.urls?.full) return false;
          if (recentIds.includes(photo.id)) return false;
          return true;
        });

        const selected = filtered[0] || photos[0];

        if (!selected) {
          throw new Error("Nenhuma imagem recebida");
        }

        const nextUrl =
          selected.urls?.regular || selected.urls?.full || FALLBACK_BG;

        setBgUrl(`${nextUrl}${nextUrl.includes("?") ? "&" : "?"}v=${Date.now()}`);
        setBgAuthor(
          selected.user?.name ? `Foto por ${selected.user.name} (Unsplash)` : ""
        );

        const updatedRecent = [selected.id, ...recentIds.filter((id) => id !== selected.id)];
        writeRecentIds(updatedRecent);
      } catch {
        if (!mounted) return;
        setBgUrl(`${FALLBACK_BG}&v=${Date.now()}`);
        setBgAuthor("");
      }
    }

    carregarImagem();

    timer = setInterval(() => {
      carregarImagem();
    }, 60000);

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, []);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setErr("");
    setFe({});

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/proxy/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        try {
          const j = JSON.parse(txt);
          if (j && typeof j === "object" && !Array.isArray(j) && !j.message) {
            setFe(j);
            setErr("Campos inválidos.");
            return;
          }
          if (j?.message) {
            setErr(String(j.message));
            return;
          }
        } catch {}
        setErr(txt || `Erro HTTP ${res.status}`);
        return;
      }

      const data = await res.json();
      const token = data?.token ?? data;

      setSession(token, "CLIENTE");

      let role = "CLIENTE";
      try {
        const meRes = await fetch("/api/proxy/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (meRes.ok) {
          const me = await meRes.json();
          role = me?.role ?? "CLIENTE";
          setSession(token, role);

          const nome = me?.nome ?? "";
          if (nome) localStorage.setItem("me_name", nome);
        }
      } catch {}

      const defaultDash = dashboardForRole(role);

      const next =
        nextParam &&
        nextParam.startsWith("/") &&
        nextParam !== "/" &&
        !nextParam.startsWith("/auth")
          ? nextParam
          : defaultDash;

      location.href = next;
    } catch (e: any) {
      setErr(e?.message ?? "Erro no servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 flex-col justify-between p-12 relative overflow-hidden">
        {bgUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{ backgroundImage: `url(${bgUrl})` }}
          />
        )}

        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo de volta!
            </h2>
            <p className="text-gray-400">
              Introduza os seus dados para aceder à conta
            </p>
          </div>

          {err && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {err}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Endereço de email
              </label>
              <PremiumInput
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                error={fe.email}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Palavra-passe
              </label>
              <PremiumInput
                icon={Lock}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                error={fe.password}
              />
            </div>

            <div className="text-right">
              <a
                href="/auth/reset-password"
                className="text-sm text-gray-400 hover:text-[#FF4500] transition"
              >
                Esqueceu a senha?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-xl bg-[#FF4500] text-white font-semibold hover:bg-[#e03e00] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Não tem uma conta?{" "}
            <a
              href="/auth/register"
              className="text-[#FF4500] font-medium hover:underline"
            >
              Registre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}