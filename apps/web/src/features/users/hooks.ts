import type { UserPageQuery } from "@/features/users/types/user.types";
import { api } from "@/services/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useUsers = () =>
  useQuery({ queryKey: ["users", "list"], queryFn: api.users });
export const useUsersPage = (query: UserPageQuery, enabled = true) =>
  useQuery({
    enabled,
    queryKey: ["users", "page", query],
    queryFn: ({ signal }) => api.usersPage(query, signal),
    placeholderData: (previous, previousQuery) =>
      (previousQuery?.queryKey[2] as UserPageQuery | undefined)?.q === query.q
        ? keepPreviousData(previous)
        : undefined,
  });
