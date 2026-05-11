"use client";

import { useEffect, useState } from "react";
import { Empty, ErrorBox, Loading } from "@/components/ui/State";
import { clientApi } from "@/features/client/api";
import type {
  ClientAccountUpdate,
  ClientCustomerUpdate,
  ClientProfile,
} from "@/features/client/types";
import {
  User,
  Mail,
  Shield,
  Phone,
  MapPin,
  FileText,
  Droplets,
  Home,
  Edit2,
  X,
  Check,
} from "lucide-react";
import { updateSessionUser } from "@/lib/auth/session";

type EditField =
  | "nome"
  | "email"
  | "phone"
  | "customer_name"
  | "customer_phone"
  | "customer_sexo"
  | "customer_birthDate"
  | "customer_cidade"
  | "customer_provincia"
  | "customer_bairro"
  | null;

export default function Perfil() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);
  const [editingField, setEditingField] = useState<EditField>(null);
  const [saving, setSaving] = useState(false);
  const [fieldValue, setFieldValue] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    void loadProfile();
  }, [mounted]);

  async function loadProfile() {
    setLoading(true);
    setErr("");

    try {
      setProfile(await clientApi.profile());
    } catch (error: unknown) {
      setErr(toErrorMessage(error, "Erro ao carregar o perfil"));
    } finally {
      setLoading(false);
    }
  }

  const startEdit = (field: EditField, currentValue: string) => {
    setErr("");
    setSuccess("");
    setEditingField(field);
    setFieldValue(currentValue ?? "");
  };

  const cancelEdit = () => {
    setEditingField(null);
    setFieldValue("");
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("pt-PT");
  };

  const roleLabel = (role?: string | null) => {
    if (role === "ADMIN") return "Administrador";
    if (role === "FUNCIONARIO") return "Funcionario";
    if (role === "CLIENTE") return "Cliente";
    return role || "--";
  };

  const saveField = async () => {
    if (!profile || !editingField) return;

    const account = profile.account;
    const customer = profile.customer;
    const nextValue = fieldValue.trim();

    setSaving(true);
    setErr("");
    setSuccess("");

    try {
      if (editingField === "nome" || editingField === "email" || editingField === "phone") {
        const payload: ClientAccountUpdate = {
          nome: editingField === "nome" ? nextValue : account.nome,
          email:
            editingField === "email"
              ? nextValue || null
              : account.email,
          phone: editingField === "phone" ? nextValue : account.phone,
        };

        const updatedAccount = await clientApi.updateAccount(payload);
        updateSessionUser(updatedAccount);
        localStorage.setItem("me_name", updatedAccount.nome);

        setProfile((current) =>
          current
            ? {
                ...current,
                account: updatedAccount,
              }
            : current
        );
        setSuccess("Dados da conta actualizados com sucesso.");
      } else {
        if (!customer) return;

        const payload: ClientCustomerUpdate = {
          name: editingField === "customer_name" ? nextValue : customer.name,
          phone: editingField === "customer_phone" ? nextValue : customer.phone,
          sex: editingField === "customer_sexo" ? (fieldValue as "HOMEM" | "MULHER") : customer.sex,
          birthDate: editingField === "customer_birthDate" ? fieldValue : customer.birthDate,
          cidade: editingField === "customer_cidade" ? nextValue : customer.cidade,
          provincia: editingField === "customer_provincia" ? nextValue : customer.provincia,
          bairro: editingField === "customer_bairro" ? nextValue : customer.bairro,
          email: customer.email,
        };

        const updatedCustomer = await clientApi.updateCustomer(payload);
        setProfile((current) =>
          current
            ? {
                ...current,
                customer: updatedCustomer,
              }
            : current
        );
        setSuccess("Cadastro do cliente actualizado com sucesso.");
      }

      setEditingField(null);
      setFieldValue("");
    } catch (error: unknown) {
      setErr(toErrorMessage(error, "Erro ao salvar"));
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-6 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-orange-100 p-2 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Perfil</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">A preparar interface...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const account = profile?.account;
  const customer = profile?.customer;

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
        <section className="rounded-[28px] bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white shadow-lg shadow-slate-950/10 dark:from-slate-950 dark:to-slate-900">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md">
              <User className="h-6 w-6 text-orange-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-300">
                Perfil
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                Dados da conta e modulo de agua
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Aqui pode rever e ajustar os dados principais da sua conta e do cadastro de cliente.
              </p>
            </div>
          </div>
        </section>

        {loading && <Loading />}
        {err && <ErrorBox text={err} />}
        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
            {success}
          </div>
        )}

        {!loading && !err && profile ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Conta", value: account?.nome || "--" },
              { label: "Perfil comercial", value: customer ? "Ligado" : "Pendente" },
              { label: "Contas de agua", value: profile.waterCustomers.length },
              { label: "Role", value: roleLabel(account?.role) },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-[24px] border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/50"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
                <div className="mt-3 text-xl font-black text-slate-900 dark:text-white">{card.value}</div>
              </div>
            ))}
          </section>
        ) : null}

        {!loading && !err && profile && (
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-[28px] border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 lg:col-span-2">
              <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <h2 className="text-md font-semibold text-slate-800 dark:text-white">
                    Conta
                  </h2>
                </div>
              </div>

              <div className="space-y-1 p-5">
                <EditableRow
                  label="Nome"
                  icon={<User className="h-3.5 w-3.5 text-slate-400" />}
                  value={account?.nome || "--"}
                  isEditing={editingField === "nome"}
                  editingValue={fieldValue}
                  placeholder="Nome completo"
                  onStartEdit={() => startEdit("nome", account?.nome || "")}
                  onChange={(value) => setFieldValue(value)}
                  onSave={saveField}
                  onCancel={cancelEdit}
                  saving={saving}
                />

                <EditableRow
                  label="Email principal"
                  icon={<Mail className="h-3.5 w-3.5 text-slate-400" />}
                  value={account?.email || "--"}
                  isEditing={editingField === "email"}
                  editingValue={fieldValue}
                  placeholder="seu@email.com"
                  onStartEdit={() => startEdit("email", account?.email || "")}
                  onChange={(value) => setFieldValue(value)}
                  onSave={saveField}
                  onCancel={cancelEdit}
                  saving={saving}
                />

                <EditableRow
                  label="Telefone da conta"
                  icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
                  value={account?.phone || "--"}
                  isEditing={editingField === "phone"}
                  editingValue={fieldValue}
                  placeholder="84 123 4567"
                  onStartEdit={() => startEdit("phone", account?.phone || "")}
                  onChange={(value) => setFieldValue(value)}
                  onSave={saveField}
                  onCancel={cancelEdit}
                  saving={saving}
                />

                <StaticRow
                  label="Role"
                  icon={<Shield className="h-3.5 w-3.5 text-slate-400" />}
                  value={roleLabel(account?.role)}
                  pill
                />
              </div>
            </section>

            <aside className="space-y-6">
              <section className="rounded-[28px] border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
                <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <h2 className="text-md font-semibold text-slate-800 dark:text-white">
                      Cadastro de cliente
                    </h2>
                  </div>
                </div>

                <div className="space-y-1 p-5">
                  {customer ? (
                    <>
                      <EditableRow
                        label="Nome"
                        icon={<User className="h-3.5 w-3.5 text-slate-400" />}
                        value={customer.name || "--"}
                        isEditing={editingField === "customer_name"}
                        editingValue={fieldValue}
                        placeholder="Nome do cliente"
                        onStartEdit={() => startEdit("customer_name", customer.name || "")}
                        onChange={(value) => setFieldValue(value)}
                        onSave={saveField}
                        onCancel={cancelEdit}
                        saving={saving}
                      />

                      <EditableRow
                        label="Telefone principal"
                        icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
                        value={customer.phone || "--"}
                        isEditing={editingField === "customer_phone"}
                        editingValue={fieldValue}
                        placeholder="84 123 4567"
                        onStartEdit={() => startEdit("customer_phone", customer.phone || "")}
                        onChange={(value) => setFieldValue(value)}
                        onSave={saveField}
                        onCancel={cancelEdit}
                        saving={saving}
                      />

                      <EditableRow
                        label="Sexo"
                        icon={<Shield className="h-3.5 w-3.5 text-slate-400" />}
                        value={customer.sex === "HOMEM" ? "Homem" : "Mulher"}
                        isEditing={editingField === "customer_sexo"}
                        editingValue={fieldValue}
                        placeholder=""
                        selectOptions={[
                          { value: "HOMEM", label: "Homem" },
                          { value: "MULHER", label: "Mulher" },
                        ]}
                        onStartEdit={() => startEdit("customer_sexo", customer.sex)}
                        onChange={(value) => setFieldValue(value)}
                        onSave={saveField}
                        onCancel={cancelEdit}
                        saving={saving}
                      />

                      <EditableRow
                        label="Data de nascimento"
                        icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
                        value={formatDate(customer.birthDate)}
                        isEditing={editingField === "customer_birthDate"}
                        editingValue={fieldValue}
                        placeholder=""
                        date
                        onStartEdit={() => startEdit("customer_birthDate", customer.birthDate || "")}
                        onChange={(value) => setFieldValue(value)}
                        onSave={saveField}
                        onCancel={cancelEdit}
                        saving={saving}
                      />

                      <EditableRow
                        label="Cidade"
                        icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
                        value={customer.cidade || "--"}
                        isEditing={editingField === "customer_cidade"}
                        editingValue={fieldValue}
                        placeholder="Cidade"
                        onStartEdit={() => startEdit("customer_cidade", customer.cidade || "")}
                        onChange={(value) => setFieldValue(value)}
                        onSave={saveField}
                        onCancel={cancelEdit}
                        saving={saving}
                      />

                      <EditableRow
                        label="Provincia"
                        icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
                        value={customer.provincia || "--"}
                        isEditing={editingField === "customer_provincia"}
                        editingValue={fieldValue}
                        placeholder="Provincia"
                        onStartEdit={() => startEdit("customer_provincia", customer.provincia || "")}
                        onChange={(value) => setFieldValue(value)}
                        onSave={saveField}
                        onCancel={cancelEdit}
                        saving={saving}
                      />

                      <EditableRow
                        label="Bairro"
                        icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
                        value={customer.bairro || "--"}
                        isEditing={editingField === "customer_bairro"}
                        editingValue={fieldValue}
                        placeholder="Bairro"
                        onStartEdit={() => startEdit("customer_bairro", customer.bairro || "")}
                        onChange={(value) => setFieldValue(value)}
                        onSave={saveField}
                        onCancel={cancelEdit}
                        saving={saving}
                      />
                    </>
                  ) : (
                    <div className="px-1 py-2">
                      <Empty text="Nao existe cadastro comercial ligado a esta conta." />
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
                <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    <h2 className="text-md font-semibold text-slate-800 dark:text-white">
                      Contas e pedidos de agua
                    </h2>
                  </div>
                </div>

                <div className="p-5">
                  {profile.waterCustomers.length > 0 ? (
                    <div className="grid gap-4">
                      {profile.waterCustomers.map((waterCustomer) => (
                        <div
                          key={waterCustomer.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50"
                        >
                          <div className="mb-3 flex items-center gap-2">
                            <Home className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                            <span className="text-sm font-semibold text-slate-800 dark:text-white">
                              Casa #{waterCustomer.id}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm">
                            <InfoLine label="Proprietario" value={waterCustomer.name} />
                            <InfoLine label="Telefone" value={waterCustomer.phone} />
                            <InfoLine
                              label="Local"
                              value={waterCustomer.referenciaLocal || "-"}
                            />
                            <InfoLine label="Casa" value={waterCustomer.houseNR || "-"} />
                            <InfoLine label="Zona" value={waterCustomer.adress || "-"} />
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-slate-500 dark:text-slate-400">Estado</span>
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  waterCustomer.estado === "ATIVO"
                                    ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
                                    : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                                }`}
                              >
                                {waterCustomer.estado}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty text="Nao existe cadastro de agua ligado a esta conta." />
                  )}
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function StaticRow({
  label,
  icon,
  value,
  pill,
  note,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  pill?: boolean;
  note?: boolean;
}) {
  return (
    <div className="rounded-2xl px-1 py-3 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            {label}
          </p>
          <div className="mt-1 flex items-center gap-2">
            {icon}
            {pill ? (
              <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {value}
              </span>
            ) : note ? (
              <span className="text-sm text-slate-500 dark:text-slate-400">{value}</span>
            ) : (
              <span className="font-medium text-slate-900 dark:text-white">{value}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableRow({
  label,
  icon,
  value,
  isEditing,
  editingValue,
  placeholder,
  onStartEdit,
  onChange,
  onSave,
  onCancel,
  saving,
  selectOptions,
  date,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  isEditing: boolean;
  editingValue: string;
  placeholder: string;
  onStartEdit: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  selectOptions?: { value: string; label: string }[];
  date?: boolean;
}) {
  return (
    <div className="rounded-2xl px-1 py-3 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            {label}
          </p>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <span className="font-medium">Anterior:</span> {value}
              </div>

              {selectOptions ? (
                <select
                  value={editingValue}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                  autoFocus
                >
                  {selectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={date ? "date" : "text"}
                  value={editingValue}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                  autoFocus
                />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                {icon}
                <span className="truncate font-medium text-slate-900 dark:text-white">
                  {value}
                </span>
              </div>

              <button
                type="button"
                onClick={onStartEdit}
                className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-orange-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-orange-300"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="truncate text-right text-slate-700 dark:text-slate-200">
        {value}
      </span>
    </div>
  );
}
