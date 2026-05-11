"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { categoriesApi } from "@/features/categories/api";
import { buildProductCategoryOptions } from "@/features/categories/utils";
import type { ProductCategory } from "@/features/categories/types";
import { inferProductCategory } from "@/lib/catalog";
import { getErrorMessage } from "@/lib/errors";
import { productsApi } from "./api";
import type { Product } from "./types";
import { formatMoney } from "@/lib/formatters";
import { CheckCircle2, ImagePlus, Loader2, Package2, Save, X } from "lucide-react";

type ProductEditorPageProps = {
  mode: "create" | "edit";
  productId?: number;
};

type FormState = {
  name: string;
  description: string;
  price: string;
  category: string;
  urlImg: string;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  category: "construcao",
  urlImg: "",
};

export function ProductEditorPage({ mode, productId }: ProductEditorPageProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const productCategoryOptions = useMemo(() => buildProductCategoryOptions(categories), [categories]);

  useEffect(() => {
    categoriesApi
      .list()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !productId) return;

    setLoading(true);
    setError("");

    productsApi
      .get(productId)
      .then((product) =>
        setForm({
          name: product.name,
          description: product.description,
          price: String(product.price ?? ""),
          category: product.category || inferProductCategory(product),
          urlImg: product.urlImg || "",
        })
      )
      .catch((reason: unknown) => setError(getErrorMessage(reason, "Nao foi possivel carregar o produto")))
      .finally(() => setLoading(false));
  }, [mode, productId]);

  const previewProduct = useMemo<Product>(
    () => ({
      id: productId ?? 0,
      name: form.name || "Produto sem nome",
      description: form.description || "Descricao do produto sera mostrada aqui.",
      price: Number(form.price || 0),
      category: form.category,
      urlImg: form.urlImg,
      stockDisponivel: 0,
    }),
    [form, productId]
  );

  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecione uma imagem valida.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no maximo 5MB.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/proxy/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Falha no upload da imagem");
      }

      setForm((current) => ({ ...current, urlImg: data.url }));
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar a imagem"));
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("O nome do produto e obrigatorio.");
      return;
    }

    if (!form.description.trim()) {
      setError("A descricao do produto e obrigatoria.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setError("Informe um preco valido.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        urlImg: form.urlImg,
      };

      if (mode === "create") {
        await productsApi.create(payload);
        setForm(emptyForm);
        setSuccess("Produto criado com sucesso.");
      } else if (productId) {
        await productsApi.update(productId, payload);
        setSuccess("Produto actualizado com sucesso.");
      }
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, mode === "create" ? "Nao foi possivel criar o produto" : "Nao foi possivel actualizar o produto"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-700 p-6 text-white shadow-lg shadow-slate-950/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">Produtos</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">
              {mode === "create" ? "Novo produto com visual comercial" : `Editar produto #${productId}`}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
              Mantivemos a mesma linguagem elegante da area de vendas, com formulario claro, preview em tempo real e categoria pronta para filtros e relatorios.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="flex items-center gap-2 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          <span>{success}</span>
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={submit} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Formulario</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                {mode === "create" ? "Preencha os dados do novo produto" : "Actualize os dados do produto"}
              </h2>
            </div>
            <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
              <Package2 className="h-5 w-5" />
            </div>
          </div>

          {loading ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
              A carregar produto...
            </div>
          ) : (
            <div className="grid gap-5">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Nome do produto
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Ex.: Cimento Portland 50kg"
                  className="h-12 rounded-2xl"
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Preco unitario
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                    placeholder="0.00"
                    className="h-12 rounded-2xl"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Categoria
                  <select
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  >
                    {productCategoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Descricao
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Descreva o produto, aplicacao, medidas e diferenciais."
                  className="min-h-36 rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-slate-700">Imagem do produto</label>
                  {form.urlImg ? (
                    <button
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, urlImg: "" }))}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remover
                    </button>
                  ) : null}
                </div>

                <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-orange-300 hover:bg-orange-50/60">
                  {uploading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                      <span className="text-sm font-semibold text-slate-700">A enviar imagem...</span>
                    </>
                  ) : form.urlImg ? (
                    <img src={form.urlImg} alt="Preview" className="max-h-52 rounded-2xl border border-slate-200 object-contain" />
                  ) : (
                    <>
                      <ImagePlus className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Clique para escolher uma imagem</p>
                        <p className="mt-1 text-xs text-slate-500">PNG ou JPG ate 5MB</p>
                      </div>
                    </>
                  )}

                  <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={uploadFile} className="hidden" />
                </label>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setForm(emptyForm);
                    setError("");
                    setSuccess("");
                  }}
                >
                  Limpar
                </Button>
                <Button type="submit" disabled={saving} className="bg-orange-600 text-white hover:bg-orange-700">
                  <Save className="h-4 w-4" />
                  {saving ? "A guardar..." : mode === "create" ? "Criar produto" : "Guardar alteracoes"}
                </Button>
              </div>
            </div>
          )}
        </form>

        <aside className="grid gap-6">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Preview</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Como o produto vai aparecer</h2>

            <article className="mt-5 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
              <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                {previewProduct.urlImg ? (
                  <img src={previewProduct.urlImg} alt={previewProduct.name} className="h-56 w-full object-cover" />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-500">
                    Imagem do produto
                  </div>
                )}

                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-700">
                  {productCategoryOptions.find((option) => option.value === form.category)?.label ?? "Construcao"}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <h3 className="text-xl font-black text-slate-900">{previewProduct.name}</h3>
                <p className="text-sm leading-6 text-slate-500">{previewProduct.description}</p>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Preco</p>
                    <p className="text-2xl font-black text-orange-600">{formatMoney(previewProduct.price)}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-2 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Estado</p>
                    <p className="text-sm font-bold text-slate-700">Pronto para venda</p>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Checklist</p>
            <div className="mt-4 grid gap-3">
              {[
                { label: "Nome comercial definido", ok: Boolean(form.name.trim()) },
                { label: "Categoria pronta para filtros", ok: Boolean(form.category) },
                { label: "Preco valido para vendas e stock", ok: Number(form.price || 0) > 0 },
                { label: "Descricao clara para a equipa", ok: Boolean(form.description.trim()) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.ok ? "OK" : "Pendente"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
