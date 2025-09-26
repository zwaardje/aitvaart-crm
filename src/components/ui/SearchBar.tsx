"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { RiSearchLine, RiCloseLine } from "@remixicon/react";
import { Input } from "./input";
import { Button } from "./Button";
import { Badge } from "./badge";
import { Spinner } from "./spinner/Spinner";
import { useSearch } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onResultsChange?: (results: any[]) => void;
  placeholder?: string;
  className?: string;
  entityTypes?: ("note" | "cost" | "contact" | "funeral")[];
  limit?: number;
}

export function SearchBar({
  onResultsChange,
  placeholder,
  className,
  entityTypes,
  limit = 50,
}: SearchBarProps) {
  const t = useTranslations("search");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

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
  });

  const filteredResults = useMemo(() => {
    return entityTypes
      ? search.results.filter((result) =>
          entityTypes.includes(result.entity_type)
        )
      : search.results;
  }, [search.results, entityTypes?.join(",")]);

  useEffect(() => {
    if (onResultsChange) {
      onResultsChange(filteredResults);
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
            placeholder={placeholder || t("placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
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
          <div className="mt-2 text-sm text-destructive">{t("error")}</div>
        )}
      </div>
    </div>
  );
}
