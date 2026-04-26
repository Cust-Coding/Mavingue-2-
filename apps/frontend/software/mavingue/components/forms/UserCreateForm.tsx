"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Droplets, Loader2, Shield, UserPlus } from "lucide-react";
import { FieldError } from "@/components/forms/FieldError";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createUser } from "@/features/users/api";
import type { Role, UserCreateFullRequest } from "@/features/users/types";
import { listAddresses } from "@/features/water/api";
import type { AddressItem } from "@/features/water/types";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import {
  normalizeEmail,
  normalizeMozPhone,
  validateConfirmPassword,
  validateManagedClientPassword,
  validateMaxLength,
  validateMozPhone,
  validateOptionalEmail,
  validatePasswordStrength,
  validateRequired,
} from "@/lib/validation/forms";

type Sexo = "HOMEM" | "MULHER";

type FormState = {
  nome: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  sexo: Sexo;
  telefone: string;
  dataNascimento: string;
  provincia: string;
  cidade: string;
  bairro: string;
  elegivelConta: boolean;
  criarContaAgua: boolean;
  referenciaLocal: string;
  houseNR: string;
  adressId: string;
};

type FormField =
  | "nome"
  | "email"
  | "password"
  | "confirmPassword"
  | "role"
  | "sexo"
  | "telefone"
  | "dataNascimento"
  | "provincia"
  | "cidade"
  | "bairro"
  | "referenciaLocal"
  | "houseNR"
  | "adressId";

const initialForm = (role: Role): FormState => ({
  nome: "",
  email: "",
  password: "",
  confirmPassword: "",
  role,
  sexo: "HOMEM",
  telefone: "",
  dataNascimento: "",
  provincia: "",
  cidade: "",
  bairro: "",
  elegivelConta: true,
  criarContaAgua: false,
  referenciaLocal: "",
  houseNR: "",
  adressId: "",
});

interface UserCreateFormProps {
  creatorRole: Role;
  onCreated?: () => void;
}

