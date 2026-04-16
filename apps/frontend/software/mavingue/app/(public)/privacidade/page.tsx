'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function PrivacidadePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero parallax
    gsap.fromTo(heroRef.current,
      { backgroundPosition: "50% 0%" },
      { 
        backgroundPosition: "50% 100%",
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      }
    );

    // Content fade in
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 80%",
        }
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div 
        ref={heroRef}
        className="relative py-24 bg-fixed bg-cover bg-center"
        style={{
          backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.85)), url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop')"
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
            Política de <span className="text-orange-400">Privacidade</span>
          </h1>
          <p className="text-xl text-slate-300">Última atualização: Abril 2026</p>
        </div>
      </div>

      <div ref={contentRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
            
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">1. Introdução</h2>
              <p className="text-slate-600 leading-relaxed">
                A Mavingue Materiais de Construção respeita a sua privacidade e está comprometida em proteger os seus dados pessoais. Esta política explica como recolhemos, usamos e protegemos as suas informações.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">2. Dados Recolhidos</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Podemos recolher os seguintes tipos de dados:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Informações de contacto (nome, email, telefone)</li>
                <li>Informações de pagamento</li>
                <li>Histórico de compras</li>
                <li>Dados de navegação e preferências</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">3. Uso dos Dados</h2>
              <p className="text-slate-600 leading-relaxed">
                Os seus dados são usados para processar encomendas, melhorar nossos serviços, comunicar consigo e cumprir obrigações legais. Não vendemos os seus dados a terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">4. Proteção de Dados</h2>
              <p className="text-slate-600 leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger os seus dados contra acesso não autorizado, alteração ou destruição.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">5. Os Seus Direitos</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Tem direito a:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Aceder aos seus dados pessoais</li>
                <li>Corrigir dados incorretos</li>
                <li>Solicitar a eliminação dos seus dados</li>
                <li>Optar por não receber comunicações de marketing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">6. Contactos</h2>
              <p className="text-slate-600 leading-relaxed">
                Para questões sobre esta política ou para exercer os seus direitos, contacte-nos através de <strong>privacidade@mavingue.co.mz</strong> ou pelo telefone <strong>+258 84 000 0000</strong>.
              </p>
            </section>

          </div>
        </div>
      </div>
  );
}