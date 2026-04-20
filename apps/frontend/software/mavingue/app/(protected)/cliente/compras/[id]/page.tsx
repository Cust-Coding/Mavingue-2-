"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ErrorBox, Loading } from "@/components/ui/State";
import { clientApi } from "@/features/client/api";
import type { ClientOrder } from "@/features/client/types";

function money(value: number) {
  return `${Number(value || 0).toFixed(2)} MT`;
}

export default function ClienteCompraDetalhe() {
  const params = useParams();
  const id = Number(params.id);

  const [order, setOrder] = useState<ClientOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!Number.isFinite(id)) return;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        setOrder(await clientApi.getOrder(id));
      } catch (error: any) {
        setErr(error?.message ?? "Erro ao carregar o detalhe da compra");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ background: "white", border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Detalhe da Compra #{id}</h2>
      </div>

      {loading && <Loading />}
      {err && <ErrorBox text={err} />}

      {!loading && !err && order && (
        <div style={{ background: "white", border: "1px solid #ddd", borderRadius: 10, padding: 16, display: "grid", gap: 10 }}>
          <div>
            <strong>Produto:</strong> {order.produtoNome}
          </div>
          <div>
            <strong>Produto ID:</strong> {order.produtoId}
          </div>
          <div>
            <strong>Cliente ID:</strong> {order.clienteId}
          </div>
          <div>
            <strong>Funcionario ID:</strong> {order.funcionarioId}
          </div>
          <div>
            <strong>Quantidade:</strong> {order.quantidade}
          </div>
          <div>
            <strong>Preco unitario:</strong> {money(order.precoUnitario)}
          </div>
          <div>
            <strong>Total:</strong> {money(order.total)}
          </div>
          <div>
            <strong>Forma de pagamento:</strong> {order.formaPagamento}
          </div>
        </div>
      )}
    </div>
  );
}
