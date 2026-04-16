"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Loading, ErrorBox, Empty } from "@/components/ui/State";
import { productsApi } from "@/features/products/api";
import { Product } from "@/features/products/types";

export default function AdminProdutos() {
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      setRows(await productsApi.list());
    } catch (e: any) {
      setErr(e?.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function del(id: number) {
    if (!confirm("Apagar produto?")) return;
    await productsApi.remove(id);
    await load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Produtos</h2>
        <Link href="/admin/produtos/novo">
          <Button>Novo</Button>
        </Link>
      </div>

      {loading && <Loading />}
      {err && <ErrorBox text={err} />}
      {!loading && !err && rows.length === 0 && <Empty text="Sem produtos." />}

      {!loading && !err && rows.length > 0 && (
        <div style={{ border: "1px solid #ddd", borderRadius: 10, background: "white" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>ID</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Nome</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Preço</th>
                <th style={{ padding: 10, borderBottom: "1px solid #eee" }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{p.id}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{p.name}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{p.price}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3", textAlign: "right" }}>
                    <Link href={`/admin/produtos/${p.id}/editar`}>
                      <Button variant="secondary">Editar</Button>
                    </Link>{" "}
                    <Button variant="destructive" onClick={() => del(p.id)}>
                      Apagar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}