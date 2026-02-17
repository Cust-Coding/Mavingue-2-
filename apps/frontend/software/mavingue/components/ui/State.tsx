export function LoadingState({ label = "A carregar..." }: { label?: string }) {
  return <div className="p-6 text-slate-600">{label}</div>;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="p-6">
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        {message}
      </div>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="p-6">
      <div className="rounded-xl border bg-white p-6">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        {hint && <p className="mt-1 text-slate-600">{hint}</p>}
      </div>
    </div>
  );
}
