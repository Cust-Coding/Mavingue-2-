// app/page.tsx
import Link from 'next/link'


export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(59,130,246,0.1),transparent)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(30%_30%_at_30%_30%,rgba(168,85,247,0.1),transparent)]" />

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/30 blur-xl" />

            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Bem-vindo ao{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Next.js 14
            </span>
          </h1>

          <p className="mt-8 text-lg leading-8 text-gray-600 sm:text-xl">
            Construído com as mais recentes tecnologias para oferecer a melhor experiência
            em desenvolvimento web moderno.
          </p>

          <div className="mt-12 flex items-center justify-center gap-6">
            <Link
              href="/docs"
              className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span>Começar agora</span>
               </Link>

            <Link
              href="/about"
              className="group inline-flex items-center justify-center rounded-full bg-white/80 px-8 py-4 text-sm font-semibold text-gray-700 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Saiba mais
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Recursos incríveis para você
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Tudo o que você precisa para construir aplicações modernas e escaláveis
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="group relative rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">Performance</h3>
              <p className="text-gray-600 leading-relaxed">
                Renderização rápida e otimizada com as melhores práticas do Next.js 14
              </p>
              <div className="absolute bottom-8 left-8 right-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 transition-transform group-hover:scale-x-100" />
            </div>

            {/* Card 2 */}
            <div className="group relative rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
               
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">Componentes Modernos</h3>
              <p className="text-gray-600 leading-relaxed">
                Construído com Tailwind CSS para uma experiência visual impressionante
              </p>
              <div className="absolute bottom-8 left-8 right-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 transition-transform group-hover:scale-x-100" />
            </div>

            {/* Card 3 */}
            <div className="group relative rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl sm:col-span-2 lg:col-span-1">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg">
                
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">Design System</h3>
              <p className="text-gray-600 leading-relaxed">
                Interface limpa e moderna com componentes totalmente customizáveis
              </p>
              <div className="absolute bottom-8 left-8 right-8 h-0.5 bg-gradient-to-r from-pink-500 to-red-500 scale-x-0 transition-transform group-hover:scale-x-100" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-blue-50 to-transparent" />

        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Pronto para começar sua jornada?
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Junte-se a milhares de desenvolvedores que já estão usando Next.js
          </p>

          <div className="mt-10">
            <button className="group relative inline-flex items-center justify-center rounded-full bg-gray-900 px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-gray-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
              <span>Iniciar projeto</span>
              
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 px-6 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl text-center text-sm text-gray-600">
          <p>© 2024 Meu App Next.js. Todos os direitos reservados.</p>
          <p className="mt-2">
            Construído com ❤️ usando Next.js 14 e Tailwind CSS
          </p>
        </div>
      </footer>
    </main>
  )
}