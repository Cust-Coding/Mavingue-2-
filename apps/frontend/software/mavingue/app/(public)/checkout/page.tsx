"use client";
import { getRole } from "@/lib/auth/session";
import Link from "next/link";

export default function Checkout() {
  const role = getRole();

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>Checkout</h2>

      {!role ? (
        <p>
          Precisas de login para finalizar. <Link href="/auth/login?next=/checkout">Fazer login</Link>
        </p>
      ) : (
        <p>Login OK ({role}). Regista venda/compras nos portais Staff/Admin.</p>
      )}

      <p style={{ color: "#555" }}>
        O checkout final “cliente compra e baixa stock” depende de endpoints específicos (ex.: criar venda por token do cliente).
        Neste momento, a venda/compra é registada pelos portais Admin/Staff usando IDs.
      </p>
    </div>
  );
}