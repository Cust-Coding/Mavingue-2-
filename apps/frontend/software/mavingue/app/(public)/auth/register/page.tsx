"use client";

import React, { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

type Sexo = "HOMEM" | "MULHER";

type FormState = {
  nome: string;
  sexo: Sexo;
  telefone: string;
  email: string;
  password: string;
  confirmPassword: string;
  dataNascimento: string;
  provincia: string;
  cidade: string;
  bairro: string;
  pedirAgua: "SIM" | "NAO";
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ElementType;
  rightIcon?: React.ReactNode;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", icon: Icon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative flex items-center group w-full transition-all duration-300">
        {Icon && (
          <Icon className="absolute left-4 text-gray-400 group-focus-within:text-[#EF6A44] w-[18px] h-[18px] transition-colors duration-300 z-10" />
        )}

        <input
          ref={ref}
          className={`w-full h-[56px] bg-white border border-gray-100 rounded-2xl text-[15px] text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#EF6A44]/10 focus:border-[#EF6A44] transition-all duration-300 placeholder:text-gray-300 font-medium shadow-sm shadow-black/[0.02] ${Icon ? "pl-12" : "px-5"
            } ${rightIcon ? "pr-12" : ""} ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-4 text-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center z-10">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

const Button = ({
  children,
  className = "",
  loading,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`group relative overflow-hidden w-full h-[58px] bg-[#EF6A44] text-white font-bold text-[16px] rounded-2xl shadow-xl shadow-[#EF6A44]/20 hover:shadow-[#EF6A44]/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-500 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <span className="flex items-center gap-2 relative z-10">
          {children}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      )}
    </button>
  );
};

