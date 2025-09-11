import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

// Default query options for better performance
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  retry: (failureCount: number, error: any) => {
    // Don't retry on 4xx errors (client errors)
    if (error?.status >= 400 && error?.status < 500) {
      return false;
    }

    // Don't retry on Supabase auth errors
    if (
      error?.message?.includes("refresh_token_already_used") ||
      error?.message?.includes("Invalid Refresh Token") ||
      error?.message?.includes("JWT expired")
    ) {
      return false;
    }

    // Retry up to 3 times for other errors
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Default mutation options
const defaultMutationOptions = {
  retry: (failureCount: number, error: any) => {
    // Don't retry on 4xx errors (client errors)
    if (error?.status >= 400 && error?.status < 500) {
      return false;
    }

    // Don't retry on Supabase auth errors
    if (
      error?.message?.includes("refresh_token_already_used") ||
      error?.message?.includes("Invalid Refresh Token") ||
      error?.message?.includes("JWT expired")
    ) {
      return false;
    }

    // Retry up to 2 times for mutations
    return failureCount < 2;
  },
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 10000),
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      const status = error?.status ?? error?.response?.status;
      if (status === 401) {
        const supabase = getSupabaseBrowser();
        supabase.auth.signOut().then(() => {
          if (typeof window !== "undefined") {
            window.location.href = "/auth/signin";
          }
        });
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      const status = error?.status ?? error?.response?.status;
      if (status === 401) {
        const supabase = getSupabaseBrowser();
        supabase.auth.signOut().then(() => {
          if (typeof window !== "undefined") {
            window.location.href = "/auth/signin";
          }
        });
      }
    },
  }),
  defaultOptions: {
    queries: defaultQueryOptions,
    mutations: defaultMutationOptions,
  },
});

// Query key factory for consistent key generation
export const queryKeys = {
  // Auth related
  auth: {
    profile: ["auth", "profile"] as const,
    user: ["auth", "user"] as const,
  },

  // Entity related
  entities: {
    all: (tableName: string) => [tableName] as const,
    detail: (tableName: string, id: string) => [tableName, id] as const,
    list: (tableName: string, filters?: Record<string, any>) =>
      [tableName, "list", filters] as const,
  },

  // Specific entities
  clients: {
    all: ["clients"] as const,
    detail: (id: string) => ["clients", id] as const,
  },

  funerals: {
    all: ["funerals"] as const,
    detail: (id: string) => ["funerals", id] as const,
    costs: (id: string) => ["funeral-costs", id] as const,
    breakdown: (id: string) => ["funeral-cost-breakdown", id] as const,
  },

  deceased: {
    all: ["deceased"] as const,
    detail: (id: string) => ["deceased", id] as const,
  },

  suppliers: {
    all: ["suppliers"] as const,
    detail: (id: string) => ["suppliers", id] as const,
    pricelists: (id: string) => ["supplier-pricelists", id] as const,
  },

  documents: {
    all: ["documents"] as const,
    byFuneral: (funeralId: string) =>
      ["documents", "funeral", funeralId] as const,
  },

  invoices: {
    all: ["invoices"] as const,
    detail: (id: string) => ["invoices", id] as const,
    byFuneral: (funeralId: string) =>
      ["invoices", "funeral", funeralId] as const,
  },

  estimates: {
    all: ["estimates"] as const,
    detail: (id: string) => ["estimates", id] as const,
    byFuneral: (funeralId: string) =>
      ["estimates", "funeral", funeralId] as const,
  },

  branding: {
    all: ["branding"] as const,
    detail: (id: string) => ["branding", id] as const,
  },
} as const;

// Utility functions for query invalidation
export const invalidateQueries = {
  // Invalidate all queries for a specific entity
  entity: (tableName: string) => ({
    queryKey: [tableName],
  }),

  // Invalidate specific entity detail
  entityDetail: (tableName: string, id: string) => ({
    queryKey: [tableName, id],
  }),

  // Invalidate all related queries
  all: () => ({}),

  // Invalidate auth related queries
  auth: () => ({
    queryKey: ["auth"],
  }),

  // Invalidate funeral related queries
  funeral: (funeralId: string) => ({
    queryKey: ["funerals", funeralId],
  }),

  // Invalidate all funeral queries
  allFunerals: () => ({
    queryKey: ["funerals"],
  }),
} as const;

// Optimistic update helpers
export const optimisticUpdates = {
  // Add entity to list
  addToList: <T>(oldData: T[] | undefined, newItem: T): T[] => {
    return oldData ? [...oldData, newItem] : [newItem];
  },

  // Update entity in list
  updateInList: <T extends { id: string }>(
    oldData: T[] | undefined,
    id: string,
    updates: Partial<T>
  ): T[] => {
    if (!oldData) return [];
    return oldData.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
  },

  // Remove entity from list
  removeFromList: <T extends { id: string }>(
    oldData: T[] | undefined,
    id: string
  ): T[] => {
    if (!oldData) return [];
    return oldData.filter((item) => item.id !== id);
  },
} as const;
