"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorBox, Loading } from "@/components/ui/State";
import { customersApi } from "@/features/customers/api";
import { purchasesApi } from "@/features/purchases/api";
import { productsApi } from "@/features/products/api";
import { salesApi } from "@/features/sales/api";
import { stockApi } from "@/features/stock/api";
import { listUsers } from "@/features/users/api";
import { listWaterBills, listWaterContracts, listWaterCustomers, listWaterReadings } from "@/features/water/api";
import { getErrorMessage } from "@/lib/errors";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingBag, 
  Boxes, 
  TrendingUp, 
  TrendingDown,
  Droplets,
  ClipboardList,
  CheckCircle,
  PlusCircle,
  Droplet,
  FileText
} from "lucide-react";

type Summary = {
  users: number;
  products: number;
  customers: number;
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

const initialSummary: Summary = {
  users: 0,
  products: 0,
  customers: 0,
  stock: 0,
  purchases: 0,
  sales: 0,
  pendingPickup: 0,
  readyPickup: 0,
  waterCustomers: 0,
  waterContracts: 0,
  waterReadings: 0,
  waterBills: 0,
};

export default function AdminHome() {
  const [summary, setSummary] = useState<Summary>(initialSummary);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    (async () => {
      setLoading(true);
      setErr("");

      try {
        const [users, products, customers, stock, purchases, sales, waterCustomers, waterContracts, waterReadings, waterBills] =
          await Promise.all([
            listUsers(),
            productsApi.list(),
            customersApi.list(),
            stockApi.list(),
            purchasesApi.list(),
            salesApi.list(),
            listWaterCustomers(),
            listWaterContracts(),
            listWaterReadings(),
            listWaterBills(),
          ]);

        setSummary({
          users: users.length,
          products: products.length,
          customers: customers.length,
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
        setErr(getErrorMessage(error, "Erro ao carregar o painel"));
      } finally {
        setLoading(false);
      }
    })();
  }, [mounted]);

  const cards = [
    { label: "Utilizadores", value: summary.users, href: "/admin/utilizadores", icon: Users, color: "blue" },
    { label: "Produtos", value: summary.products, href: "/admin/produtos", icon: Package, color: "orange" },
    { label: "Clientes", value: summary.customers, href: "/admin/clientes", icon: ShoppingBag, color: "green" },
    { label: "Stock", value: summary.stock, href: "/admin/stock", icon: Boxes, color: "purple" },
    { label: "Compras", value: summary.purchases, href: "/admin/compras", icon: TrendingDown, color: "red" },
    { label: "Vendas", value: summary.sales, href: "/admin/vendas", icon: TrendingUp, color: "emerald" },
    { label: "A Preparar", value: summary.pendingPickup, href: "/admin/vendas", icon: ClipboardList, color: "yellow" },
    { label: "Prontas", value: summary.readyPickup, href: "/admin/vendas", icon: CheckCircle, color: "green" },
    { label: "Clientes Água", value: summary.waterCustomers, href: "/admin/agua", icon: Droplets, color: "cyan" },
    { label: "Ligações", value: summary.waterContracts, href: "/admin/agua", icon: Droplet, color: "teal" },
    { label: "Leituras", value: summary.waterReadings, href: "/admin/agua", icon: ClipboardList, color: "indigo" },
    { label: "Facturas Água", value: summary.waterBills, href: "/admin/agua", icon: FileText, color: "rose" },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; hover: string }> = {
      blue: { bg: "bg-blue-50", icon: "text-blue-600", hover: "hover:border-blue-200" },
      orange: { bg: "bg-orange-50", icon: "text-orange-600", hover: "hover:border-orange-200" },
      green: { bg: "bg-green-50", icon: "text-green-600", hover: "hover:border-green-200" },
      purple: { bg: "bg-purple-50", icon: "text-purple-600", hover: "hover:border-purple-200" },
      red: { bg: "bg-red-50", icon: "text-red-600", hover: "hover:border-red-200" },
      emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", hover: "hover:border-emerald-200" },
      yellow: { bg: "bg-yellow-50", icon: "text-yellow-600", hover: "hover:border-yellow-200" },
      cyan: { bg: "bg-cyan-50", icon: "text-cyan-600", hover: "hover:border-cyan-200" },
      teal: { bg: "bg-teal-50", icon: "text-teal-600", hover: "hover:border-teal-200" },
      indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", hover: "hover:border-indigo-200" },
      rose: { bg: "bg-rose-50", icon: "text-rose-600", hover: "hover:border-rose-200" },
    };
    return colors[color] || colors.blue;
  };

  const actionButtons = [
    { href: "/admin/produtos/novo", label: "Criar produto", icon: PlusCircle },
    { href: "/admin/utilizadores/novo", label: "Criar utilizador", icon: Users },
    { href: "/admin/vendas/nova", label: "Registar venda", icon: TrendingUp },
    { href: "/admin/agua", label: "Módulo de água", icon: Droplets },
  ];

  
  if (!mounted) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Painel Administrativo</h2>
          </div>
          <p className="text-slate-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <LayoutDashboard className="w-6 h-6 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Painel Administrativo</h2>
        </div>
      </div>

      {loading && <Loading />}
      {err && <ErrorBox text={err} />}

      {!loading && !err && (
        <>
          {/* CarDs*/}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cards.map((card) => {
              const colors = getColorClasses(card.color);
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  className={`group block bg-white border border-slate-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md ${colors.hover}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <Icon className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    <span className="text-2xl font-bold text-slate-800">{card.value}</span>
                  </div>
                  <p className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                    {card.label}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {actionButtons.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-4 text-orange-700 font-semibold transition-all duration-200 hover:bg-orange-100 hover:shadow-md"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}