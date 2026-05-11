"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { categoriesApi } from "./api";
import type { ProductCategory } from "./types";
import { getErrorMessage } from "@/lib/errors";
import { CheckCircle2, FolderTree, PencilLine, Plus, Tags } from "lucide-react";

const emptyForm = {
  name: "",
  description: "",
};

export function CategoryManagementPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const rows = await categoriesApi.list();
      setCategories(rows);
      if (!selectedId && rows[0]) {
        setSelectedId(rows[0].id);
      }
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar as categorias"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedId) ?? null,
    [categories, selectedId]
  );

  useEffect(() => {
    if (!selectedCategory) {
      setForm(emptyForm);
      return;
    }

    setForm({
      name: selectedCategory.name,
      description: selectedCategory.description || "",
    });
  }, [selectedCategory]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      };

      if (!payload.name) {
        setError("Informe o nome da categoria.");
        return;
      }

      if (selectedCategory) {
        const updated = await categoriesApi.update(selectedCategory.id, payload);
        setCategories((current) =>
          current.map((category) => (category.id === updated.id ? updated : category))
        );
        setSuccess("Categoria actualizada com sucesso.");
      } else {
        const created = await categoriesApi.create(payload);
        setCategories((current) => [...current, created].sort((left, right) => left.name.localeCompare(right.name)));
        setSelectedId(created.id);
        setSuccess("Categoria criada com sucesso.");
      }
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel guardar a categoria"));
    } finally {
      setSaving(false);
    }
  }

  function startCreate() {
    setSelectedId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  }

  const categoryCount = categories.length;

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-700 p-6 text-white shadow-lg shadow-slate-950/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">Categorias</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">Cadastrar e editar categorias</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
              Organize os produtos com categorias proprias para manter filtros, formularios e relatorios mais limpos.
            </p>
          </div>

          <Button type="button" onClick={startCreate} className="bg-white text-slate-950 hover:bg-cyan-50">
            <Plus className="h-4 w-4" />
            Nova categoria
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Categorias activas", value: categoryCount, icon: FolderTree },
          { label: "Modo actual", value: selectedCategory ? "Edicao" : "Cadastro", icon: PencilLine },
          { label: "Cobertura", value: "Produtos e filtros", icon: Tags },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
                  <div className="mt-3 text-2xl font-black text-slate-900">{card.value}</div>
                </div>
                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {error ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      {success ? (
        <div className="flex items-center gap-2 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          <span>{success}</span>
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Lista</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Categorias disponiveis</h2>
            </div>
          </div>

          {loading ? (
            <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
              A carregar categorias...
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {categories.map((category) => {
                const active = category.id === selectedId;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedId(category.id)}
                    className={`rounded-[28px] border p-4 text-left transition ${
                      active
                        ? "border-cyan-300 bg-cyan-50/70 shadow-sm"
                        : "border-slate-200 bg-slate-50 hover:border-cyan-200 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-600">
                          {category.slug}
                        </span>
                        <h3 className="mt-3 text-lg font-black text-slate-900">{category.name}</h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {category.description || "Sem descricao. Pode usar para agrupar produtos e filtrar rapidamente."}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
              {selectedCategory ? <PencilLine className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Formulario</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                {selectedCategory ? `Editar categoria #${selectedCategory.id}` : "Nova categoria"}
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Nome da categoria
              <Input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Ex.: Acabamentos"
                className="h-12 rounded-2xl"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Descricao
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Opcional: detalhe rapido para a equipa entender onde usar esta categoria."
                className="min-h-32 rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            {selectedCategory ? (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Slug operacional</p>
                <p className="mt-1">{selectedCategory.slug}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Ao mudar o nome, os produtos ligados a esta categoria continuam sincronizados.
                </p>
              </div>
            ) : null}

            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="flex-1 bg-cyan-600 text-white hover:bg-cyan-700">
                {saving ? "A guardar..." : selectedCategory ? "Guardar alteracoes" : "Criar categoria"}
              </Button>
              {selectedCategory ? (
                <Button type="button" variant="outline" onClick={startCreate} className="rounded-2xl">
                  Nova
                </Button>
              ) : null}
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
