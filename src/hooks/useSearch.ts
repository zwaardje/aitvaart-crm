"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export type SearchResult = {
  entity_type: "note" | "cost" | "contact" | "funeral";
  entity_id: string;
  title: string;
  content: string;
  created_at: string;
  rank: number;
};

export type SearchSortOption = "relevance" | "date_asc" | "date_desc";

interface UseSearchOptions {
  query: string;
  enabled?: boolean;
  limit?: number;
  sortBy?: SearchSortOption;
}

export function useSearch({
  query,
  enabled = true,
  limit = 50,
  sortBy = "relevance",
}: UseSearchOptions) {
  const searchQuery = useQuery({
    queryKey: ["search", query, limit],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query.trim()) {
        return [];
      }

      const supabase = getSupabaseBrowser();

      // Sanitize the search query for PostgreSQL
      const sanitizedQuery = query
        .trim()
        .replace(/[^\w\s]/g, " ") // Remove special characters except spaces
        .replace(/\s+/g, " ") // Normalize spaces
        .split(" ")
        .filter((word) => word.length > 0)
        .join(" & "); // Use AND operator for multiple words

      if (!sanitizedQuery) {
        return [];
      }

      try {
        const { data, error } = await supabase.rpc("search_all_entities", {
          search_term: sanitizedQuery,
          limit_count: limit,
        });

        if (error) {
          console.error("Search error:", error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error("Search failed:", error);
        // Fallback to empty results instead of throwing
        return [];
      }
    },
    enabled: enabled && !!query.trim(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Sort results based on sortBy option
  const sortedResults = useMemo(() => {
    if (!searchQuery.data) return [];

    return [...searchQuery.data].sort((a, b) => {
      switch (sortBy) {
        case "date_asc":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "date_desc":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "relevance":
        default:
          return b.rank - a.rank;
      }
    });
  }, [searchQuery.data, sortBy]);

  return {
    results: sortedResults,
    isLoading: searchQuery.isLoading,
    error: searchQuery.error,
    refetch: searchQuery.refetch,
    isSuccess: searchQuery.isSuccess,
  };
}

// Hook for searching specific entity types
export function useSearchByType(
  query: string,
  entityTypes: SearchResult["entity_type"][],
  options?: Omit<UseSearchOptions, "query" | "sortBy">
) {
  const search = useSearch({
    query,
    ...options,
  });

  const filteredResults = useMemo(
    () =>
      search.results.filter((result) =>
        entityTypes.includes(result.entity_type)
      ),
    [search.results, entityTypes]
  );

  return {
    ...search,
    results: filteredResults,
  };
}

// Hook for getting search suggestions based on recent searches or popular terms
export function useSearchSuggestions(query: string) {
  const search = useSearch({
    query,
    limit: 5,
  });

  // Extract unique titles from results as suggestions
  const suggestions = useMemo(
    () =>
      search.results
        .map((result) => result.title)
        .filter((title, index, array) => array.indexOf(title) === index)
        .slice(0, 5),
    [search.results]
  );

  return {
    suggestions,
    isLoading: search.isLoading,
  };
}
