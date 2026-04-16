'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function ClienteHome() {
  const [modalAberto, setModalAberto] = useState(false);
  const [metodoSelecionado, setMetodoSelecionado] = useState<string | null>(null);
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);

  // Refs 
  const headerRef = useRef<HTMLDivElement>(null);
  const historicoRef = useRef<HTMLDivElement>(null);
  const avisoRef = useRef<HTMLDivElement>(null);
  const consumoRef = useRef<HTMLDivElement>(null);
  const facturaRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Anim para carregar
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    )
    .fromTo(historicoRef.current,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.5, ease: "back.out(0.3)" },
      "-=0.3"
    )
    .fromTo(avisoRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" },
      "-=0.2"
    )
    .fromTo([consumoRef.current, facturaRef.current],
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "power2.out" },
      "-=0.2"
    );
  }, []);

  // Anim
  useEffect(() => {
    if (modalAberto && modalRef.current) {
      gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(0.4)" }
      );
    }
  }, [modalAberto]);

  const handleAbrirModal = () => {
    setModalAberto(true);
    setMetodoSelecionado(null);
    setAguardandoConfirmacao(false);
  };

  const handleEscolherMetodo = (metodo: string) => {
    setMetodoSelecionado(metodo);
    setAguardandoConfirmacao(true);
    
    // animacao no botAo
    gsap.to(`.btn-${metodo.replace('-', '')}`, {
      scale: 0.98,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });
  };

  const handleFecharModal = () => {
    gsap.to(modalRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.2,
      onComplete: () => {
        setModalAberto(false);
        setMetodoSelecionado(null);
        setAguardandoConfirmacao(false);
      }
    });
  };

  // Card mini
  const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${className}`}>
      {children}
    </div>
  );

  // Badge mini
  const Badge = ({ children, type = "success" }: { children: React.ReactNode; type?: "success" | "danger" | "warning" }) => {
    const cores = {
      success: "bg-emerald-50 text-emerald-700",
      danger: "bg-red-50 text-red-700",
      warning: "bg-amber-50 text-amber-700",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${cores[type]} transition-all duration-200 hover:scale-105 inline-block`}>
        {children}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cabecalho */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Olá, Cliente</h1>
            <p className="text-gray-400 text-sm mt-1">Área do cliente</p>
          </div>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Historico de compras */}
          <div ref={historicoRef} className="lg:col-span-2">
            <Card>
              <h3 className="font-semibold text-gray-800 mb-4">Histórico de Compras</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg text-sm transition-all duration-200 hover:bg-gray-100">
                  <span>Venda #102 — Entregue</span>
                  <span className="font-medium">---</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg text-sm text-amber-600 transition-all duration-200 hover:bg-gray-100">
                  <span>Venda #105 — Pendente de Entrega</span>
                  <span className="font-medium">---</span>
                </div>
              </div>
              <button className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-all duration-200 hover:translate-x-1">
                Ver todas →
              </button>
            </Card>
          </div>

          {/* Aviso */}
          <div ref={avisoRef}>
            <Card className="bg-amber-50/50 border-amber-100">
              <h3 className="font-semibold text-amber-800 mb-1">Aviso</h3>
              <p className="text-sm text-amber-700">
                Após a venda, não aceitamos devoluções. Pode comprar mesmo sem stock para reserva.
              </p>
            </Card>
          </div>
        </div>

        {/* Segunda linha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Consumo mensal */}
          <div ref={consumoRef}>
            <Card>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">Consumo Mensal</h3>
                  <p className="text-xs text-gray-400">Contador: ------</p>
                </div>
                <Badge>Ligação Activa</Badge>
              </div>
              <div className="text-3xl font-bold text-gray-800">42.5 m³</div>
              <p className="text-sm text-gray-500">Referente a Janeiro 2026</p>
            </Card>
          </div>

          {/* Ultima factura ++++ botao pagar */}
          <div ref={facturaRef}>
            <Card>
              <h3 className="font-semibold text-gray-800 mb-4">Última Factura</h3>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-2xl font-bold">---</span>
                <Badge type="warning">Pendente</Badge>
              </div>
              <button
                onClick={handleAbrirModal}
                className="w-full mt-5 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-800 active:scale-95"
              >
                Pagar
              </button>
            </Card>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 transition-all duration-200">
          <div ref={modalRef} className="bg-white rounded-2xl max-w-sm w-full shadow-xl">
            <div className="p-6">
              {!aguardandoConfirmacao ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Escolha o método</h2>
                  <p className="text-sm text-gray-400 mb-5">Selecione a forma de pagamento</p>
                  <div className="space-y-3">
                    {["M-PESA", "E-MOLA", "MKESH"].map((metodo) => (
                      <button
                        key={metodo}
                        onClick={() => handleEscolherMetodo(metodo)}
                        className={`btn-${metodo.replace('-', '')} w-full text-left px-4 py-3 border border-gray-100 rounded-xl transition-all duration-200 hover:bg-gray-50 hover:border-gray-200 hover:translate-x-1 flex justify-between items-center`}
                      >
                        <span className="font-medium text-gray-700">{metodo}</span>
                        <span className="text-gray-300 transition-all duration-200 group-hover:translate-x-1">→</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <span className="text-xl">📱</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Verifique o seu celular</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Enviamos uma notificação via <span className="font-medium">{metodoSelecionado}</span>.
                    <br />
                    Confirme a transação no seu dispositivo.
                  </p>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 p-4 flex justify-end">
              <button
                onClick={handleFecharModal}
                className="text-sm text-gray-400 transition-all duration-200 hover:text-gray-600 hover:scale-105"
              >
                {aguardandoConfirmacao ? "Fechar" : "Cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}