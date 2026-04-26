export default function ForbiddenPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <section className="rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">403</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Acesso negado</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Esta conta nao tem permissao para abrir esta area. Se isto nao estiver correcto, um administrador pode rever as permissoes atribuidas.
        </p>
      </section>
    </main>
  );
}
