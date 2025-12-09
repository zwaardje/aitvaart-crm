"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { RiSearchLine, RiCloseLine } from "@remixicon/react";
import { Input } from "./input";
import { Button } from "./Button";
import { Spinner } from "./spinner/Spinner";
import { useSearch } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onResultsChange?: (results: any[]) => void;
  placeholder?: string;
  className?: string;
  entityTypes?: ("note" | "cost" | "contact" | "funeral" | "scenario")[];
  limit?: number;
  searchContext?: SearchContext;
}

export interface SearchContext {
  entityTypes?: ("funeral" | "note" | "cost" | "contact" | "scenario")[];
  filters?: Record<string, any>;
}

// Helper function to compare arrays by their content
function arraysEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => {
    const itemB = b[index];
    return (
      item.entity_id === itemB.entity_id &&
      item.entity_type === itemB.entity_type
    );
  });
}

export function SearchBar({
  onResultsChange,
  placeholder,
  className,
  searchContext,
  limit = 50,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const entityTypes = searchContext?.entityTypes || [];

  // Store callback in ref to avoid dependency issues
  const onResultsChangeRef = useRef(onResultsChange);
  const previousResultsRef = useRef<any[]>([]);

  // Update callback ref when it changes
  useEffect(() => {
    onResultsChangeRef.current = onResultsChange;
  }, [onResultsChange]);

  useEffect(() => {
    if (query.length > 0) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsTyping(false);
    }, 500); // 500ms delay for better UX

    return () => clearTimeout(timer);
  }, [query]);

  const search = useSearch({
    query: debouncedQuery,
    enabled: debouncedQuery.length > 1,
    limit,
    filters: searchContext?.filters,
  });

  const filteredResults = useMemo(() => {
    return entityTypes
      ? search.results.filter((result) =>
          entityTypes.includes(result.entity_type)
        )
      : search.results;
  }, [search.results, entityTypes]);

  useEffect(() => {
    // Only call callback if results actually changed
    if (
      onResultsChangeRef.current &&
      !arraysEqual(filteredResults, previousResultsRef.current)
    ) {
      onResultsChangeRef.current(filteredResults);
      previousResultsRef.current = filteredResults;
    }
  }, [filteredResults]);

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            type="text"
            placeholder={placeholder || "Zoek..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {search.isLoading || isTyping ? (
            <div className="absolute right-3 top-1/2">
              <Spinner size={16} color="hsl(var(--muted-foreground))" />
            </div>
          ) : query ? (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
              onClick={clearSearch}
            >
              <RiCloseLine className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        {/* Error message */}
        {search.error && (
          <div className="mt-2 text-sm text-destructive">
            {search.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
