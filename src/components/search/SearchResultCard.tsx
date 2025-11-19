"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  RiUser3Line,
  RiStickyNoteLine,
  RiBankCard2Line,
  RiFlowerLine,
} from "@remixicon/react";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchResult } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";

const ENTITY_META = {
  funeral: {
    label: "Uitvaart",
    icon: RiFlowerLine,
    href: (id: string) => `/funerals/${id}`,
  },
  note: {
    label: "Notitie",
    icon: RiStickyNoteLine,
    href: (id: string) => `/notes/${id}`,
  },
  cost: {
    label: "Kostenpost",
    icon: RiBankCard2Line,
    href: (id: string) => `/costs/${id}`,
  },
  contact: {
    label: "Contact",
    icon: RiUser3Line,
    href: (id: string) => `/contacts/${id}`,
  },
} satisfies Record<SearchResult["entity_type"], any>;

interface SearchResultCardProps {
  result: SearchResult;
  className?: string;
}

export function SearchResultCard({ result, className }: SearchResultCardProps) {
  const meta = ENTITY_META[result.entity_type];
  const Icon = meta.icon;

  return (
    <Link href={meta.href(result.entity_id)} className="block">
      <Card className={cn("transition hover:shadow-md rounded-sm ", className)}>
        <CardHeader className="pb-3 pl-3 pr-3 pt-3 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon className="h-4 w-4" />
            <Badge variant="secondary" className="px-1.5 py-0.5">
              {meta.label}
            </Badge>
          </div>
          <h3 className="text-base font-semibold leading-snug">
            {result.title}
          </h3>
        </CardHeader>
        {result.content && (
          <CardContent className="text-sm text-muted-foreground line-clamp-2 pt-0 pl-3 pr-3 pb-3">
            {result.content}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
