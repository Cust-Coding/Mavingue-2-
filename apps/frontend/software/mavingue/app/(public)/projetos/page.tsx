'use client';

import Link from "next/link";
import { FolderOpen, ArrowRight } from "lucide-react";

export default function ProjetosPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Projetos</h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Conheça os projetos da Mavingue. Em breve disponibilizaremos o portfólio completo.
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <FolderOpen size={64} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Portfólio em breve</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Estamos a organizar o nosso portfólio de projetos para apresentar em breve.
          </p>
          <Link 
            href="/contactos" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition"
          >
            Solicitar informações
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}