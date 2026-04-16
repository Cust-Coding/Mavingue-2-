"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { salesApi } from "@/features/sales/api";
import { Loading, ErrorBox, Empty } from "@/components/ui/State";

export default function AdminVendas() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    salesApi
      .list()
      .then(setRows)
      .catch((e: any) => setErr(e?.message ?? "Erro"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Vendas</h2>
        <Link href="/admin/vendas/nova">Nova venda</Link>
      </div>

      {loading && <Loading />}
      {err && <ErrorBox text={err} />}
      {!loading && !err && rows.length === 0 && <Empty text="Sem vendas." />}

      {!loading && !err && rows.length > 0 && (
        <pre style={{ whiteSpace: "pre-wrap", border: "1px solid #ddd", borderRadius: 10, background: "white", padding: 12 }}>
          {JSON.stringify(rows, null, 2)}
        </pre>
      )}
    </div>
  );
}