"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound, Save, ShieldCheck } from "lucide-react";
import { FieldError } from "@/components/forms/FieldError";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  getUser,
  getUserPermissions,
  listPermissionCatalog,
  resetUserPassword,
  updateUser,
  updateUserPermissions,
  updateUserStatus,
} from "@/features/users/api";
import type { PermissionDefinition, Role, UserResponse, UserStatus, UserUpdateRequest } from "@/features/users/types";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import { getSessionUser } from "@/lib/auth/session";
import {
  normalizeEmail,
  normalizeMozPhone,
  validateManagedClientPassword,
  validateMozPhone,
  validateOptionalEmail,
  validatePasswordStrength,
  validateRequired,
} from "@/lib/validation/forms";

type Scope = "admin" | "staff";

type FormState = {
  nome: string;
  email: string;
  phone: string;
  role: Role;
  password: string;
};

type FormField = keyof FormState;

const statusOptions: UserStatus[] = ["ATIVO", "PENDENTE_REVISAO", "PENDENTE_VERIFICACAO", "INATIVO"];

function statusLabel(status: UserStatus) {
  switch (status) {
    case "ATIVO":
      return "Activo";
    case "INATIVO":
      return "Inactivo";
    case "PENDENTE_REVISAO":
      return "Pendente da equipa";
    case "PENDENTE_VERIFICACAO":
      return "Pendente por email";
    default:
      return status;
  }
}

