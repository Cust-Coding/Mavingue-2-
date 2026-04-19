'use client';

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function SobrePage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("about.title")}</h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              {t("about.description")}
            </p>
          </div>
        </div>
      </section>

      {/* msg*/}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">{t("about.history")}</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("about.historyText")}
              </p>
            </div>
            <div className="hidden lg:block bg-slate-100 rounded-2xl p-8 text-center">
              <div className="text-5xl font-bold text-orange-600 mb-2">+10</div>
              <p className="text-slate-600">{t("about.years")}</p>
              <div className="text-5xl font-bold text-orange-600 mt-6 mb-2">+500</div>
              <p className="text-slate-600">{t("about.projects")}</p>
              <div className="text-5xl font-bold text-orange-600 mt-6 mb-2">+1000</div>
              <p className="text-slate-600">{t("about.clients")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Missao*/}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">{t("about.pillars")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-full h-12 bg-gray-300/30 rounded-lg flex items-center justify-center mb-4">
                 <h3 className="text-xl font-bold text-slate-800 mb-3">{t("about.mission")}</h3>
              </div>
             
              <p className="text-slate-600">
                {t("about.missionText")}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
             <div className="w-full h-12 bg-gray-300/30 rounded-lg flex items-center justify-center mb-4">
                 <h3 className="text-xl font-bold text-slate-800 mb-3">{t("about.vision")}</h3>
              </div>
             
              <p className="text-slate-600">
                {t("about.visionText")}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-full h-12 bg-gray-300/30 rounded-lg flex items-center justify-center mb-4">
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{t("about.values")}</h3>
              </div>
  
              <p className="text-slate-600">
                {t("about.valuesText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
            {t("about.cta")}
          </h2>
          <p className="text-slate-600 mb-8">
            {t("about.ctaDesc")}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/register" className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition">
              Criar Conta
            </Link>
            <Link href="/catalogo" className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition">
              Ver Catálogo
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}