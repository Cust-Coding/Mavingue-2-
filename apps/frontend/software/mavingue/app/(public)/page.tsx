'use client';

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { Product } from "@/features/products/types";
import { productsApi } from "@/features/products/api";
import { useI18n } from "@/lib/i18n";

// Array 
const backgroundImages = [
  "/back.jpeg",
  "/back2.jpg",
  "/intro.jpg",
];

export default function Landing() {
  const { t } = useI18n();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Imgs - carrossel simples
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 20000); 

    return () => clearInterval(interval);
  }, []);

  // Gsapp
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
  
  //IMgs
  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0.8 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [currentImageIndex]);

  useEffect(() => {
    productsApi
      .list()
      .then((rows) => setProducts(rows.slice(0, 6)))
      .catch(() => setProducts([]));
  }, []);

  return (
    <main className="bg-white dark:bg-slate-950">
      <section
        ref={sectionRef}
        className="relative flex min-h-[78vh] items-center overflow-hidden px-6 py-20 transition-all duration-500 lg:px-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.68)), url('${backgroundImages[currentImageIndex]}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="relative z-10 max-w-4xl">
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

        {/* indicadores */}
        {backgroundImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? "w-8 bg-orange-500" 
                    : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        )}

     
      </section>

      <section ref={bottomRef} className="bg-gradient-to-b from-white to-slate-50 px-6 py-16 lg:px-20 dark:from-slate-950 dark:to-slate-900">
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