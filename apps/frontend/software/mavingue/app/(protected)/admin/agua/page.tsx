"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Empty, ErrorBox, Loading } from "@/components/ui/State";
import { listWaterBills, listWaterContracts, listWaterCustomers, listWaterReadings, payWaterBill } from "@/features/water/api";
import type { WaterBill, WaterContract, WaterCustomer, WaterReading } from "@/features/water/types";

type Tab = "clientes" | "contratos" | "leituras" | "faturas";

const paymentOptions = [
  { value: "CARTEIRA_MOVEL", label: "Carteira Movel" },
  { value: "CARTAO", label: "Cartao" },
  { value: "DINHEIRO_FISICO", label: "Dinheiro Fisico" },
] as const;

function money(value: number) {
  return `${Number(value || 0).toFixed(2)} MT`;
}

export default function AguaPage() {
  const [tab, setTab] = useState<Tab>("clientes");
  const [loading, setLoading] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentOptions)[number]["value"]>("CARTEIRA_MOVEL");
  const [err, setErr] = useState("");

  const [clientes, setClientes] = useState<WaterCustomer[]>([]);
  const [contratos, setContratos] = useState<WaterContract[]>([]);
  const [leituras, setLeituras] = useState<WaterReading[]>([]);
  const [faturas, setFaturas] = useState<WaterBill[]>([]);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const [customerData, contractData, readingData, billData] = await Promise.all([
        listWaterCustomers(),
        listWaterContracts(),
        listWaterReadings(),
        listWaterBills(),
      ]);
      setClientes(customerData);
      setContratos(contractData);
      setLeituras(readingData);
      setFaturas(billData);
    } catch (error: any) {
      setErr(error?.message ?? "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handlePay(id: number) {
    setPayingId(id);
    setErr("");

    try {
      const updated = await payWaterBill(id, { formaPagamento: paymentMethod });
      setFaturas((current) => current.map((bill) => (bill.id === updated.id ? updated : bill)));
    } catch (error: any) {
      setErr(error?.message ?? "Erro ao pagar a factura");
    } finally {
      setPayingId(null);
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "clientes", label: "Clientes" },
    { key: "contratos", label: "Contratos" },
    { key: "leituras", label: "Leituras" },
    { key: "faturas", label: "Faturas" },
  ];

  return (
    <div>
      <h2>Gestao de Agua</h2>
      {err && <ErrorBox text={err} />}

      <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            style={{
              padding: "8px 16px",
              border: "none",
              background: tab === item.key ? "#EF6A44" : "transparent",
              color: tab === item.key ? "white" : "#333",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && <Loading />}

      {!loading && tab === "clientes" && (
        clientes.length === 0 ? <Empty text="Sem clientes de agua." /> : (
          <div style={{ border: "1px solid #ddd", borderRadius: 10, background: "white", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>ID</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Nome</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Contacto</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Email</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Casa</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Endereco</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{cliente.id}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{cliente.name}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{cliente.phone}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{cliente.email}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{cliente.houseNR}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{cliente.adress || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {!loading && tab === "contratos" && (
        contratos.length === 0 ? <Empty text="Sem contratos." /> : (
          <div style={{ border: "1px solid #ddd", borderRadius: 10, background: "white", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>ID</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Consumidor</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Funcionario</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Estado</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Data</th>
                </tr>
              </thead>
              <tbody>
                {contratos.map((contrato) => (
                  <tr key={contrato.id}>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{contrato.id}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{contrato.consumidorNome}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{contrato.funcionarioNome}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{contrato.estado}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{new Date(contrato.data).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {!loading && tab === "leituras" && (
        leituras.length === 0 ? <Empty text="Sem leituras." /> : (
          <div style={{ border: "1px solid #ddd", borderRadius: 10, background: "white", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>ID</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Ligacao</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Data</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Leitura Actual</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Consumo</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {leituras.map((leitura) => (
                  <tr key={leitura.id}>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{leitura.id}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{leitura.ligacaoId}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{new Date(leitura.data).toLocaleString()}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{leitura.leituraActual}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{leitura.consumoM3} m3</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{money(leitura.valorPagar)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {!loading && tab === "faturas" && (
        faturas.length === 0 ? <Empty text="Sem faturas." /> : (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ color: "#555" }}>Metodo de pagamento:</span>
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as (typeof paymentOptions)[number]["value"])}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", minWidth: 220 }}
              >
                {paymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ border: "1px solid #ddd", borderRadius: 10, background: "white", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Factura</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Consumidor</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Data</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Valor</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Estado</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Pagamento</th>
                    <th style={{ padding: 10, borderBottom: "1px solid #eee" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {faturas.map((fatura) => (
                    <tr key={fatura.id}>
                      <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>#{fatura.id}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{fatura.consumidorNome}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{new Date(fatura.data).toLocaleString()}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{money(fatura.valorTotal)}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{fatura.estadoPagamento}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{fatura.formaPagamento}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3", textAlign: "right" }}>
                        {fatura.estadoPagamento !== "PAGO" && (
                          <Button onClick={() => handlePay(fatura.id)} disabled={payingId === fatura.id}>
                            {payingId === fatura.id ? "A pagar..." : "Pagar"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
