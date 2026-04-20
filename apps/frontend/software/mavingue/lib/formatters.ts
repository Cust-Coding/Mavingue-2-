export function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return `${amount.toFixed(2)} MT`;
}

export function formatDateTime(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-MZ", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-MZ", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function formatPaymentMethod(value?: string | null) {
  switch (value) {
    case "CARTEIRA_MOVEL":
      return "Carteira movel";
    case "CARTAO":
      return "Cartao";
    case "DINHEIRO_FISICO":
      return "Dinheiro fisico";
    default:
      return value ?? "-";
  }
}

export function formatPickupStatus(value?: string | null) {
  switch (value) {
    case "AGUARDANDO_PREPARACAO":
      return "A preparar";
    case "PRONTO_PARA_LEVANTAMENTO":
      return "Pronto para levantamento";
    case "LEVANTADO":
      return "Levantado";
    default:
      return value ?? "-";
  }
}

export function pickupTone(value?: string | null) {
  switch (value) {
    case "LEVANTADO":
      return "emerald" as const;
    case "PRONTO_PARA_LEVANTAMENTO":
      return "amber" as const;
    default:
      return "slate" as const;
  }
}

export function paymentTone(value?: string | null) {
  switch (value) {
    case "PAGO":
      return "emerald" as const;
    case "ATRASADO":
      return "rose" as const;
    default:
      return "amber" as const;
  }
}
