import { queryOptions } from "@tanstack/react-query";

import { getMyAccess } from "./access.functions";

export const accessQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["auth", "access", userId],
    queryFn: () => getMyAccess(),
    staleTime: 60_000,
    retry: false,
  });
