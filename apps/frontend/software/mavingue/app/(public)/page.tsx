'use client';

import Link from "next/link";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Landing() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animação do título
    if (!titleRef.current) return;
    gsap.fromTo(titleRef.current,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }
    );
    
    // Animação do texto (todas as frases vêm da esquerda)
    if (!textRef.current?.children) return;
    gsap.fromTo(textRef.current.children,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.2, ease: "power2.out" }
    );
    
    // Animação dos botões
    if (!buttonsRef.current?.children) return;
    gsap.fromTo(buttonsRef.current.children,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(0.5)" }
    );
    
    // Animação da secção inferior
    if (!bottomRef.current) return;
    gsap.fromTo(bottomRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  return (
    <main className="bg-white">
      
      {/* HERO */}
      <div
        className="w-screen min-h-[85vh] flex items-center justify-start relative px-6 lg:px-20 py-20 overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="max-w-4xl relative z-10">
          {/* Título */}
          <h1 
            ref={titleRef}
            className="text-[#FF4500] text-5xl lg:text-7xl font-black mb-6 tracking-tight leading-[1.05]"
          >
            Estaleiro <br />
            <span className="text-white">Mavingue</span>
          </h1>

          {/* Texto com animação da esquerda */}
          <div ref={textRef} className="text-white text-xl lg:text-2xl leading-relaxed font-medium max-w-2xl">
            <p className="mb-6">
              Seja para equipar a sua obra com os melhores materiais de
              construção ou para gerir o consumo de{" "}
              <span className="bg-[#10afd3] text-transparent bg-clip-text font-semibold">
                água
              </span>{" "}
              da sua residência, estamos aqui para facilitar o seu dia a dia.
            </p>

            <div className="border-l-4 border-[#FF4500] pl-6 text-orange-100 text-lg lg:text-xl italic">
              Através desta plataforma, terá total transparência e controlo
              sobre as suas compras e faturas, tudo a partir de um único lugar.
            </div>
          </div>

          {/* Botões */}
          <div 
            ref={buttonsRef}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              href="/catalogo"
              className="px-6 h-14 flex items-center justify-center rounded-2xl bg-[#FF4500] text-white font-bold shadow-xl shadow-[#FF4500]/30 hover:shadow-[#FF4500]/50 hover:-translate-y-1 transition-all duration-300"
            >
              Ver Catálogo
            </Link>

            <Link
              href="/auth/register"
              className="px-6 h-14 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
            >
              Criar Conta
            </Link>

            <Link
              href="/auth/login"
              className="px-6 h-14 flex items-center justify-center rounded-2xl text-white/80 font-bold hover:text-white hover:-translate-y-1 transition-all duration-300"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </div>

      {/* SECÇÃO INFERIOR */}
      <div 
        ref={bottomRef}
        className="py-16 px-6 lg:px-20 bg-gradient-to-b from-white to-gray-50"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-4">
            Catálogo público disponível
          </h2>

          <p className="text-gray-500 font-medium mb-8">
            Explore os produtos disponíveis. Para realizar compras e gerir a sua
            conta, faça login ou crie uma conta.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/catalogo"
              className="px-6 h-12 flex items-center rounded-xl bg-gray-900 text-white font-bold hover:bg-black hover:-translate-y-1 transition-all duration-300"
            >
              Explorar
            </Link>

            <Link
              href="/auth/register"
              className="px-6 h-12 flex items-center rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-100 hover:-translate-y-1 transition-all duration-300"
            >
              Registar
            </Link>

            <Link
              href="/auth/login"
              className="px-6 h-12 flex items-center rounded-xl text-gray-500 font-bold hover:text-gray-900 hover:-translate-y-1 transition-all duration-300"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}