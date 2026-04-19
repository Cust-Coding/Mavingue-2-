'use client';

import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TermosPage() {
  const { t } = useI18n();
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
            {t("terms.title").split(" ")[0]} <span className="text-orange-400">{t("terms.title").split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="text-xl text-slate-300">{t("terms.lastUpdated")}</p>
        </div>
      </div>

      <div ref={contentRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
            
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">1. {t("terms.title").split(" ")[0]}</h2>
              <p className="text-slate-600 leading-relaxed">
                {t("terms.title").split(" ")[0]}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">2. {t("common.explore")}</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("terms.intellectualProperty")}
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>{t("terms.intellectualProperty")}</li>
                <li>{t("terms.accountResponsibility").split(".")[0]}</li>
                <li>{t("terms.fraudCancelation").split(".")[0]}</li>
                <li>{t("terms.intellectualPropertyHeader")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">3. {t("profile.title")}</h2>
              <p className="text-slate-600 leading-relaxed">
                {t("terms.accountResponsibility")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">4. {t("cart.checkout")}</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("terms.fraudCancelation")}
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>{t("terms.fraudCancelation").split(".")[0]}</li>
                <li>{t("terms.fraudCancelation").split(".")[0]}</li>
                <li>{t("terms.fraudCancelation").split(".")[0]}</li>
                <li>{t("terms.fraudCancelation")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">5. {t("terms.intellectualPropertyHeader")}</h2>
              <p className="text-slate-600 leading-relaxed">
                {t("terms.contentOwnership")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">6. {t("terms.liabilityDisclaimer").split(".")[0]}</h2>
              <p className="text-slate-600 leading-relaxed">
                {t("terms.liabilityDisclaimer")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">7. {t("terms.changesNotice").split(".")[0]}</h2>
              <p className="text-slate-600 leading-relaxed">
                {t("terms.changesNotice")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">8. {t("contact.title")}</h2>
              <p className="text-slate-600 leading-relaxed">
                {t("terms.changesNotice").split(".")[0]}
              </p>
            </section>

          </div>
        </div>
      </div>
  );
}