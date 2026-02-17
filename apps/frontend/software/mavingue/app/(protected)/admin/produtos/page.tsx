import Link from "next/link";
import { listProducts } from "@/features/products/api";
import { EmptyState, ErrorState } from "@/components/ui/State";

export default async function AdminProdutosPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const search = searchParams.search || "";
  const page = Number(searchParams.page || "0");

  try {
    const data = await listProducts({ search, page, size: 20 });

    if (!data.items.length) {
      return <EmptyState title="Sem produtos" hint="Clica em “Novo Produto” para adicionar." />;
    }

    return (
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Produtos</h1>
          <Link className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white" href="/admin/produtos/novo">
            Novo Produto
          </Link>
        </div>

        <form className="mt-4" action="/admin/produtos" method="get">
          <input
            name="search"
            defaultValue={search}
            placeholder="Pesquisar por nome ou SKU..."
            className="w-full max-w-md rounded-lg border px-3 py-2"
          />
        </form>

        <div className="mt-4 overflow-hidden rounded-2xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-right">Preço</th>
                <th className="px-4 py-3 text-center">Ativo</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3">{p.nome}</td>
                  <td className="px-4 py-3">{p.sku ?? "-"}</td>
                  <td className="px-4 py-3 text-right">{p.preco.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">{p.ativo ? "Sim" : "Não"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link className="text-blue-700 hover:underline" href={`/admin/produtos/${p.id}/editar`}>
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação simples */}
        <div className="mt-4 flex gap-2">
          {page > 0 && (
            <Link className="rounded-lg border px-3 py-2" href={`/admin/produtos?search=${encodeURIComponent(search)}&page=${page - 1}`}>
              Anterior
            </Link>
          )}
          {(page + 1) * data.size < data.total && (
            <Link className="rounded-lg border px-3 py-2" href={`/admin/produtos?search=${encodeURIComponent(search)}&page=${page + 1}`}>
              Próxima
            </Link>
          )}
        </div>
      </div>
    );
  } catch (e: any) {
    return <ErrorState message={e?.message || "Falha ao carregar produtos"} />;
  }
}
