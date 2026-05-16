"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Calendar, DollarSign, ShoppingBag, Loader2 } from "lucide-react";
import { salesApi } from "@/features/sales/api";
import { getErrorMessage } from "@/lib/errors";

type SalesData = {
  dia: string;
  vendas: number;
  quantidade: number;
};

type TopProduct = {
  nome: string;
  quantidade: number;
  receita: number;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "MZN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function SalesReportPage() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"semanal" | "mensal">("semanal");

  useEffect(() => {
    loadSalesData();
  }, [period]);

  const loadSalesData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar todas as vendas
      const sales = await salesApi.list();

      // Calcular dados por dia da semana ou mês
      if (period === "semanal") {
        const weekData = processWeeklyData(sales);
        setSalesData(weekData);
      } else {
        const monthData = await processMonthlyData(sales);
        setSalesData(monthData);
      }

      // Processar produtos mais vendidos
      const topProductsData = processTopProducts(sales);
      setTopProducts(topProductsData);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Erro ao carregar dados de vendas"));
    } finally {
      setLoading(false);
    }
  };

  const processWeeklyData = (sales: any[]): SalesData[] => {
    const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const dayMap: Record<string, { vendas: number; quantidade: number }> = {};

    // Inicializar o map
    days.forEach((day) => {
      dayMap[day] = { vendas: 0, quantidade: 0 };
    });

    sales.forEach((sale) => {
      if (!sale.createdAt) return;
      const date = new Date(sale.createdAt);
      const dayIndex = date.getDay(); // 0 = Domingo
      const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1]; // Ajustar para Seg=0

      if (dayMap[dayName]) {
        dayMap[dayName].vendas += sale.valorTotal || sale.total || 0;
        dayMap[dayName].quantidade += sale.quantidadeTotal || sale.items?.length || 0;
      }
    });

    return days.map((dia) => ({
      dia,
      vendas: dayMap[dia].vendas,
      quantidade: dayMap[dia].quantidade,
    }));
  };

  const processMonthlyData = async (sales: any[]): Promise<SalesData[]> => {
    const monthMap: Record<string, { vendas: number; quantidade: number }> = {};
    
    // Últimos 6 meses
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleDateString("pt-PT", { month: "short" });
      months.push({ key: monthKey, name: monthName });
      monthMap[monthKey] = { vendas: 0, quantidade: 0 };
    }

    sales.forEach((sale) => {
      if (!sale.createdAt) return;
      const date = new Date(sale.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (monthMap[monthKey]) {
        monthMap[monthKey].vendas += sale.valorTotal || sale.total || 0;
        monthMap[monthKey].quantidade += sale.quantidadeTotal || sale.items?.length || 0;
      }
    });

    return months.map((month) => ({
      dia: month.name,
      vendas: monthMap[month.key].vendas,
      quantidade: monthMap[month.key].quantidade,
    }));
  };

  const processTopProducts = (sales: any[]): TopProduct[] => {
    const productMap: Record<string, { quantidade: number; receita: number }> = {};

    sales.forEach((sale) => {
      const items = sale.items || [];
      items.forEach((item: any) => {
        const productName = item.produto?.nome || item.nome || "Produto";
        const quantity = item.quantidade || 1;
        const revenue = (item.precoUnitario || item.preco || 0) * quantity;

        if (!productMap[productName]) {
          productMap[productName] = { quantidade: 0, receita: 0 };
        }
        productMap[productName].quantidade += quantity;
        productMap[productName].receita += revenue;
      });
    });

    // Converter para array, ordenar por quantidade e pegar top 5
    return Object.entries(productMap)
      .map(([nome, data]) => ({ nome, ...data }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  };

  const totalVendas = salesData.reduce((acc, curr) => acc + curr.vendas, 0);
  const mediaDiaria = salesData.length > 0 ? totalVendas / salesData.length : 0;
  const melhorDia = salesData.length > 0 ? Math.max(...salesData.map((d) => d.vendas)) : 0;
  const totalQuantidade = salesData.reduce((acc, curr) => acc + curr.quantidade, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadSalesData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      {/* Cabeçalho */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-50 rounded-xl">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Relatório de Vendas
          </h2>
        </div>
        <p className="text-gray-500 text-sm">
          Análise detalhada do desempenho de vendas, receita e produtos mais vendidos.
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Receita Total
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalVendas)}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Média {period === "semanal" ? "Diária" : "Mensal"}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(mediaDiaria)}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Itens
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {totalQuantidade}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Melhor {period === "semanal" ? "Dia" : "Mês"}
            </span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(melhorDia)}
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Evolução de Vendas
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {period === "semanal" ? "Receita por dia da semana" : "Receita por mês"}
            </p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setPeriod("semanal")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                period === "semanal"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setPeriod("mensal")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                period === "mensal"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Mensal
            </button>
          </div>
        </div>

        {salesData.length > 0 ? (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 5, left: -5, bottom: 10 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2e7d32" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <Tooltip
                  cursor={{ stroke: "#e5e7eb", strokeWidth: 1, strokeDasharray: "4 4" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    padding: "10px 14px",
                    backgroundColor: "#ffffff",
                  }}
                  labelStyle={{ color: "#6b7280", fontWeight: 600, marginBottom: "4px" }}
                  itemStyle={{ color: "#111827", fontWeight: 700 }}
                  formatter={(value: number) => [formatCurrency(value), "Receita"]}
                />

                <XAxis
                  dataKey="dia"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  dy={10}
                />

                <YAxis hide domain={["dataMin - 200", "dataMax + 300"]} />

                <Area
                  type="monotone"
                  dataKey="vendas"
                  stroke="#2e7d32"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                  activeDot={{ r: 6, fill: "#2e7d32" }}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[320px] flex items-center justify-center text-gray-400">
            Sem dados de vendas para mostrar
          </div>
        )}
      </div>

      {/* Tabela de Produtos Mais Vendidos */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Produtos Mais Vendidos
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Top produtos em quantidade e receita
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Receita
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topProducts.length > 0 ? (
                topProducts.map((produto, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {produto.nome}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {produto.quantidade} un
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(produto.receita)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                    Nenhum produto vendido
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}