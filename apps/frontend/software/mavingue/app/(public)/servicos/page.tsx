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

const services = [
  {
    title: "Venda de Materiais de Construção",
    description: "Catálogo completo de materiais para obras residenciais, comerciais e industriais. Desde cimento e ferro até acabamentos premium.",
    features: ["Produtos de qualidade certificada", "Entrega programada", "Preços competitivos"],
    link: "/catalogo",
    icon: Building2
  },
  {
    title: "Gestão de Consumo de Água",
    description: "Controlo total do consumo de água da sua residência ou empresa através da plataforma digital.",
    features: ["Leituras mensais", "Histórico de consumo", "Alertas de consumo elevado"],
    link: "/cliente/agua",
    icon: Droplets
  },
  {
    title: "Plataforma de Pagamentos Integrada",
    description: "Pague suas compras e faturas de água diretamente na plataforma, com múltiplos métodos disponíveis.",
    features: ["M-PESA, cartões de crédito/débito", "Histórico de transações", "Faturas digitais"],
    link: "/cliente/pagamentos",
    icon: CreditCard
  },
  {
    title: "Gestão de Faturas",
    description: "Aceda a todas as suas faturas num só lugar, com transparência total sobre cada transação.",
    features: ["Faturas digitais", "Histórico completo", "Download de documentos"],
    link: "/cliente/faturas",
    icon: FileText
  },
  {
    title: "Controlo de Stock para Clientes",
    description: "Clientes empresariais podem acompanhar o stock disponível e fazer reservas antecipadas.",
    features: ["Stock em tempo real", "Reserva de produtos", "Encomendas programadas"],
    link: "/cliente/stock",
    icon: Package
  },
  {
    title: "Acompanhamento de Projetos",
    description: "Para clientes empresariais, acompanhe o andamento de projetos e entregas.",
    features: ["Cronograma de entregas", "Comunicação directa", "Relatórios periódicos"],
    link: "/cliente/projetos",
    icon: BarChart3
  }
];

export default function ServicosPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Nossos Serviços</h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Soluções integradas para construção e gestão de recursos, tudo numa plataforma digital.
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
                    Saber mais
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
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Porquê escolher a Mavingue Digital</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              A Mavingue combina anos de experiência no sector da construção com uma plataforma digital moderna.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield size={22} className="text-orange-600" />
              </div>
              <div className="text-lg font-bold text-slate-800 mb-1">Transparência</div>
              <p className="text-sm text-slate-500">Controlo total sobre compras e faturas</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock size={22} className="text-orange-600" />
              </div>
              <div className="text-lg font-bold text-slate-800 mb-1">Comodidade</div>
              <p className="text-sm text-slate-500">Tudo num só lugar, 24/7</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield size={22} className="text-orange-600" />
              </div>
              <div className="text-lg font-bold text-slate-800 mb-1">Segurança</div>
              <p className="text-sm text-slate-500">Dados protegidos e pagamentos seguros</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Headphones size={22} className="text-orange-600" />
              </div>
              <div className="text-lg font-bold text-slate-800 mb-1">Suporte</div>
              <p className="text-sm text-slate-500">Atendimento dedicado</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Comece hoje</h2>
          <p className="text-slate-600 mb-8">
            Crie sua conta e tenha acesso a todos os serviços da plataforma Mavingue.
          </p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition">
            Criar Conta Gratuita
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}