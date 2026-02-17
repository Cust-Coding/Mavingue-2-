type Props = { params: { id: string } };
export default function Page({ params }: Props) {
  return (
    <main>
      <h1>Admin — Editar utilizador {params.id}</h1>
    </main>
  );
}
