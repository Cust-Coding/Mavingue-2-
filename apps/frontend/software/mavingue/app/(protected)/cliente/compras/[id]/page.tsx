type Props = { params: { id: string } };
export default function Page({ params }: Props) {
  return (
    <main>
      <h1>Cliente — Compras — Pedido {params.id}</h1>
    </main>
  );
}
