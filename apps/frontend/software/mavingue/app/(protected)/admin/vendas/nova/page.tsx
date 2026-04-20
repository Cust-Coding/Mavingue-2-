"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { customersApi } from "@/features/customers/api";
import type { Customer } from "@/features/customers/types";
import { productsApi } from "@/features/products/api";
import type { Product } from "@/features/products/types";
import { salesApi } from "@/features/sales/api";
import type { FormaPagamento } from "@/features/sales/types";
import { getErrorMessage } from "@/lib/errors";

const paymentOptions: FormaPagamento[] = ["DINHEIRO_FISICO", "CARTEIRA_MOVEL", "CARTAO"];

export default function NovaVenda() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    produtoId: "",
    clienteId: "",
    quantidade: "1",
    formaPagamento: "DINHEIRO_FISICO" as FormaPagamento,
  });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([productsApi.list(), customersApi.list()])
      .then(([productRows, customerRows]) => {
        setProducts(productRows);
        setCustomers(customerRows);
      })
      .catch((reason: unknown) => setErr(getErrorMessage(reason, "Nao foi possivel carregar produtos e clientes")))
      .finally(() => setLoading(false));
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === Number(form.produtoId)),
    [form.produtoId, products]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!form.produtoId || !form.clienteId || !form.quantidade) {
      setErr("Seleccione o produto, o cliente e a quantidade.");
      return;
    }

    try {
      await salesApi.create({
        produtoId: Number(form.produtoId),
        clienteId: Number(form.clienteId),
        quantidade: Number(form.quantidade),
        formaPagamento: form.formaPagamento,
      });

      setOk("Venda registada com sucesso.");
      setForm({
        produtoId: "",
        clienteId: "",
        quantidade: "1",
        formaPagamento: "DINHEIRO_FISICO",
      });
    } catch (reason: unknown) {
      setErr(getErrorMessage(reason, "Nao foi possivel registar a venda"));
    }
  }

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Vendas</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Registar nova venda</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500 dark:text-slate-400">
          O operador actual e associado automaticamente. Agora a seleccao e feita por nome do produto e nome do cliente.
        </p>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        {loading ? <div className="text-sm text-slate-500">A carregar opcoes...</div> : null}
        {err ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div> : null}
        {ok ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{ok}</div> : null}

        <form onSubmit={submit} className="grid gap-4 xl:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Produto
            <select
              value={form.produtoId}
              onChange={(event) => setForm({ ...form, produtoId: event.target.value })}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">Seleccionar produto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Cliente
            <select
              value={form.clienteId}
              onChange={(event) => setForm({ ...form, clienteId: event.target.value })}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">Seleccionar cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Quantidade
            <Input value={form.quantidade} onChange={(event) => setForm({ ...form, quantidade: event.target.value })} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Forma de pagamento
            <select
              value={form.formaPagamento}
              onChange={(event) => setForm({ ...form, formaPagamento: event.target.value as FormaPagamento })}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {paymentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="xl:col-span-2 rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Resumo</div>
            <div className="mt-2 text-base font-bold text-slate-900 dark:text-white">
              {selectedProduct ? `${selectedProduct.name} - ${selectedProduct.price} MZN` : "Escolha um produto para ver o resumo"}
            </div>
          </div>

          <div className="xl:col-span-2">
            <Button type="submit">Registar venda</Button>
          </div>
        </form>
      </section>
    </main>
  );
}
