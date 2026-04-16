'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TermosPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
            Termos de <span className="text-orange-400">Uso</span>
          </h1>
          <p className="text-xl text-slate-300">Última atualização: Abril 2026</p>
        </div>
      </div>

      <div ref={contentRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
            
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-slate-600 leading-relaxed">
                Ao acessar e utilizar o site da Mavingue Materiais de Construção, você concorda em cumprir estes Termos de Uso. Se não concordar, não deve utilizar o nosso site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">2. Uso do Site</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Você concorda em:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Usar o site apenas para fins legais</li>
                <li>Não tentar acessar áreas restritas sem autorização</li>
                <li>Não introduzir vírus ou código malicioso</li>
                <li>Respeitar os direitos de propriedade intelectual</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">3. Contas e Registos</h2>
              <p className="text-slate-600 leading-relaxed">
                Ao criar uma conta, você é responsável por manter a confidencialidade das suas credenciais e por todas as atividades sob a sua conta. Reservamo-nos o direito de suspender ou encerrar contas a nosso critério.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">4. Compras e Pagamentos</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Ao realizar compras:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Os preços estão sujeitos a alterações sem aviso prévio</li>
                <li>As encomendas estão sujeitas à disponibilidade</li>
                <li>Os pagamentos são processados de forma segura</li>
                <li>Reservamo-nos o direito de cancelar encomendas em caso de fraude</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">5. Propriedade Intelectual</h2>
              <p className="text-slate-600 leading-relaxed">
                Todo o conteúdo deste site, incluindo textos, imagens, logótipos e design, é propriedade da Mavingue ou dos seus licenciadores e está protegido por direitos de autor e marcas registadas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">6. Limitação de Responsabilidade</h2>
              <p className="text-slate-600 leading-relaxed">
                Não garantimos que o site esteja sempre disponível ou livre de erros. Não seremos responsáveis por quaisquer danos indiretos, incidentais ou consequenciais resultantes do uso do site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">7. Alterações aos Termos</h2>
              <p className="text-slate-600 leading-relaxed">
                Reservamo-nos o direito de alterar estes termos a qualquer momento. As alterações serão publicadas nesta página e entrarão em vigor imediatamente após a publicação.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">8. Contactos</h2>
              <p className="text-slate-600 leading-relaxed">
                Para questões sobre estes termos, contacte-nos através de <strong>legal@mavingue.co.mz</strong> ou pelo telefone <strong>+258 84 000 0000</strong>.
              </p>
            </section>

          </div>
        </div>
      </div>
  );
}