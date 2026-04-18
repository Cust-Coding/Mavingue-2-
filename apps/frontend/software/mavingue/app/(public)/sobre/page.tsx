'use client';

import Link from "next/link";

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Sobre a Mavingue</h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Líder em materiais de construção em Moçambique, agora digitalizada para oferecer 
              controlo total sobre suas compras, consumo de água e pagamentos.
            </p>
          </div>
        </div>
      </section>

      {/* msg*/}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Nossa História</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                A Mavingue nasceu com o propósito de fornecer materiais de construção de alta qualidade 
                para projetos residenciais, comerciais e industriais em Moçambique. Ao longo dos anos, 
                construímos uma reputação baseada na confiança, qualidade dos produtos e compromisso com 
                os prazos de entrega.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Hoje, damos um passo além ao digitalizar nossos serviços. Através da nossa plataforma, 
                clientes podem gerir compras, acompanhar consumo de água, aceder a faturas e realizar 
                pagamentos de forma transparente e eficiente.
              </p>
            </div>
            <div className="hidden lg:block bg-slate-100 rounded-2xl p-8 text-center">
              <div className="text-5xl font-bold text-orange-600 mb-2">+10</div>
              <p className="text-slate-600">Anos de experiência</p>
              <div className="text-5xl font-bold text-orange-600 mt-6 mb-2">+500</div>
              <p className="text-slate-600">Projetos concluídos</p>
              <div className="text-5xl font-bold text-orange-600 mt-6 mb-2">+1000</div>
              <p className="text-slate-600">Clientes satisfeitos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Missao*/}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">Nossos Pilares</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-full h-12 bg-gray-300/30 rounded-lg flex items-center justify-center mb-4">
                 <h3 className="text-xl font-bold text-slate-800 mb-3">Missão</h3>
              </div>
             
              <p className="text-slate-600">
                Fornecer materiais de construção de qualidade com excelência no atendimento, 
                aliado à inovação digital para facilitar a gestão de obras e consumo doméstico.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
             <div className="w-full h-12 bg-gray-300/30 rounded-lg flex items-center justify-center mb-4">
                 <h3 className="text-xl font-bold text-slate-800 mb-3">Visão</h3>
              </div>
             
              <p className="text-slate-600">
                Ser referência em Moçambique na integração entre construção civil e tecnologia, 
                oferecendo soluções completas para clientes e parceiros.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-full h-12 bg-gray-300/30 rounded-lg flex items-center justify-center mb-4">
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Valores</h3>
              </div>
  
              <p className="text-slate-600">
                Qualidade, transparência, inovação, compromisso com prazos e satisfação do cliente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
            Faça parte da nova era da construção em Moçambique
          </h2>
          <p className="text-slate-600 mb-8">
            Crie sua conta e tenha controlo total sobre suas compras, consumo de água e pagamentos.
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