export default function UserCreateForm({ creatorRole, onCreated }: UserCreateFormProps) {
  const roleOptions = useMemo(() => {
    if (creatorRole === "ADMIN") {
      return ["ADMIN", "FUNCIONARIO", "CLIENTE"] as Role[];
    }

    if (creatorRole === "FUNCIONARIO") {
      return ["FUNCIONARIO", "CLIENTE"] as Role[];
    }

    return [] as Role[];
  }, [creatorRole]);

  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormField, string>>>({});
  const [form, setForm] = useState<FormState>(initialForm(roleOptions[0] ?? "CLIENTE"));

  const isClient = form.role === "CLIENTE";

  useEffect(() => {
    setForm((current) => ({
      ...initialForm(roleOptions[0] ?? "CLIENTE"),
      role: current.role && roleOptions.includes(current.role) ? current.role : roleOptions[0] ?? "CLIENTE",
    }));
  }, [roleOptions]);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoadingAddresses(true);
      try {
        const data = await listAddresses();
        if (active) {
          setAddresses(data);
        }
      } catch {
        if (active) {
          setAddresses([]);
        }
      } finally {
        if (active) {
          setLoadingAddresses(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate() {
    const nextErrors: Partial<Record<FormField, string>> = {};

    nextErrors.nome =
      validateRequired(form.nome, "Nome e obrigatorio.") ||
      validateMaxLength(form.nome, 120, "Nome excede o limite permitido.");

    nextErrors.telefone = validateMozPhone(form.telefone);
    nextErrors.dataNascimento = form.dataNascimento ? "" : "Data de nascimento e obrigatoria.";
    nextErrors.provincia = validateRequired(form.provincia, "Provincia e obrigatoria.");
    nextErrors.cidade = validateRequired(form.cidade, "Cidade e obrigatoria.");
    nextErrors.bairro = validateRequired(form.bairro, "Bairro e obrigatorio.");

    if (isClient) {
      nextErrors.email = validateOptionalEmail(form.email);

      const managedPasswordError = validateManagedClientPassword(form.password, false);
      if (managedPasswordError) {
        nextErrors.password = managedPasswordError;
      } else if (form.password.trim()) {
        nextErrors.confirmPassword = validateConfirmPassword(form.password, form.confirmPassword);
      }

      if (form.criarContaAgua) {
        nextErrors.referenciaLocal =
          validateRequired(form.referenciaLocal, "Referencia do local e obrigatoria.") ||
          validateMaxLength(form.referenciaLocal, 180, "Referencia do local excede o limite permitido.");

        if (form.houseNR.trim() && !form.adressId) {
          nextErrors.adressId = "Seleccione a zona para completar a conta de agua.";
        }

        if (form.adressId && !form.houseNR.trim()) {
          nextErrors.houseNR = "Introduza o numero da casa para activar a conta de agua.";
        }
      }
    } else {
      nextErrors.email =
        validateRequired(form.email, "Email e obrigatorio.") ||
        validateOptionalEmail(form.email);
      nextErrors.password = validatePasswordStrength(form.password);
      nextErrors.confirmPassword = validateConfirmPassword(form.password, form.confirmPassword);
    }

    const cleaned = Object.fromEntries(
      Object.entries(nextErrors).filter(([, value]) => value)
    ) as Partial<Record<FormField, string>>;

    setFieldErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess("");
    setError("");
    setFieldErrors({});

    if (!validate()) return;

    const payload: UserCreateFullRequest = {
      nome: form.nome.trim(),
      email: form.email.trim() ? normalizeEmail(form.email) : null,
      password: form.password.trim() ? form.password : null,
      role: form.role,
      sexo: form.sexo,
      telefone: normalizeMozPhone(form.telefone),
      dataNascimento: form.dataNascimento,
      provincia: form.provincia.trim(),
      cidade: form.cidade.trim(),
      bairro: form.bairro.trim(),
      elegivelConta: isClient ? form.elegivelConta : undefined,
      criarContaAgua: isClient ? form.criarContaAgua : undefined,
      referenciaLocal: isClient && form.criarContaAgua ? form.referenciaLocal.trim() || null : null,
      houseNR: isClient && form.criarContaAgua ? form.houseNR.trim() || null : null,
      adressId: isClient && form.criarContaAgua && form.adressId ? Number(form.adressId) : null,
    };

    setLoading(true);
    try {
      const created = await createUser(payload);
      setSuccess(
        created.role === "CLIENTE" && !payload.password
          ? "Conta criada com sucesso. A senha inicial do cliente e 1234."
          : "Conta criada com sucesso."
      );
      setForm(initialForm(roleOptions[0] ?? "CLIENTE"));
      onCreated?.();
    } catch (reason) {
      const apiErrors = getFieldErrors(reason);
      setFieldErrors((current) => ({
        ...current,
        nome: apiErrors.nome ?? current.nome,
        email: apiErrors.email ?? current.email,
        password: apiErrors.password ?? current.password,
        role: apiErrors.role ?? current.role,
        telefone: apiErrors.telefone ?? current.telefone,
        dataNascimento: apiErrors.dataNascimento ?? current.dataNascimento,
        provincia: apiErrors.provincia ?? current.provincia,
        cidade: apiErrors.cidade ?? current.cidade,
        bairro: apiErrors.bairro ?? current.bairro,
        referenciaLocal: apiErrors.referenciaLocal ?? current.referenciaLocal,
        houseNR: apiErrors.houseNR ?? current.houseNR,
        adressId: apiErrors.adressId ?? current.adressId,
      }));
      setError(getErrorMessage(reason, "Nao foi possivel criar a conta."));
    } finally {
      setLoading(false);
    }
  }

  if (!roleOptions.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Esta conta nao tem permissao para criar novos utilizadores.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Tipo de conta</label>
          <div className="relative">
            <Shield className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={form.role}
              onChange={(event) => setField("role", event.target.value as Role)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role === "ADMIN" ? "Administrador" : role === "FUNCIONARIO" ? "Funcionario" : "Cliente"}
                </option>
              ))}
            </select>
          </div>
          <FieldError message={fieldErrors.role} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Sexo</label>
          <select
            value={form.sexo}
            onChange={(event) => setField("sexo", event.target.value as Sexo)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          >
            <option value="HOMEM">Homem</option>
            <option value="MULHER">Mulher</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Nome completo</label>
          <Input
            value={form.nome}
            onChange={(event) => setField("nome", event.target.value)}
            className="h-12 rounded-2xl border-slate-200 px-4"
            placeholder="Nome completo"
          />
          <FieldError message={fieldErrors.nome} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Telefone</label>
          <Input
            value={form.telefone}
            onChange={(event) => setField("telefone", event.target.value)}
            className="h-12 rounded-2xl border-slate-200 px-4"
            placeholder="84 123 4567"
          />
          <FieldError message={fieldErrors.telefone} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {isClient ? "Email opcional" : "Email"}
          </label>
          <Input
            value={form.email}
            onChange={(event) => setField("email", event.target.value)}
            type="email"
            className="h-12 rounded-2xl border-slate-200 px-4"
            placeholder="exemplo@email.com"
          />
          <FieldError message={fieldErrors.email} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Senha</label>
          <Input
            value={form.password}
            onChange={(event) => setField("password", event.target.value)}
            type="password"
            className="h-12 rounded-2xl border-slate-200 px-4"
            placeholder={isClient ? "Deixe vazio para usar 1234" : "Pelo menos 6 caracteres"}
          />
          <FieldError message={fieldErrors.password} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Confirmar senha
          </label>
          <Input
            value={form.confirmPassword}
            onChange={(event) => setField("confirmPassword", event.target.value)}
            type="password"
            className="h-12 rounded-2xl border-slate-200 px-4"
            placeholder={isClient && !form.password.trim() ? "Nao obrigatorio se usar 1234" : "Repita a senha"}
          />
          <FieldError message={fieldErrors.confirmPassword} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Data de nascimento</label>
          <Input
            value={form.dataNascimento}
            onChange={(event) => setField("dataNascimento", event.target.value)}
            type="date"
            className="h-12 rounded-2xl border-slate-200 px-4"
          />
          <FieldError message={fieldErrors.dataNascimento} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Provincia</label>
          <Input
            value={form.provincia}
            onChange={(event) => setField("provincia", event.target.value)}
            className="h-12 rounded-2xl border-slate-200 px-4"
            placeholder="Provincia"
          />
          <FieldError message={fieldErrors.provincia} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Cidade</label>
          <Input
            value={form.cidade}
            onChange={(event) => setField("cidade", event.target.value)}
            className="h-12 rounded-2xl border-slate-200 px-4"
            placeholder="Cidade"
          />
          <FieldError message={fieldErrors.cidade} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Bairro</label>
          <Input
            value={form.bairro}
            onChange={(event) => setField("bairro", event.target.value)}
            className="h-12 rounded-2xl border-slate-200 px-4"
            placeholder="Bairro"
          />
          <FieldError message={fieldErrors.bairro} />
        </div>
      </div>

      {isClient && (
        <div className="space-y-4 rounded-3xl border border-cyan-100 bg-cyan-50/70 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-cyan-100 p-2 text-cyan-700">
              <Droplets className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Conta de cliente e agua</h3>
              <p className="mt-1 text-sm text-slate-600">
                O cadastro do cliente pode ser criado com senha padrao `1234` e, se quiseres, ja fica associado ao servico de agua.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.elegivelConta}
                onChange={(event) => setField("elegivelConta", event.target.checked)}
              />
              Cliente elegivel para conta e sincronizacao
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.criarContaAgua}
                onChange={(event) => setField("criarContaAgua", event.target.checked)}
              />
              Criar conta de agua agora
            </label>
          </div>

          {form.criarContaAgua && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Referencia do local</label>
                <Input
                  value={form.referenciaLocal}
                  onChange={(event) => setField("referenciaLocal", event.target.value)}
                  className="h-12 rounded-2xl border-slate-200 px-4"
                  placeholder="Ex.: Casa da Matola, quarteirao 7"
                />
                <FieldError message={fieldErrors.referenciaLocal} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Numero da casa</label>
                <Input
                  value={form.houseNR}
                  onChange={(event) => setField("houseNR", event.target.value)}
                  className="h-12 rounded-2xl border-slate-200 px-4"
                  placeholder="Opcional se ainda nao definido"
                />
                <FieldError message={fieldErrors.houseNR} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Zona</label>
                <select
                  value={form.adressId}
                  onChange={(event) => setField("adressId", event.target.value)}
                  disabled={loadingAddresses}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
                >
                  <option value="">{loadingAddresses ? "A carregar zonas..." : "Seleccionar zona"}</option>
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.name} - {address.bairro}
                    </option>
                  ))}
                </select>
                <FieldError message={fieldErrors.adressId} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="h-12 rounded-2xl bg-orange-600 px-5 text-sm font-semibold text-white hover:bg-orange-700"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {loading ? "A criar..." : "Criar utilizador"}
        </Button>
      </div>
    </form>
  );
}
