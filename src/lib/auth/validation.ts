import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Saisissez votre adresse e-mail.")
  .max(255, "L'adresse e-mail est trop longue.")
  .email("Adresse e-mail invalide.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Saisissez votre mot de passe.").max(72, "Mot de passe trop long."),
});

/** Keeps a leading + and digits only. */
export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Saisissez votre nom complet.")
      .max(100, "Le nom doit faire moins de 100 caractères."),
    email,
    phone: z
      .string()
      .trim()
      .min(1, "Saisissez votre numéro de téléphone.")
      .refine((v) => /^[+\d][\d\s.()-]*$/.test(v), "Utilisez uniquement des chiffres, espaces et +.")
      .transform(normalizePhone)
      .refine((v) => /^\+?\d{8,15}$/.test(v), "Numéro invalide (8 à 15 chiffres, ex. +225 07 00 00 00 00)."),
    password: z
      .string()
      .min(8, "Au moins 8 caractères.")
      .max(72, "72 caractères au maximum.")
      .refine((v) => /[A-Za-zÀ-ÿ]/.test(v) && /\d/.test(v), "Utilisez au moins une lettre et un chiffre."),
    confirmPassword: z.string().min(1, "Confirmez votre mot de passe."),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  });

export type FieldName = "email" | "password" | "fullName" | "phone" | "confirmPassword" | "form";
export type FieldErrors = Partial<Record<FieldName, string>>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form") as FieldName;
    out[key] ??= issue.message;
  }
  return out;
}

type AuthLikeError = { message?: string | undefined; code?: string | undefined; status?: number | undefined; name?: string | undefined };

/** Turns Supabase Auth errors into clear French messages; never echoes raw server text. */
export function authErrorMessage(error: AuthLikeError | null | undefined): string {
  if (!error) return "Une erreur inattendue est survenue. Réessayez.";
  const code = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();
  if (code === "invalid_credentials" || msg.includes("invalid login credentials"))
    return "Adresse e-mail ou mot de passe incorrect.";
  if (code === "email_not_confirmed" || msg.includes("email not confirmed"))
    return "Votre adresse e-mail n'est pas encore confirmée. Ouvrez le lien reçu par e-mail, puis reconnectez-vous.";
  if (code === "user_already_exists" || msg.includes("already registered"))
    return "Un compte existe déjà avec cette adresse e-mail. Connectez-vous.";
  if (code === "weak_password" || msg.includes("password should"))
    return "Ce mot de passe est trop faible. Choisissez-en un plus long et plus varié.";
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || error.status === 429)
    return "Trop de tentatives. Patientez quelques minutes avant de réessayer.";
  if (code === "signup_disabled" || msg.includes("signups not allowed"))
    return "Les inscriptions sont actuellement fermées.";
  if (code === "email_address_invalid" || code === "email_address_not_authorized")
    return "Cette adresse e-mail ne peut pas être utilisée. Essayez une autre adresse.";
  if (msg.includes("sending confirmation email") || msg.includes("error sending"))
    return "L'e-mail de confirmation n'a pas pu être envoyé. Réessayez plus tard.";
  if (error.name === "AuthRetryableFetchError" || msg.includes("failed to fetch") || msg.includes("network"))
    return "Impossible de joindre le serveur. Vérifiez votre connexion internet.";
  return "Une erreur est survenue. Réessayez.";
}
