'use client';

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger);

export default function FAQPage() {
  const { t } = useI18n();

  const faqs = [
    { question: t("faq.questions.order.question"), answer: t("faq.questions.order.answer") },
    { question: t("faq.questions.payment.question"), answer: t("faq.questions.payment.answer") },
    { question: t("faq.questions.delivery.question"), answer: t("faq.questions.delivery.answer") },
    { question: t("faq.questions.returns.question"), answer: t("faq.questions.returns.answer") },
    { question: t("faq.questions.freeDelivery.question"), answer: t("faq.questions.freeDelivery.answer") },
    { question: t("faq.questions.tracking.question"), answer: t("faq.questions.tracking.answer") },
    { question: t("faq.questions.business.question"), answer: t("faq.questions.business.answer") },
    { question: t("faq.questions.support.question"), answer: t("faq.questions.support.answer") },
  ];
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
            {t("faq.title").split(" ")[0]} <span className="text-orange-400">{t("faq.title").split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="text-xl text-slate-300">{t("faq.subtitle")}</p>
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