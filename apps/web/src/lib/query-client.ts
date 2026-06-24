import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { UnauthorizedError } from "./api-client";

function handleUnauthorized(error: unknown) {
  if (error instanceof UnauthorizedError && location.pathname !== "/login") {
    location.assign("/login");
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleUnauthorized }),
  mutationCache: new MutationCache({ onError: handleUnauthorized }),
  defaultOptions: {
    queries: {
      retry: (count, error) => !(error instanceof UnauthorizedError) && count < 1,
      staleTime: 5_000,
    },
  },
});
