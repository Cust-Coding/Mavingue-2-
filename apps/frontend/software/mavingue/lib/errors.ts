

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function isNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("fetch") || 
         message.includes("network") || 
         message.includes("ECONNREFUSED") ||
         message.includes("502") ||
         message.includes("503") ||
         message.includes("504") ||
         message.includes("timed out");
}

export function getFriendlyErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return "⚠️ O servidor está temporariamente indisponível. Por favor, tenta novamente dentro de alguns instantes.";
  }
  
  return getErrorMessage(error, "Ocorreu um erro inesperado. Tenta novamente.");
}