import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "../backend.d";
import { useActor } from "./useActor";

export function useGetSessions() {
  const { actor, isFetching } = useActor();
  return useQuery<Session[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSession(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Session>({
    queryKey: ["session", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error("No actor or id");
      return actor.getSession(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subject,
      notes,
    }: {
      subject: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor available");
      return actor.createSession(subject, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useDeleteSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor available");
      return actor.deleteSession(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
