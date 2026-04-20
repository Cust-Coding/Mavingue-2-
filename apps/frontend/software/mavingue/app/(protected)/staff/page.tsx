"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorBox, Loading } from "@/components/ui/State";
import { purchasesApi } from "@/features/purchases/api";
import { salesApi } from "@/features/sales/api";
import { stockApi } from "@/features/stock/api";
import { listWaterBills, listWaterContracts, listWaterCustomers, listWaterReadings } from "@/features/water/api";
import { getErrorMessage } from "@/lib/errors";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Summary = {
  stock: number;
  purchases: number;
  sales: number;
  pendingPickup: number;
  readyPickup: number;
  waterCustomers: number;
  waterContracts: number;
  waterReadings: number;
  waterBills: number;
};

// Mock de dados para o gráfico (Substitua por dados reais do back-end futuramente se desejar)
const mockChartData = [
  { time: "Seg", Vendas: 120, Compras: 80, Agua: 40 },
  { time: "Ter", Vendas: 150, Compras: 90, Agua: 45 },
  { time: "Qua", Vendas: 180, Compras: 120, Agua: 50 },
  { time: "Qui", Vendas: 140, Compras: 70, Agua: 60 },
  { time: "Sex", Vendas: 200, Compras: 110, Agua: 55 },
  { time: "Sáb", Vendas: 250, Compras: 130, Agua: 70 },
  { time: "Dom", Vendas: 210, Compras: 100, Agua: 65 },
];

export default function StaffHome() {
  const [summary, setSummary] = useState<Summary>({
    stock: 0,
    purchases: 0,
    sales: 0,
    pendingPickup: 0,
    readyPickup: 0,
    waterCustomers: 0,
    waterContracts: 0,
    waterReadings: 0,
    waterBills: 0,
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  
  // Estado para controlar qual gráfico está visível
  const [activeTab, setActiveTab] = useState<"Vendas" | "Compras" | "Agua">("Vendas");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");

      try {
        const [stock, purchases, sales, waterCustomers, waterContracts, waterReadings, waterBills] = await Promise.all([
          stockApi.list(),
          purchasesApi.list(),
          salesApi.list(),
          listWaterCustomers(),
          listWaterContracts(),
          listWaterReadings(),
          listWaterBills(),
        ]);

        setSummary({
          stock: stock.length,
          purchases: purchases.length,
          sales: sales.length,
          pendingPickup: sales.filter((sale) => sale.estadoLevantamento === "AGUARDANDO_PREPARACAO").length,
          readyPickup: sales.filter((sale) => sale.estadoLevantamento === "PRONTO_PARA_LEVANTAMENTO").length,
          waterCustomers: waterCustomers.length,
          waterContracts: waterContracts.length,
          waterReadings: waterReadings.length,
          waterBills: waterBills.length,
        });
      } catch (error: unknown) {
        setErr(getErrorMessage(error, "Erro ao carregar o painel do staff"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: "Stock", value: summary.stock, href: "/staff/stock" },
    { label: "Compras", value: summary.purchases, href: "/staff/compras" },
    { label: "Vendas", value: summary.sales, href: "/staff/vendas" },
    { label: "A Preparar", value: summary.pendingPickup, href: "/staff/vendas" },
    { label: "Prontas", value: summary.readyPickup, href: "/staff/vendas" },
    { label: "Clientes de Água", value: summary.waterCustomers, href: "/staff/agua" },
    { label: "Ligações", value: summary.waterContracts, href: "/staff/agua" },
    { label: "Leituras", value: summary.waterReadings, href: "/staff/agua" },
    { label: "Facturas Água", value: summary.waterBills, href: "/staff/agua" },
  ];

  // Configuração dinâmica de cores para o gráfico estilo Google
  const chartConfig = {
    Vendas: { color: "#188038" }, // Verde Google
    Compras: { color: "#d93025" }, // Vermelho Google
    Agua: { color: "#1a73e8" }, // Azul Google
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      
      {/* Cabeçalho Premium */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 m-0">Painel Staff</h2>
        <p className="text-gray-500 mt-1 mb-0 text-sm">
          Operações de stock, compras, vendas e água ligadas ao backend em tempo real.
        </p>
      </div>

      {loading && <Loading />}
      {err && <ErrorBox text={err} />}

      {!loading && !err && (
        <>
          {/* Grid de Cards Premium */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {cards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className="group flex flex-col justify-between bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-inherit no-underline"
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-gray-500 mb-3 transition-colors">
                  {card.label}
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {card.value}
                </div>
              </Link>
            ))}
          </div>

          {/* Gráfico Estilo Google Finance */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-2">
            
            {/* Controles do Gráfico */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {(["Vendas", "Compras", "Agua"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      activeTab === tab
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Visão Semanal
              </span>
            </div>

            {/* Renderização do Gráfico */}
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartConfig[activeTab].color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={chartConfig[activeTab].color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  
                  <Tooltip
                    cursor={{ stroke: "#e5e7eb", strokeWidth: 1, strokeDasharray: "4 4" }}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)" }}
                    labelStyle={{ color: "#6b7280", fontWeight: 600, marginBottom: "4px" }}
                    itemStyle={{ color: "#111827", fontWeight: 700 }}
                  />
                  
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#9ca3af", fontSize: 12 }} 
                    dy={10} 
                  />
                  <YAxis hide domain={["dataMin - 10", "dataMax + 20"]} />
                  
                  <Area
                    type="monotone"
                    dataKey={activeTab}
                    stroke={chartConfig[activeTab].color}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#chartGradient)"
                    activeDot={{ r: 5, strokeWidth: 0, fill: chartConfig[activeTab].color }}
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Links de Ação Rápida */}
          <div className="flex flex-wrap gap-4 mt-2">
            <Link
              href="/staff/vendas/nova"
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors no-underline shadow-sm"
            >
              + Registar Nova Venda
            </Link>
            <Link
              href="/staff/utilizadores/novo"
              className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors no-underline"
            >
              Criar Conta Operacional
            </Link>
            <Link
              href="/staff/agua"
              className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors no-underline"
            >
              Abrir Módulo de Água
            </Link>
          </div>
        </>
      )}
    </div>
  );
}