import { describe, expect, it } from "vitest";

import { isAdmin, roleLabels, safeRedirect } from "@/lib/auth/roles";
import { authErrorMessage, signupSchema } from "@/lib/auth/validation";

const valid = {
  fullName: "Awa Koné",
  email: "awa@exemple.ci",
  phone: "+225 07 01 02 03 04",
  password: "Savane2026",
  confirmPassword: "Savane2026",
};

describe("Inscription", () => {
  it("accepte un formulaire complet et normalise le téléphone", () => {
    const r = signupSchema.safeParse(valid);
    expect(r.success && r.data.phone).toBe("+2250701020304");
  });

  it("refuse des mots de passe différents", () => {
    const r = signupSchema.safeParse({ ...valid, confirmPassword: "Autre2026" });
    expect(r.success).toBe(false);
  });

  it("refuse un mot de passe de moins de 8 caractères", () => {
    expect(signupSchema.safeParse({ ...valid, password: "Ab1", confirmPassword: "Ab1" }).success).toBe(false);
  });

  it("ignore tout champ de rôle envoyé par le navigateur", () => {
    const r = signupSchema.safeParse({ ...valid, role: "admin" });
    expect(r.success && "role" in r.data).toBe(false);
  });
});

describe("Rôles", () => {
  it("seul le rôle global admin ouvre l'administration", () => {
    expect(isAdmin({ appRoles: ["admin"] })).toBe(true);
    expect(isAdmin({ appRoles: ["supervisor"] })).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });

  it("traduit les rôles d'élevage en français", () => {
    const labels = roleLabels({
      appRoles: [],
      farms: [
        { farmId: "a", farmName: null, role: "owner", permissions: [] },
        { farmId: "b", farmName: null, role: "veterinarian", permissions: [] },
      ],
    });
    expect(labels).toEqual(["Propriétaire", "Vétérinaire"]);
  });
});

describe("Redirection après connexion", () => {
  it.each([
    ["/app/animaux", "/app/animaux"],
    ["/app", "/app"],
    ["https://evil.example/app", "/app"],
    ["//evil.example", "/app"],
    ["/application", "/app"],
    [undefined, "/app"],
  ])("%s → %s", (input, expected) => {
    expect(safeRedirect(input)).toBe(expected);
  });
});

describe("Messages d'erreur", () => {
  it("annonce un mot de passe incorrect sans détail technique", () => {
    expect(authErrorMessage({ code: "invalid_credentials", message: "Invalid login credentials" })).toBe(
      "Adresse e-mail ou mot de passe incorrect.",
    );
  });
});
