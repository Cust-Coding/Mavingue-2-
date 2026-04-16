'use client';

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: "Como posso fazer uma encomenda?",
    answer: "Pode fazer encomendas através do nosso catálogo online, contactando-nos por telefone ou visitando uma das nossas lojas. Para encomendas online, basta selecionar os produtos desejados e seguir o processo de checkout."
  },
  {
    question: "Quais são os métodos de pagamento disponíveis?",
    answer: "Aceitamos pagamento em dinheiro, transferência bancária, M-Pesa e cartões de crédito/débito. Para encomendas grandes, oferecemos pagamento a prazo mediante aprovação de crédito."
  },
  {
    question: "Qual é o prazo de entrega?",
    answer: "O prazo de entrega varia conforme a localização e disponibilidade dos produtos. Em Maputo, a entrega geralmente ocorre em 24-48 horas. Para outras provinces, consulte-nos para obter uma estimativa."
  },
  {
    question: "Posso devolver ou trocar produtos?",
    answer: "Sim, aceitamos devoluções dentro de 14 dias após a compra, desde que os produtos estejam em condições originais e com embalagem. Produtos personalizados ou danificados por uso não são elegíveis para devolução."
  },
  {
    question: "Vocês oferecem entrega gratuita?",
    answer: "Oferecemos entrega gratuita para encomendas acima de 5.000 MT dentro de Maputo. Para outras áreas, aplicamos uma taxa de entrega baseada na distância e volume da encomenda."
  },
  {
    question: "Como posso rastrear a minha encomenda?",
    answer: "Após a confirmação da encomenda, receberá um número de rastreio por SMS ou email. Também pode acompanhar o estado da sua encomenda através da sua conta no nosso site ou contactando o nosso serviço ao cliente."
  },
  {
    question: "Vocês vendem a profissionais e empresas?",
    answer: "Sim, temos condições especiais para profissionais da construção, empreiteiros e empresas. Contacte-nos para obter informações sobre preços de grosso e condições de pagamento corporativo."
  },
  {
    question: "Como posso contactar o suporte ao cliente?",
    answer: "Pode contactar-nos por telefone (+258 84 000 0000), email (info@mavingue.co.mz), ou através do chat no nosso site. O nosso horário de atendimento é de segunda a sábado, das 7h00 às 18h00."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const faqsRef = useRef<HTMLDivElement>(null);

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

    gsap.fromTo(faqsRef.current?.children || [],
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: faqsRef.current,
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
            Perguntas <span className="text-orange-400">Frequentes</span>
          </h1>
          <p className="text-xl text-slate-300">Encontre respostas para as dúvidas mais comuns</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div ref={faqsRef} className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-800">{faq.question}</span>
                  <span className={`text-orange-500 text-2xl transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-10 text-center shadow-2xl shadow-orange-500/20">
            <h3 className="text-2xl font-bold text-white mb-3">Não encontrou a resposta?</h3>
            <p className="text-orange-100 mb-6 text-lg">Contacte-nos e responderemos rapidamente.</p>
            <a 
              href="mailto:info@mavingue.co.mz" 
              className="inline-block px-8 py-4 bg-white hover:bg-slate-100 text-orange-600 font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Contactar Suporte
            </a>
          </div>
        </div>
      </div>
  );
}