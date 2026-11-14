import { toast } from "sonner";

/** Shown for actions that need the future backend. Never pretend the action succeeded. */
export function notifyNotConnected(action = "Cette action") {
  toast.info(`${action} sera disponible après la mise en service du serveur.`, {
    description: "Vous explorez actuellement AÏDA en mode démonstration.",
  });
}
