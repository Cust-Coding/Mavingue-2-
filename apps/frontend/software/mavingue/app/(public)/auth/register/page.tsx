"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { setSession } from "@/lib/auth/session";

type Sexo = "HOMEM" | "MULHER";
type TipoDocumento = "BI" | "PASSAPORTE" | "DIRE";

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
  endereco: string;
  nuit: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
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

function normalizeRole(role: unknown) {
  if (typeof role !== "string" || !role.trim()) return "CLIENTE";
  return role.toUpperCase();
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

export default function App() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [fe, setFe] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    endereco: "",
    nuit: "",
    tipoDocumento: "BI",
    numeroDocumento: "",
  });

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function validate() {
    const e: FieldErrors = {};

    if (!form.nome.trim()) e.nome = "Campo obrigatório";
    if (!form.telefone.trim()) e.telefone = "Campo obrigatório";
    if (!form.email.trim()) e.email = "Campo obrigatório";
    if (!form.password.trim() || form.password.length < 6)
      e.password = "Mín. 6 caracteres";
    if (form.confirmPassword !== form.password) e.confirmPassword = "Divergente";
    if (!form.dataNascimento) e.dataNascimento = "Obrigatório";
    if (!form.provincia.trim()) e.provincia = "Obrigatório";
    if (!form.cidade.trim()) e.cidade = "Obrigatório";
    if (!form.bairro.trim()) e.bairro = "Obrigatório";
    if (!form.endereco.trim()) e.endereco = "Obrigatório";
    if (!form.numeroDocumento.trim()) e.numeroDocumento = "Obrigatório";

    setFe(e);
    return Object.keys(e).length === 0;
  }

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
          endereco: form.endereco.trim(),
          nuit: form.nuit.trim() || null,
          tipoDocumento: form.tipoDocumento,
          numeroDocumento: form.numeroDocumento.trim(),
        }),
      });

      const rawText = await res.text().catch(() => "");

      if (!res.ok) {
        const parsed = parseServerErrorText(rawText);

        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setFe(parsed as FieldErrors);
          setErr("Há campos inválidos.");
          return;
        }

        setErr(typeof parsed === "string" ? parsed : `Erro HTTP ${res.status}`);
        return;
      }

      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = rawText;
      }

      const token =
        typeof data === "string"
          ? data
          : data?.token ?? data?.accessToken ?? data?.jwt ?? null;

      if (!token) {
        setErr("Registo feito, mas o token não foi devolvido pelo servidor.");
        return;
      }

      setSession(token, "CLIENTE");

      try {
        const meRes = await fetch("/api/proxy/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (meRes.ok) {
          const me = await meRes.json().catch(() => null);
          const role = normalizeRole(me?.role ?? me?.perfil ?? "CLIENTE");
          setSession(token, role);
        }
      } catch {
        // mantém a sessão já gravada
      }

      setOk("Conta criada e login feito. A entrar...");
      setTimeout(() => {
        window.location.href = "/cliente";
      }, 600);
    } catch (e: any) {
      setErr(e?.message ?? "Falha ao comunicar com servidor");
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
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />

          <div className="relative z-10">
            <div className="mt-24 max-w-md">
              <h1 className="text-[54px] font-[800] leading-[1] tracking-tighter text-gray-900 mb-8">
                Plataforma de <br />
                <span className="text-[#EF6A44]">Gestão</span> de Stock
              </h1>

              <p className="text-lg text-gray-400 font-medium leading-relaxed">
                Seja para equipar a sua obra com materiais de construção de qualidade ou
                para gerir o consumo de água da sua residência, estamos aqui para facilitar
                o seu dia a dia.
              </p>

              <p className="text-lg text-gray-400 font-medium leading-relaxed mt-4">
                Através desta plataforma, terá total transparência e controlo sobre as suas
                compras e faturas, tudo a partir de um único lugar.
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
                ENTRAR
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
                  Informação Básica
                </h3>

                <Field label="Nome Completo" error={fe.nome}>
                  <Input
                    icon={User}
                    placeholder="Como devemos chamar-te?"
                    value={form.nome}
                    onChange={(e) => setField("nome", e.target.value)}
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="E-mail Corporativo" error={fe.email}>
                    <Input
                      icon={Mail}
                      placeholder="teu@email.com"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                    />
                  </Field>

                  <Field label="Contacto Telefónico" error={fe.telefone}>
                    <Input
                      icon={Phone}
                      placeholder="+258 --- --- ---"
                      value={form.telefone}
                      onChange={(e) => setField("telefone", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Género" error={fe.sexo}>
                    <ToggleSelector
                      value={form.sexo}
                      onChange={(v) => setField("sexo", v)}
                      options={[
                        { label: "Homem", val: "HOMEM" },
                        { label: "Mulher", val: "MULHER" },
                      ]}
                    />
                  </Field>

                  <Field label="Data de Nascimento" error={fe.dataNascimento}>
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
                  Segurança da Conta
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Palavra-passe" error={fe.password}>
                    <Input
                      icon={Lock}
                      type={showPassword ? "text" : "password"}
                      placeholder="Mín. 6 chars"
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

                  <Field label="Validar Senha" error={fe.confirmPassword}>
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
                  Localização
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Província" error={fe.provincia}>
                    <Input
                      icon={MapPin}
                      placeholder="Província"
                      value={form.provincia}
                      onChange={(e) => setField("provincia", e.target.value)}
                    />
                  </Field>

                  <Field label="Cidade" error={fe.cidade}>
                    <Input
                      placeholder="Cidade"
                      value={form.cidade}
                      onChange={(e) => setField("cidade", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Bairro" error={fe.bairro}>
                    <Input
                      placeholder="Bairro"
                      value={form.bairro}
                      onChange={(e) => setField("bairro", e.target.value)}
                    />
                  </Field>

                  <Field label="Morada Completa" error={fe.endereco}>
                    <Input
                      placeholder="Rua, Casa, nº..."
                      value={form.endereco}
                      onChange={(e) => setField("endereco", e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-gray-300 uppercase tracking-[3px] mb-8">
                  Identificação Fiscal
                </h3>

                <Field label="Nuit (Opcional)" error={fe.nuit}>
                  <Input
                    icon={FileText}
                    placeholder="Seu NUIT"
                    value={form.nuit}
                    onChange={(e) => setField("nuit", e.target.value)}
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Tipo Documento" error={fe.tipoDocumento}>
                    <ToggleSelector
                      value={form.tipoDocumento}
                      onChange={(v) => setField("tipoDocumento", v)}
                      options={[
                        { label: "B.I", val: "BI" },
                        { label: "Passaporte", val: "PASSAPORTE" },
                        { label: "DIRE", val: "DIRE" },
                      ]}
                    />
                  </Field>

                  <Field label="Nº do Documento" error={fe.numeroDocumento}>
                    <Input
                      placeholder="Número"
                      value={form.numeroDocumento}
                      onChange={(e) => setField("numeroDocumento", e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              <div className="py-12 flex flex-col gap-8">
                <Button type="submit" disabled={loading} loading={loading}>
                  CRIAR CONTA AGORA
                </Button>

                <p className="text-center font-bold text-sm text-gray-400">
                  Já é parceiro?{" "}
                  <a
                    href="/login"
                    className="text-[#EF6A44] hover:brightness-110 transition-all underline underline-offset-8 decoration-2"
                  >
                    ENTRAR NO SISTEMA
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