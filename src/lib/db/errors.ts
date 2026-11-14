/**
 * Error handling for AÏDA database calls.
 * Every service throws on a Supabase error — callers must never show success
 * unless the call actually resolved.
 */

export type SupabaseLikeError = { message: string; code?: string | null; details?: string | null; hint?: string | null };

const FRIENDLY: Record<string, string> = {
  "42501": "Vous n'avez pas l'autorisation d'effectuer cette action.",
  "23505": "Cet élément existe déjà (identifiant en double).",
  "23503": "Un élément lié est introuvable.",
  "23514": "Les données saisies ne respectent pas les règles AÏDA.",
  "22023": "Une information obligatoire est manquante ou invalide.",
  P0002: "Élément introuvable.",
  PGRST301: "Votre session a expiré. Reconnectez-vous.",
  PGRST116: "Élément introuvable, ou vous n'avez pas l'autorisation de le modifier.",
};

export class AidaDbError extends Error {
  readonly code: string | null;
  constructor(message: string, code: string | null, cause?: unknown) {
    super(message, { cause });
    this.name = "AidaDbError";
    this.code = code;
  }
}

/** Messages raised by AÏDA triggers/functions are already in French: keep them. */
function isAidaMessage(message: string) {
  return /[àâçéèêëîïôûùüÿœ]/i.test(message) || /^(Un|Une|Le|La|Les|Seul|Vous|Utilisez|Choisissez|Ce|Cet|Impossible|Aucun|Animal|Élevage|Mouvement|Authentification|Suppression)\b/.test(message);
}

export function toAidaError(error: SupabaseLikeError): AidaDbError {
  const code = error.code ?? null;
  const message = isAidaMessage(error.message)
    ? error.message
    : (code && FRIENDLY[code]) || "L'opération a échoué. Réessayez ou contactez un administrateur.";
  return new AidaDbError(message, code, error);
}

/** Returns data only when Supabase reported no error; otherwise throws an AidaDbError. */
export function unwrap<T>(result: { data: T | null; error: SupabaseLikeError | null }): T {
  if (result.error) throw toAidaError(result.error);
  if (result.data === null) throw new AidaDbError("Aucune donnée renvoyée par le serveur.", null);
  return result.data;
}
