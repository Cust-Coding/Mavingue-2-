"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Home, ArrowRight } from "lucide-react";

export default function Error502Page() {
  const [countdown, setCountdown] = useState(10);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRetry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Ícone */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-orange-500" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-5xl font-bold text-slate-800 dark:text-white mb-3">502</h1>
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Serviço temporariamente indisponível
        </h2>

        {/* Mensagem */}
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          O servidor está a demorar mais do que o esperado para responder. 
          Isto pode acontecer quando o serviço está a iniciar ou está sobrecarregado.
        </p>

        {/* Informação adicional */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">💡 O que podes fazer:</span>
            <br />
            • Aguarda alguns segundos e tenta novamente
            <br />
            • Verifica a tua ligação à internet
            <br />
            • Se o problema persistir, contacta o suporte
          </p>
        </div>

        {/* Contagem regressiva */}
        {countdown > 0 && !isRetrying && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            A tentar novamente em {countdown} segundo{countdown !== 1 ? "s" : ""}...
          </p>
        )}

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50"
          >
            {isRetrying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                A tentar...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </>
            )}
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Home className="w-4 h-4" />
            Voltar para o início
          </Link>
        </div>

        {/* Contacto */}
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-6">
          Precisa de ajuda?{' '}
          <a href="/contactos" className="text-orange-600 hover:underline">
            Contacte-nos
          </a>
        </p>
      </div>
    </div>
  );
}