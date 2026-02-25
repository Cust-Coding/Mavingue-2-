import Link from "next/link";

export default function Landing() {
  return (
    <div>
      <h1>Estaleiro Mavingue</h1>
      <p>Catálogo público. Para comprar, faz login.</p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/catalogo">Catálogo</Link>
        <Link href="/auth/register">Criar conta</Link>
        <Link href="/auth/login">Login</Link>
      </div>
    </div>
  );
}