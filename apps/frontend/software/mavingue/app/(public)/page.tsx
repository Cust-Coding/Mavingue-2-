'use client';

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { Product } from "@/features/products/types";
import { productsApi } from "@/features/products/api";
import { useI18n } from "@/lib/i18n";

const heroSlides = [
  {
    title: "Qualidade com confiança",
    description:
      "Descubra produtos selecionados com apresentação moderna, navegação simples e acesso rápido ao catálogo.",
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
    accent: "from-orange-500/90 to-amber-400/80",
  },
  {
    title: "Experiência visual premium",
    description:
      "Um destaque mais elegante, com carrossel dinâmico, sem perder a identidade visual da marca.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop",
    accent: "from-slate-900/80 to-orange-500/70",
  },
  {
    title: "Acesso rápido ao catálogo",
    description:
      "Tudo continua integrado à API, mantendo a regra de negócio e carregamento dos dados em tempo real.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
    accent: "from-orange-600/85 to-slate-950/70",
  },
];

export default function Landing() {
  const { t } = useI18n();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!titleRef.current) return;

    gsap.fromTo(
      titleRef.current,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }
    );

    if (textRef.current?.children) {
      gsap.fromTo(
        textRef.current.children,
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.2, ease: "power2.out" }
      );
    }

    if (buttonsRef.current?.children) {
      gsap.fromTo(
        buttonsRef.current.children,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(0.5)" }
      );
    }

    if (bottomRef.current) {
      gsap.fromTo(
        bottomRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, []);

  useEffect(() => {
    productsApi
      .list()
      .then((rows) => setProducts(rows.slice(0, 6)))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="relative overflow-hidden px-6 py-16 lg:px-20 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_top_right,_rgba(249,115,22,0.45),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.12),_transparent_28%)]" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-orange-400">
              {t("landing.publicCatalog")}
            </p>

            <h1
              ref={titleRef}
              className="text-5xl font-black leading-[1.02] tracking-tight text-orange-500 lg:text-7xl"
            >
              {t("hero.title")}
              <br />
              <span className="text-white">{t("hero.subtitle")}</span>
            </h1>

            <div
              ref={textRef}
              className="mt-8 max-w-2xl space-y-6 text-lg leading-8 text-slate-100 lg:text-xl"
            >
              <p>{t("hero.heroText")}</p>
              <div className="border-l-4 border-orange-500 pl-6 text-orange-100">
                {t("hero.transparencyText")}
              </div>
            </div>

            <div ref={buttonsRef} className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/catalogo"
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-orange-600 px-6 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-orange-700"
              >
                {t("hero.cta")}
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-white/20"
              >
                {t("hero.createAccount")}
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex h-14 items-center justify-center rounded-2xl px-6 text-sm font-bold text-white/80 transition hover:-translate-y-1 hover:text-white"
              >
                {t("hero.alreadyHaveAccount")}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[36px] bg-orange-500/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-sm">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-slate-900">
                {heroSlides.map((slide, index) => {
                  const isActive = index === activeSlide;
                  return (
                    <div
                      key={slide.title}
                      className={`absolute inset-0 transition-all duration-700 ease-out ${
                        isActive ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-[1.03]"
                      }`}
                    >
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="h-full w-full object-cover"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${slide.accent} to-transparent`} />
                      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/20 via-transparent to-white/10" />

                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="max-w-md rounded-3xl border border-white/15 bg-slate-950/45 p-5 text-white shadow-xl backdrop-blur-md">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">
                            Destaque {String(index + 1).padStart(2, "0")}
                          </p>
                          <h3 className="mt-3 text-2xl font-black leading-tight">
                            {slide.title}
                          </h3>
                          <p className="mt-3 text-sm leading-6 text-slate-200">
                            {slide.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    setActiveSlide((current) =>
                      current === 0 ? heroSlides.length - 1 : current - 1
                    )
                  }
                  className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-white/15 px-4 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/25"
                  aria-label="Slide anterior"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveSlide((current) => (current + 1) % heroSlides.length)
                  }
                  className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-white/15 px-4 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/25"
                  aria-label="Próximo slide"
                >
                  →
                </button>

                <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full border border-white/10 bg-slate-950/40 px-3 py-2 backdrop-blur-md">
                  {heroSlides.map((slide, index) => (
                    <button
                      key={slide.title}
                      type="button"
                      onClick={() => setActiveSlide(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        activeSlide === index
                          ? "w-8 bg-orange-500"
                          : "w-2.5 bg-white/40 hover:bg-white/60"
                      }`}
                      aria-label={`Ir para o slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={bottomRef}
        className="bg-gradient-to-b from-white to-slate-50 px-6 py-16 lg:px-20 dark:from-slate-950 dark:to-slate-900"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t("landing.publicCatalog")}
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-500 dark:text-slate-400">
            {t("landing.catalogDesc")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/catalogo"
              className="inline-flex h-12 items-center rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-orange-600 dark:bg-white dark:text-slate-950"
            >
              {t("common.explore")}
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex h-12 items-center rounded-2xl border border-slate-200 px-6 text-sm font-bold text-slate-700 transition hover:-translate-y-1 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              {t("landing.register")}
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-18 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">
                Catalogo em destaque
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Produtos visiveis logo na pagina inicial
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-6 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Ver catalogo completo
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              Ainda nao existem produtos carregados no catalogo.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
