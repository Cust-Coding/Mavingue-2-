"use client";
import { useEffect, useState } from "react";
import { productsApi } from "@/features/products/api";
import { Product } from "@/features/products/types";
import { useI18n } from "@/lib/i18n";

// Sub-componentes
const Loading = ({ t }: { t: (key: string) => string }) => (
  <div className="flex flex-col items-center justify-center p-20 gap-4">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-[#FF4500] rounded-full animate-spin"></div>
    <p className="text-slate-500 font-medium">{t("catalog.loading")}</p>
  </div>
);

const ErrorBox = ({ text, t }: { text: string; t: (key: string) => string }) => (
  <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 m-10 text-center">
    <p className="font-bold">{t("catalog.error")}</p>
    <p className="text-sm opacity-80">{text}</p>
  </div>
);

const Empty = ({ t }: { t: (key: string) => string }) => (
  <div className="text-center p-20">
    <div className="text-5xl mb-4">📦</div>
    <p className="text-slate-400 font-medium">{t("catalog.noProducts")}</p>
  </div>
);

export default function CatalogoProdutos() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Conexão 
  useEffect(() => {
    productsApi
      .list()
      .then(setRows)
      .catch((e: any) => setErr(e?.message ?? "Erro ao carregar catálogo"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading t={t} />;
  if (err) return <ErrorBox text={err} t={t} />;
  if (!rows.length) return <Empty t={t} />;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-20 py-16 bg-white">
      {/* Título da Seção */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {t("catalog.available")}
          </h1>
          <div className="h-1.5 w-20 bg-[#FF4500] mt-2 rounded-full"></div>
        </div>
        <span className="text-slate-400 text-sm font-medium">
          {rows.length} {t("catalog.itemsFound")}
        </span>
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {rows.map((p) => (
          <div 
            key={p.id} 
            className="group bg-[#F8F9FA] rounded-3xl p-5 transition-all duration-300 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 border border-transparent hover:border-slate-100 flex flex-col justify-between"
          >
            <div>
              {/* Espaço da Imagem */}
              <div className="relative h-48 bg-white rounded-2xl mb-5 flex items-center justify-center overflow-hidden border border-slate-50">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sem Imagem</span>
                </div>
              </div>

              {/* Infos do Produto */}
              <h3 className="font-bold text-lg text-slate-700 mb-1 group-hover:text-slate-900 transition-colors">
                {p.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                {p.description ?? t("catalog.description")}
              </p>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-[#2563EB] font-black text-2xl">{p.price}</span>
                <span className="text-[#2563EB] font-bold text-xs uppercase">{t("catalog.currency")}</span>
              </div>
              
             
              <button 
                className="w-full mt-5 bg-slate-900 text-white py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm transition-all hover:bg-[#FF4500] active:scale-95 outline-none shadow-lg shadow-slate-200 hover:shadow-[#FF4500]/20"
              >
                {t("catalog.buy")}
                <img src="/shoping.svg" alt="ícone de compra" className="w-5 h-5 brightness-0 invert" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}