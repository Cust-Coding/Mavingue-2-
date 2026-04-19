'use client';

import Link from "next/link";
import { 
  Building2, 
  Droplets, 
  CreditCard, 
  FileText, 
  Package, 
  BarChart3,
  Check,
  ArrowRight,
  Shield,
  Clock,
  Headphones
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function ServicosPage() {
  const { t } = useI18n();

  const services = [
    {
      title: t("services.materials.title"),
      description: t("services.materials.description"),
      features: (t("services.materials.features") as unknown as string[]) || [],
      link: "/catalogo",
      icon: Building2
    },
    {
      title: t("services.water.title"),
      description: t("services.water.description"),
      features: (t("services.water.features") as unknown as string[]) || [],
      link: "/cliente/agua",
      icon: Droplets
    },
    {
      title: t("services.payments.title"),
      description: t("services.payments.description"),
      features: (t("services.payments.features") as unknown as string[]) || [],
      link: "/cliente/pagamentos",
      icon: CreditCard
    },
    {
      title: t("services.invoices.title"),
      description: t("services.invoices.description"),
      features: (t("services.invoices.features") as unknown as string[]) || [],
      link: "/cliente/faturas",
      icon: FileText
    },
    {
      title: t("services.stock.title"),
      description: t("services.stock.description"),
      features: (t("services.stock.features") as unknown as string[]) || [],
      link: "/cliente/stock",
      icon: Package
    },
    {
      title: t("services.projects.title"),
      description: t("services.projects.description"),
      features: (t("services.projects.features") as unknown as string[]) || [],
      link: "/cliente/projetos",
      icon: BarChart3
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("services.title")}</h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              {t("services.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Servics Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow group">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{service.title}</h3>
                  <p className="text-slate-600 mb-4 leading-relaxed">{service.description}</p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-slate-500 flex items-center gap-2">
                        <Check size={14} className="text-orange-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={service.link} className="text-orange-600 font-semibold text-sm hover:text-orange-700 transition flex items-center gap-1 group/link">
                    {t("services.learnMore")}
                    <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Porquê a Mavingue Digital */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">{t("services.whyChoose")}</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {t("services.whyChooseDesc")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield size={22} className="text-orange-600" />
              </div>
              <div className="text-lg font-bold text-slate-800 mb-1">{t("services.transparency")}</div>
              <p className="text-sm text-slate-500">{t("services.transparencyDesc")}</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock size={22} className="text-orange-600" />
              </div>
              <div className="text-lg font-bold text-slate-800 mb-1">{t("services.convenience")}</div>
              <p className="text-sm text-slate-500">{t("services.convenienceDesc")}</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield size={22} className="text-orange-600" />
              </div>
              <div className="text-lg font-bold text-slate-800 mb-1">{t("services.security")}</div>
              <p className="text-sm text-slate-500">{t("services.securityDesc")}</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Headphones size={22} className="text-orange-600" />
              </div>
              <div className="text-lg font-bold text-slate-800 mb-1">{t("services.support")}</div>
              <p className="text-sm text-slate-500">{t("services.supportDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">{t("about.cta")}</h2>
          <p className="text-slate-600 mb-8">
            {t("about.ctaDesc")}
          </p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition">
            {t("common.register")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}