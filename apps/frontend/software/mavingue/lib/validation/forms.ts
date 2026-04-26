export type ValidationErrors<T extends string = string> = Partial<Record<T, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOZ_PHONE_REGEX = /^(8\d{8}|2588\d{8})$/;

export function normalizeEmail(value: string) {
  const normalized = value.trim().toLowerCase();
  return normalized || "";
}

export function normalizeMozPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (MOZ_PHONE_REGEX.test(digits) && digits.length === 9) {
    return `+258${digits}`;
  }

  if (MOZ_PHONE_REGEX.test(digits) && digits.length === 12) {
    return `+${digits}`;
  }

  return "";
}

export function isValidMozPhone(value: string) {
  return normalizeMozPhone(value) !== "";
}

export function isValidEmail(value: string) {
  return EMAIL_REGEX.test(normalizeEmail(value));
}

export function validateRequired(value: string, message: string) {
  return value.trim() ? "" : message;
}

export function validateMaxLength(value: string, max: number, message: string) {
  return value.trim().length > max ? message : "";
}

export function validateOptionalEmail(value: string) {
  if (!value.trim()) return "";
  return isValidEmail(value) ? "" : "Introduza um email valido.";
}

export function validateMozPhone(value: string, requiredMessage = "Numero de telefone e obrigatorio.") {
  if (!value.trim()) return requiredMessage;
  if (!isValidMozPhone(value)) {
    return "Use um numero valido de Mocambique, com ou sem +258.";
  }
  return "";
}

export function validatePasswordStrength(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Senha e obrigatoria.";
  if (trimmed.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
  if (!/[A-Za-z]/.test(trimmed) || !/\d/.test(trimmed)) {
    return "Use pelo menos uma letra e um numero na senha.";
  }
  return "";
}

export function validateConfirmPassword(password: string, confirmation: string) {
  if (!confirmation.trim()) return "Confirme a senha.";
  return password === confirmation ? "" : "A confirmacao de senha nao coincide.";
}

export function validateManagedClientPassword(value: string, required = false) {
  const trimmed = value.trim();
  if (!trimmed && !required) return "";
  if (!trimmed && required) return "Senha e obrigatoria.";
  if (trimmed.length < 4) return "A senha deve ter pelo menos 4 caracteres.";
  return "";
}