export function UserDetailPage({ scope, userId }: { scope: Scope; userId: number }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [catalog, setCatalog] = useState<PermissionDefinition[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>({
    nome: "",
    email: "",
    phone: "",
    role: "CLIENTE",
    password: "",
  });
  const [customResetPassword, setCustomResetPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormField, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sessionUser = useMemo(() => getSessionUser(), []);
  const canVerify = sessionUser?.role === "ADMIN" || sessionUser?.permissions.includes("users.verify");
  const canReset = sessionUser?.role === "ADMIN" || sessionUser?.permissions.includes("users.reset-password");
  const canManagePermissions =
    sessionUser?.role === "ADMIN" || sessionUser?.permissions.includes("users.permissions.manage");
  const canManageUsers = sessionUser?.role === "ADMIN" || sessionUser?.permissions.includes("users.manage");
  const listPath = scope === "admin" ? "/admin/utilizadores" : "/staff/utilizadores";

  const groupedCatalog = useMemo(() => {
    return catalog.reduce<Record<string, PermissionDefinition[]>>((acc, item) => {
      acc[item.group] = acc[item.group] ?? [];
      acc[item.group].push(item);
      return acc;
    }, {});
  }, [catalog]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [userData, permissionRows, userPermissionRows] = await Promise.all([
        getUser(userId),
        canManagePermissions ? listPermissionCatalog() : Promise.resolve([]),
        canManagePermissions ? getUserPermissions(userId) : Promise.resolve([]),
      ]);

      setUser(userData);
      setCatalog(permissionRows);
      setSelectedPermissions(userPermissionRows);
      setForm({
        nome: userData.nome,
        email: userData.email ?? "",
        phone: userData.phone,
        role: userData.role,
        password: "",
      });
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar o utilizador."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [userId]);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate() {
    if (!user) return false;

    const nextErrors: Partial<Record<FormField, string>> = {};
    const isClient = form.role === "CLIENTE";

    nextErrors.nome = validateRequired(form.nome, "Nome e obrigatorio.");
    nextErrors.phone = validateMozPhone(form.phone);
    nextErrors.email = isClient
      ? validateOptionalEmail(form.email)
      : validateRequired(form.email, "Email e obrigatorio.") || validateOptionalEmail(form.email);

    if (form.password.trim()) {
      nextErrors.password = isClient
        ? validateManagedClientPassword(form.password, false)
        : validatePasswordStrength(form.password);
    }

    const cleaned = Object.fromEntries(
      Object.entries(nextErrors).filter(([, value]) => value)
    ) as Partial<Record<FormField, string>>;

    setFieldErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  }

  async function handleSave() {
    if (!user || !validate()) return;

    const payload: UserUpdateRequest = {
      nome: form.nome.trim(),
      email: form.email.trim() ? normalizeEmail(form.email) : null,
      phone: normalizeMozPhone(form.phone),
      role: form.role,
      password: form.password.trim() || undefined,
    };

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateUser(user.id, payload);
      setUser(updated);
      setSelectedPermissions(Array.from(updated.permissions ?? []));
      setForm((current) => ({ ...current, password: "" }));
      setSuccess("Dados da conta actualizados com sucesso.");
    } catch (reason) {
      const apiErrors = getFieldErrors(reason);
      setFieldErrors((current) => ({
        ...current,
        nome: apiErrors.nome ?? current.nome,
        email: apiErrors.email ?? current.email,
        phone: apiErrors.phone ?? apiErrors.telefone ?? current.phone,
        password: apiErrors.password ?? current.password,
      }));
      setError(getErrorMessage(reason, "Nao foi possivel actualizar o utilizador."));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(status: UserStatus) {
    if (!user) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateUserStatus(user.id, status);
      setUser(updated);
      setSuccess("Estado actualizado com sucesso.");
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel actualizar o estado."));
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword(useCustom = false) {
    if (!user) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await resetUserPassword(user.id, useCustom ? customResetPassword : undefined);
      setCustomResetPassword("");
      setSuccess(
        useCustom
          ? "Senha redefinida com o valor informado."
          : "Senha redefinida com sucesso. O novo valor e 1234."
      );
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel redefinir a senha."));
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePermissions() {
    if (!user) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateUserPermissions(user.id, selectedPermissions);
      setUser(updated);
      setSuccess("Permissoes actualizadas com sucesso.");
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel actualizar as permissoes."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">A carregar utilizador...</div>;
  }

  if (!user) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-sm text-red-700">Utilizador nao encontrado.</div>;
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Conta</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{user.nome}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Gere perfil, estado da conta, redefinicao de senha e, no caso de funcionarios, as permissoes individuais.
            </p>
          </div>

          <Link
            href={listPath}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Voltar a lista
          </Link>
        </div>
      </section>

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

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Dados principais</h2>
              <p className="text-sm text-slate-500">Actualiza a conta sem misturar com a gestao de permissoes.</p>
            </div>
            {canManageUsers && (
              <Button type="button" onClick={handleSave} disabled={saving} className="bg-orange-600 text-white hover:bg-orange-700">
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Nome completo</label>
              <Input
                value={form.nome}
                onChange={(event) => setField("nome", event.target.value)}
                disabled={!canManageUsers}
                className="h-12 rounded-2xl border-slate-200 px-4"
              />
              <FieldError message={fieldErrors.nome} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <Input
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                disabled={!canManageUsers}
                className="h-12 rounded-2xl border-slate-200 px-4"
              />
              <FieldError message={fieldErrors.email} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Telefone</label>
              <Input
                value={form.phone}
                onChange={(event) => setField("phone", event.target.value)}
                disabled={!canManageUsers}
                className="h-12 rounded-2xl border-slate-200 px-4"
              />
              <FieldError message={fieldErrors.phone} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Tipo de conta</label>
              <select
                value={form.role}
                onChange={(event) => setField("role", event.target.value as Role)}
                disabled={!canManageUsers}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
              >
                <option value="ADMIN">Administrador</option>
                <option value="FUNCIONARIO">Funcionario</option>
                <option value="CLIENTE">Cliente</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nova senha {user.role === "CLIENTE" ? "(opcional, minimo 4)" : "(opcional)"}
              </label>
              <Input
                value={form.password}
                onChange={(event) => setField("password", event.target.value)}
                type="password"
                disabled={!canManageUsers}
                className="h-12 rounded-2xl border-slate-200 px-4"
                placeholder="Deixe vazio para manter a actual"
              />
              <FieldError message={fieldErrors.password} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Estado da conta</h2>
            <p className="mt-1 text-sm text-slate-500">Estado actual: {statusLabel(user.status)}</p>

            {canVerify && (
              <div className="mt-4 grid gap-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant={user.status === status ? "default" : "outline"}
                    disabled={saving}
                    onClick={() => handleStatus(status)}
                    className={user.status === status ? "bg-slate-900 text-white hover:bg-slate-800" : ""}
                  >
                    {statusLabel(status)}
                  </Button>
                ))}
              </div>
            )}
          </section>

          {canReset && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-orange-600" />
                <h2 className="text-lg font-semibold text-slate-900">Redefinir senha</h2>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Para contas de cliente criadas pela equipa, o valor padrao recomendado continua a ser 1234.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button type="button" variant="outline" disabled={saving} onClick={() => handleResetPassword(false)}>
                  Resetar para 1234
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                <Input
                  value={customResetPassword}
                  onChange={(event) => setCustomResetPassword(event.target.value)}
                  type="password"
                  className="h-12 rounded-2xl border-slate-200 px-4"
                  placeholder="Ou define uma senha manual"
                />
                <Button
                  type="button"
                  disabled={saving || !customResetPassword.trim()}
                  onClick={() => handleResetPassword(true)}
                  className="bg-orange-600 text-white hover:bg-orange-700"
                >
                  Aplicar senha manual
                </Button>
              </div>
            </section>
          )}
        </div>
      </section>

      {canManagePermissions && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-orange-600" />
                <h2 className="text-lg font-semibold text-slate-900">Permissoes do sistema</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                O catalogo abaixo mostra todas as permissoes disponiveis. Apenas funcionarios recebem atribuicoes individuais.
              </p>
            </div>

            {user.role === "FUNCIONARIO" && (
              <Button type="button" disabled={saving} onClick={handleSavePermissions} className="bg-orange-600 text-white hover:bg-orange-700">
                Guardar permissoes
              </Button>
            )}
          </div>

          {user.role !== "FUNCIONARIO" ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              {user.role === "ADMIN"
                ? "Administradores herdam controlo total do sistema."
                : "Clientes nao usam permissoes operacionais individuais."}
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {Object.entries(groupedCatalog).map(([group, permissions]) => (
                <div key={group} className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">{group}</h3>
                  <div className="mt-4 space-y-3">
                    {permissions.map((permission) => {
                      const checked = selectedPermissions.includes(permission.key);
                      return (
                        <label key={permission.key} className="flex items-start gap-3 rounded-2xl border border-slate-100 px-3 py-3 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              setSelectedPermissions((current) => {
                                if (event.target.checked) {
                                  return Array.from(new Set([...current, permission.key]));
                                }
                                return current.filter((item) => item !== permission.key);
                              });
                            }}
                          />
                          <span>
                            <span className="block font-medium text-slate-900">{permission.description}</span>
                            <span className="mt-1 block text-xs text-slate-500">{permission.key}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
