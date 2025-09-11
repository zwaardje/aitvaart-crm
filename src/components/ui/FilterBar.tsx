"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { RiSearchLine, RiFilterLine, RiCloseLine } from "@remixicon/react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: Array<{
    key: string;
    label: string;
    options: FilterOption[];
    value?: string;
    onValueChange?: (value: string) => void;
  }>;
  onClearFilters?: () => void;
  showClearButton?: boolean;
  className?: string;
}

export function FilterBar({
  searchPlaceholder = "Zoeken...",
  searchValue = "",
  onSearchChange,
  filters = [],
  onClearFilters,
  showClearButton = true,
  className = "",
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = filters.some(
    (filter) => filter.value && filter.value !== ""
  );

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Toggle Button */}
        {filters.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <RiFilterLine className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                {filters.filter((f) => f.value && f.value !== "").length}
              </span>
            )}
          </Button>
        )}

        {/* Clear Filters Button */}
        {showClearButton && hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <RiCloseLine className="h-4 w-4" />
            Wissen
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && filters.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {filter.label}
                </label>
                <Select
                  value={filter.value || ""}
                  onValueChange={filter.onValueChange}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Selecteer ${filter.label.toLowerCase()}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
