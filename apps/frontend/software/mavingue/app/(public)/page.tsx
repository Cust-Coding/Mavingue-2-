import Link from "next/link";

export default function Landing() {
  return (
   <main>
    <div
      className="w-screen min-h-[60vh] flex items-center justify-start relative px-6 lg:px-20 py-20"
      style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop')", 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment:"fixed"
      }}>
      <div className="max-w-4xl">
        <h1 className="text-[#FF4500] text-5xl lg:text-7xl font-black mb-6 tracking-tight">
          Estaleiro Mavingue
        </h1>
        <div className="text-white text-xl lg:text-2xl leading-relaxed font-medium max-w-2xl">
          <p className="mb-6">
            Seja para equipar a sua obra com os melhores materiais de construção ou para gerir o consumo de <span className="bg-[#10afd3] text-transparent bg-clip-text ">água</span> da sua residência, estamos aqui para facilitar o seu dia a dia.
          </p>
          <div className="border-l-4 border-[#FF4500] pl-6 text-orange-100 text-lg lg:text-xl italic">
            Através desta plataforma, terá total transparência e controlo sobre as suas compras e faturas, tudo a partir de um único lugar.
          </div>
        </div>
      </div>
    </div>
    <div className="py-10">
      <p>Catálogo público. Para comprar, faz login.</p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/catalogo">Catálogo</Link>
        <Link href="/auth/register">Criar conta</Link>
        <Link href="/auth/login">Login</Link>
      </div>
    </div>
   </main> 
    
  );
}