function ToggleSelector({
  options,
  value,
  onChange,
}: {
  options: { label: string; val: string }[];
  value: string;
  onChange: (v: any) => void;
}) {
  return (
    <div
      className="grid gap-2 p-1.5 bg-gray-100/50 rounded-2xl border border-gray-100"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.val}
          type="button"
          onClick={() => onChange(opt.val)}
          className={`h-11 rounded-xl text-[13px] font-bold transition-all duration-300 ${value === opt.val
              ? "bg-white text-[#EF6A44] shadow-md"
              : "text-gray-500 hover:text-gray-700"
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[13px] font-bold text-gray-800 tracking-wider uppercase opacity-70 ml-1">
        {label}
      </label>
      {children}
      {error && (
        <span className="text-[12px] text-red-500 font-bold flex items-center gap-1.5 ml-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </span>
      )}
    </div>
  );
}

function parseServerErrorText(text: string) {
  if (!text) return "Erro ao processar o seu pedido.";

  try {
    const json = JSON.parse(text);

    if (json && typeof json === "object" && !Array.isArray(json)) {
      if (json.message) return String(json.message);
      return json;
    }

    return String(json);
  } catch {
    return text;
  }
}

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
const RECENT_BG_KEY = "register_recent_unsplash_bg_ids";

const FALLBACK_BG =
  "https://images.unsplash.com/photo-1581091215367-3c4d4b6f7c71?auto=format&fit=crop&w=1600&q=80";

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
  } catch { }
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

export default function RegisterPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [fe, setFe] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [bgUrl, setBgUrl] = useState("");
  const [bgAuthor, setBgAuthor] = useState("");

  const [form, setForm] = useState<FormState>({
    nome: "",
    sexo: "HOMEM",
    telefone: "",
    email: "",
    password: "",
    confirmPassword: "",
    dataNascimento: "",
    provincia: "",
    cidade: "",
    bairro: "",
    pedirAgua: "NAO",
  });

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function validate() {
    const e: FieldErrors = {};

    if (!form.nome.trim()) e.nome = t("form.errors.nameRequired");
    if (!form.telefone.trim()) e.telefone = t("form.errors.phoneRequired");
    if (!form.email.trim()) {
      e.email = t("form.errors.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = t("form.errors.invalidEmail");
    }
    if (!form.password.trim() || form.password.length < 6)
      e.password = t("auth.passwordRequired");
    if (form.confirmPassword !== form.password) e.confirmPassword = t("auth.passwordRequired");
    if (!form.dataNascimento) e.dataNascimento = t("form.errors.birthdateRequired");
    if (!form.provincia.trim()) e.provincia = t("form.errors.provinceRequired");
    if (!form.cidade.trim()) e.cidade = t("form.errors.cityRequired");
    if (!form.bairro.trim()) e.bairro = t("form.errors.neighborhoodRequired");

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

        const selected = filtered[Math.floor(Math.random() * filtered.length)] || photos[0];

        if (!selected) {
          throw new Error("No image received");
        }

        const nextUrl = selected.urls?.regular || selected.urls?.full || FALLBACK_BG;

        setBgUrl(`${nextUrl}${nextUrl.includes("?") ? "&" : "?"}v=${Date.now()}`);
        setBgAuthor(
          selected.user?.name ? t("common.photoBy", { name: selected.user.name }) : ""
        );

        const updatedRecent = [
          selected.id,
          ...recentIds.filter((id) => id !== selected.id),
        ];
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
    setOk("");
    setFe({});

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/proxy/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          sexo: form.sexo,
          telefone: form.telefone.trim(),
          email: form.email.trim(),
          password: form.password,
          dataNascimento: form.dataNascimento,
          provincia: form.provincia.trim(),
          cidade: form.cidade.trim(),
          bairro: form.bairro.trim(),
          pedirAgua: form.pedirAgua === "SIM",
          // WORKAROUND: Campos que o backend antigo ainda espera
          endereco: form.bairro.trim() || "Sem endereço",
          nuit: null,
          tipoDocumento: "BI",
          numeroDocumento: null,
        }),
      });

      const rawText = await res.text().catch(() => "");

      if (!res.ok) {
        const parsed = parseServerErrorText(rawText);

        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setFe(parsed as FieldErrors);
          setErr(t("auth.invalidFields"));
          return;
        }

        setErr(typeof parsed === "string" ? parsed : `HTTP Error ${res.status}`);
        return;
      }

      setOk(rawText || t("auth.codeSentDesc"));
      setTimeout(() => {
        window.location.href = `/auth/confirm-email?email=${encodeURIComponent(form.email.trim())}`;
      }, 2000);
    } catch (e: any) {
      setErr(e?.message ?? t("auth.serverError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
            body { font-family: 'Montserrat', sans-serif; background: #fff; }
            .hide-scroll::-webkit-scrollbar { display: none; }
            .premium-bg { background: radial-gradient(circle at top right, #fef2f2 0%, #ffffff 100%); }

            input[type="date"]::-webkit-calendar-picker-indicator {
              background: transparent;
              bottom: 0;
              color: transparent;
              cursor: pointer;
              height: auto;
              left: 0;
              position: absolute;
              right: 0;
              top: 0;
              width: auto;
            }
            input[type="date"]::-webkit-inner-spin-button,
            input[type="date"]::-webkit-clear-button {
              display: none;
              -webkit-appearance: none;
            }
          `,
        }}
      />

      <div className="min-h-screen flex flex-col lg:flex-row premium-bg selection:bg-[#EF6A44]/20 selection:text-[#EF6A44]">
        <div className="hidden lg:flex lg:w-5/12 p-16 flex-col justify-between relative overflow-hidden bg-white">
          {bgUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
              style={{ backgroundImage: `url(${bgUrl})` }}
            />
          )}

          <div className="absolute inset-0 bg-black/35" />

          <div className="relative z-10">
            <div className="mt-24 max-w-md">
              <h1 className="text-[54px] font-[800] leading-[1] tracking-tighter text-white mb-8">
                {t("services.stock.title")}
              </h1>

              <p className="text-lg text-gray-200 font-medium leading-relaxed">
                {t("landing.featureDescription")}
              </p>
            </div>
          </div>

          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#EF6A44]/5 rounded-full blur-[120px]" />
        </div>

        <div className="w-full lg:w-7/12 flex justify-center h-screen overflow-y-auto hide-scroll lg:p-12 p-6">
          <div className="w-full max-w-[600px] flex flex-col">
            <div className="lg:hidden flex justify-between items-center mb-12">
              <div className="w-12 h-12 bg-[#EF6A44] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                P
              </div>
              <a href="/login" className="text-sm font-bold text-[#EF6A44]">
                {t("auth.login").toUpperCase()}
              </a>
            </div>

            <div className="fixed top-8 right-8 z-[100] flex flex-col gap-4 max-w-sm w-full pointer-events-none px-6">
              {err && (
                <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-red-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-4 pointer-events-auto border-l-4 border-l-red-500">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-gray-800">{err}</p>
                </div>
              )}

              {ok && (
                <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-emerald-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-4 pointer-events-auto border-l-4 border-l-emerald-500">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-gray-800">{ok}</p>
                </div>
              )}
            </div>

            <form onSubmit={submit} className="flex flex-col gap-10">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-gray-300 uppercase tracking-[3px] mb-8">
                  {t("form.sections.basicInfo")}
                </h3>

                <Field label={t("auth.fullName")} error={fe.nome}>
                  <Input
                    icon={User}
                    placeholder={t("form.placeholders.fullName")}
                    value={form.nome}
                    onChange={(e) => setField("nome", e.target.value)}
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label={t("form.labels.corporateEmail")} error={fe.email}>
                    <Input
                      icon={Mail}
                      placeholder={t("form.placeholders.email")}
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                    />
                  </Field>

                  <Field label={t("auth.phone")} error={fe.telefone}>
                    <Input
                      icon={Phone}
                      placeholder="+258 --- --- ---"
                      value={form.telefone}
                      onChange={(e) => setField("telefone", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label={t("form.labels.gender")} error={fe.sexo}>
                    <ToggleSelector
                      value={form.sexo}
                      onChange={(v) => setField("sexo", v)}
                      options={[
                        { label: t("form.genders.male"), val: "HOMEM" },
                        { label: t("form.genders.female"), val: "MULHER" },
                      ]}
                    />
                  </Field>

                  <Field label={t("form.labels.birthdate")} error={fe.dataNascimento}>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EF6A44] w-[18px] h-[18px] transition-colors duration-300 z-10" />
                      <input
                        type="date"
                        value={form.dataNascimento}
                        onChange={(e) => setField("dataNascimento", e.target.value)}
                        className="w-full h-[56px] bg-white border border-gray-100 rounded-2xl text-[15px] text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#EF6A44]/10 focus:border-[#EF6A44] transition-all duration-300 pl-12 pr-5 font-medium shadow-sm shadow-black/[0.02]"
                      />
                    </div>
                  </Field>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-gray-300 uppercase tracking-[3px] mb-8">
                  {t("form.sections.accountSecurity")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label={t("form.labels.password")} error={fe.password}>
                    <Input
                      icon={Lock}
                      type={showPassword ? "text" : "password"}
                      placeholder={t("auth.passwordRequired")}
                      value={form.password}
                      onChange={(e) => setField("password", e.target.value)}
                      rightIcon={
                        showPassword ? (
                          <button
                            type="button"
                            onClick={() => setShowPassword(false)}
                            className="cursor-pointer"
                          >
                            <EyeOff className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowPassword(true)}
                            className="cursor-pointer"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )
                      }
                    />
                  </Field>

                  <Field label={t("form.labels.confirmPassword")} error={fe.confirmPassword}>
                    <Input
                      icon={Lock}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repita a senha"
                      value={form.confirmPassword}
                      onChange={(e) => setField("confirmPassword", e.target.value)}
                      rightIcon={
                        showConfirmPassword ? (
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(false)}
                            className="cursor-pointer"
                          >
                            <EyeOff className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(true)}
                            className="cursor-pointer"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )
                      }
                    />
                  </Field>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-gray-300 uppercase tracking-[3px] mb-8">
                  {t("form.sections.location")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label={t("form.errors.provinceRequired").split(" ")[0]} error={fe.provincia}>
                    <Input
                      icon={MapPin}
                      placeholder={t("form.errors.provinceRequired").split(" ")[0]}
                      value={form.provincia}
                      onChange={(e) => setField("provincia", e.target.value)}
                    />
                  </Field>

                  <Field label={t("form.errors.cityRequired").split(" ")[0]} error={fe.cidade}>
                    <Input
                      placeholder={t("form.errors.cityRequired").split(" ")[0]}
                      value={form.cidade}
                      onChange={(e) => setField("cidade", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label={t("Bairro")} error={fe.bairro}>
                    <Input
                      placeholder={t("form.placeholders.neighborhood")}
                      value={form.bairro}
                      onChange={(e) => setField("bairro", e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-gray-300 uppercase tracking-[3px] mb-8">
                  Pedido de Agua
                </h3>

                <Field label="Pretende activar o servico de agua depois do cadastro?">
                  <ToggleSelector
                    value={form.pedirAgua}
                    onChange={(v) => setField("pedirAgua", v)}
                    options={[
                      { label: "Nao", val: "NAO" },
                      { label: "Sim", val: "SIM" },
                    ]}
                  />
                </Field>

                <p className="text-sm leading-7 text-gray-500">
                  Se escolher "Sim", o pedido fica pendente para aprovacao do administrador. Depois disso vai poder completar os dados da casa na sua area e, se precisar, pedir outras contas de agua para mais casas.
                </p>
              </div>

              <div className="py-12 flex flex-col gap-8">
                <Button type="submit" disabled={loading} loading={loading}>
                  {t("auth.registerButton").toUpperCase()}
                </Button>

                <p className="text-center font-bold text-sm text-gray-400">
                  {t("auth.alreadyPartner")}{" "}
                  <a
                    href="/auth/login"
                    className="text-[#EF6A44] hover:brightness-110 transition-all underline underline-offset-8 decoration-2"
                  >
                    {t("auth.loginSystem")}
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}