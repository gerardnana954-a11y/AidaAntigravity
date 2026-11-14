import { Badge } from "@/components/ui/badge";
import {
  ANIMAL_STATUS,
  FARM_STATUS,
  MEMBERSHIP_STATUS,
  type DbAnimalStatus,
  type DbFarmStatus,
  type DbMembershipStatus,
} from "@/lib/db/labels";

export function AnimalStatusBadge({ status }: { status: DbAnimalStatus }) {
  const s = ANIMAL_STATUS[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function FarmStatusBadge({ status }: { status: DbFarmStatus }) {
  const s = FARM_STATUS[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function MemberStatusBadge({ status }: { status: DbMembershipStatus }) {
  const s = MEMBERSHIP_STATUS[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
