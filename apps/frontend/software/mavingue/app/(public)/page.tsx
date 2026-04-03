import Link from "next/link";

export default function Landing() {
  return (
    <main className="bg-white">
      
      {/* HERO PREMIUM */}
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
        {/* glow decor */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#FF4500]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#10afd3]/20 rounded-full blur-[120px]" />

        <div className="max-w-4xl relative z-10">
          <h1 className="text-[#FF4500] text-5xl lg:text-7xl font-black mb-6 tracking-tight leading-[1.05]">
            Estaleiro <br />
            <span className="text-white">Mavingue</span>
          </h1>

          <div className="text-white text-xl lg:text-2xl leading-relaxed font-medium max-w-2xl">
            <p className="mb-6 opacity-90">
              Seja para equipar a sua obra com os melhores materiais de
              construção ou para gerir o consumo de{" "}
              <span className="bg-[#10afd3] text-transparent bg-clip-text font-semibold">
                água
              </span>{" "}
              da sua residência, estamos aqui para facilitar o seu dia a dia.
            </p>

            <div className="border-l-4 border-[#FF4500] pl-6 text-orange-100 text-lg lg:text-xl italic backdrop-blur-sm">
              Através desta plataforma, terá total transparência e controlo
              sobre as suas compras e faturas, tudo a partir de um único lugar.
            </div>
          </div>

          {/* CTA PREMIUM */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/catalogo"
              className="px-6 h-14 flex items-center justify-center rounded-2xl bg-[#FF4500] text-white font-bold shadow-xl shadow-[#FF4500]/30 hover:shadow-[#FF4500]/50 hover:-translate-y-1 transition-all duration-300"
            >
              Ver Catálogo
            </Link>

            <Link
              href="/auth/register"
              className="px-6 h-14 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold hover:bg-white/20 transition-all duration-300"
            >
              Criar Conta
            </Link>

            <Link
              href="/auth/login"
              className="px-6 h-14 flex items-center justify-center rounded-2xl text-white/80 font-bold hover:text-white transition-all duration-300"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </div>

      {/* SECÇÃO INFERIOR PREMIUM */}
      <div className="py-16 px-6 lg:px-20 bg-gradient-to-b from-white to-gray-50">
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
              className="px-6 h-12 flex items-center rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition"
            >
              Explorar
            </Link>

            <Link
              href="/auth/register"
              className="px-6 h-12 flex items-center rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-100 transition"
            >
              Registar
            </Link>

            <Link
              href="/auth/login"
              className="px-6 h-12 flex items-center rounded-xl text-gray-500 font-bold hover:text-gray-900 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}