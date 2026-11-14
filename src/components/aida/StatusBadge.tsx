import { Badge, type BadgeProps } from "@/components/ui/badge";

const MAP: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
  actif: { label: "Actif", variant: "success" },
  en_observation: { label: "En observation", variant: "warning" },
  vendu: { label: "Vendu", variant: "muted" },
  validé: { label: "Validé", variant: "success" },
  en_attente: { label: "En attente", variant: "warning" },
  à_vérifier: { label: "À vérifier", variant: "danger" },
  en_cours: { label: "En cours", variant: "info" },
  clôturée: { label: "Clôturée", variant: "muted" },
  élevée: { label: "Priorité élevée", variant: "danger" },
  moyenne: { label: "Priorité moyenne", variant: "warning" },
  faible: { label: "Priorité faible", variant: "muted" },
  invité: { label: "Invité", variant: "info" },
  suspendu: { label: "Suspendu", variant: "danger" },
  non_enrolé: { label: "Non enrôlé", variant: "muted" },
};

export function StatusBadge({ status }: { status: string }) {
  const entry = MAP[status] ?? { label: status, variant: "muted" as const };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}
