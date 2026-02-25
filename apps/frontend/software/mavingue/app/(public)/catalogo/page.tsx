"use client";
import { useEffect, useState } from "react";
import { productsApi } from "@/features/products/api";
import { Product } from "@/features/products/types";
import { Loading, ErrorBox, Empty } from "@/components/ui/State";

export default function Catalogo() {
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    productsApi
      .list()
      .then(setRows)
      .catch((e: any) => setErr(e?.message ?? "Erro"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (err) return <ErrorBox text={err} />;
  if (!rows.length) return <Empty text="Sem produtos." />;

  return (
    <div>
      <h2>Catálogo</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {rows.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12, background: "white" }}>
            <div style={{ fontWeight: 700 }}>{p.name}</div>
            <div style={{ color: "#555", fontSize: 14 }}>{p.description ?? "-"}</div>
            <div style={{ marginTop: 8, fontWeight: 700 }}>{p.price} MT</div>
          </div>
        ))}
      </div>
    </div>
  );
}