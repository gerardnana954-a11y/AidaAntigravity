import { useQuery } from "@tanstack/react-query";
import { ImageOff, Loader2, PawPrint } from "lucide-react";

import { photoQuery } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

/** Private photo, served through a short-lived signed link. */
export function AnimalPhoto({ path, alt, className }: { path: string | null; alt: string; className?: string }) {
  const query = useQuery({ ...photoQuery(path ?? ""), enabled: Boolean(path) });
  const frame = cn("flex items-center justify-center overflow-hidden rounded-2xl bg-secondary text-secondary-foreground", className);
  if (!path)
    return (
      <div className={frame}>
        <PawPrint className="size-10 opacity-60" />
      </div>
    );
  if (query.isPending)
    return (
      <div className={frame} role="status" aria-label="Chargement de la photo">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  if (query.isError)
    return (
      <div className={cn(frame, "flex-col gap-2 text-xs")}>
        <ImageOff className="size-6" /> Photo indisponible
      </div>
    );
  return <img src={query.data} alt={alt} className={cn("rounded-2xl object-cover", className)} />;
}
