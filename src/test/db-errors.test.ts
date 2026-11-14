import { describe, expect, it } from "vitest";

import { AidaDbError, unwrap } from "@/lib/db/errors";

describe("Erreurs de la base AÏDA", () => {
  it("ne renvoie jamais de succès quand Supabase signale une erreur", () => {
    expect(() => unwrap({ data: { id: "x" }, error: { message: "boom", code: "42501" } })).toThrow(AidaDbError);
  });

  it("traduit un refus d'autorisation en message clair", () => {
    expect(() => unwrap({ data: null, error: { message: "new row violates row-level security policy", code: "42501" } })).toThrow(
      "Vous n'avez pas l'autorisation d'effectuer cette action.",
    );
  });

  it("conserve les messages des règles AÏDA", () => {
    const msg = "Seul un vétérinaire de l'élevage peut poser, confirmer ou exclure un diagnostic";
    expect(() => unwrap({ data: null, error: { message: msg, code: "42501" } })).toThrow(msg);
  });

  it("renvoie les données quand il n'y a pas d'erreur", () => {
    expect(unwrap({ data: [1, 2], error: null })).toEqual([1, 2]);
  });
});
