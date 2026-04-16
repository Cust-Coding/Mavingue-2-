export function Loading({ text = "A carregar..." }: { text?: string }) {
  return <div style={{ padding: 12 }}>{text}</div>;
}
export function ErrorBox({ text }: { text: string }) {
  return <div style={{ padding: 12, color: "crimson" }}>{text}</div>;
}
export function Empty({ text = "Sem dados." }: { text?: string }) {
  return <div style={{ padding: 12, color: "#555" }}>{text}</div>;
}