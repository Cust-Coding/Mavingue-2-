"use client";
import { getRole } from "@/lib/auth/session";
import Link from "next/link";

export default function Checkout() {
  const role = getRole();

  return (
<div className="min-h-screen bg-white flex flex-col items-center justify-start pt-10 lg:justify-center lg:pt-0 p-4 font-sans">
      
      {/* O card cinza com largura máxima controlada para PC */}
      <div className="bg-gray-200/80 p-8 md:p-12 rounded-2xl w-full max-w-4xl shadow-sm">

        <h1 className="text-[40px] font-bold mb-4 text-black">Checkout</h1>
        
        {!role ? (
          <p className="text-lg mb-4">
            Precisas de login para finalizar. <br /> <Link href="/auth/login?next=/checkout" className="text-blue-700 underline underline-offset-1 decoration-1 hover:decoration-2 transition-all">Fazer login</Link>
          </p>
        ) : (
          <p className="text-lg mb-4">Login OK ({role}). Regista venda/compras nos portais Staff/Admin.</p>
        )}

        <p className="text-[#555] text-lg leading-relaxed mt-4">
          O checkout final “cliente compra e baixa stock” depende de endpoints específicos (ex.: criar venda por token do cliente).
          Neste momento, a venda/compra é registada pelos portais Admin/Staff usando IDs.
        </p>
      </div>
    </div>
  );
}