export type FieldErrors = Record<string, string>;

export class ApiClientError extends Error {
  status: number;
  fieldErrors: FieldErrors;
  code?: string;

  constructor(message: string, status = 500, fieldErrors: FieldErrors = {}, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.code = code;
  }
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function getFieldErrors(error: unknown): FieldErrors {
  if (error instanceof ApiClientError) {
    return error.fieldErrors;
  }
  return {};
}

export function getFieldError(error: unknown, ...keys: string[]) {
  const fieldErrors = getFieldErrors(error);
  for (const key of keys) {
    if (fieldErrors[key]) {
      return fieldErrors[key];
    }
  }
  return "";
}

export function isNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("ECONNREFUSED") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504") ||
    message.includes("timed out")
  );
}

export function getFriendlyErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return "O servidor esta temporariamente indisponivel. Tente novamente dentro de alguns instantes.";
  }

  return getErrorMessage(error, "Ocorreu um erro inesperado. Tente novamente.");
}
