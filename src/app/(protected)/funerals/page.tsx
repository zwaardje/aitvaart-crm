"use client";

import { Suspense, useState } from "react";
import { ProtectedLayout } from "@/components/layout";
import { Content } from "@/components/layout";
import { SectionHeader } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { FilterBar, FilterOption } from "@/components/ui";
import { Funerals } from "@/components/funerals/Funerals";
import { RiAddLine, RiHeartLine } from "@remixicon/react";

function FuneralsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Filter options voor uitvaarten
  const statusOptions: FilterOption[] = [
    { value: "planned", label: "Gepland" },
    { value: "in_progress", label: "In behandeling" },
    { value: "completed", label: "Voltooid" },
    { value: "cancelled", label: "Geannuleerd" },
  ];

  const typeOptions: FilterOption[] = [
    { value: "cremation", label: "Crematie" },
    { value: "burial", label: "Begrafenis" },
    { value: "memorial", label: "Herdenking" },
  ];

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setTypeFilter("");
  };

  return (
    <div className="p-6 space-y-6 w-full">
      <SectionHeader
        title="Uitvaarten"
        description="Beheer alle uitvaarten en hun details"
        actions={
          <Button>
            <RiAddLine className="h-4 w-4 mr-2" />
            Nieuwe uitvaart
          </Button>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Zoek uitvaarten..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            key: "status",
            label: "Status",
            options: statusOptions,
            value: statusFilter,
            onValueChange: setStatusFilter,
          },
          {
            key: "type",
            label: "Type",
            options: typeOptions,
            value: typeFilter,
            onValueChange: setTypeFilter,
          },
        ]}
        onClearFilters={handleClearFilters}
      />

      <div className="grid gap-6">
        {/* Funerals Component */}
        <Funerals />

        {/* Filter Status Display */}
        {(searchTerm || statusFilter || typeFilter) && (
          <Card>
            <CardContent className="pt-6">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Actieve filters:</strong>
                  {searchTerm && ` Zoekterm: "${searchTerm}"`}
                  {statusFilter &&
                    ` Status: ${
                      statusOptions.find((o) => o.value === statusFilter)?.label
                    }`}
                  {typeFilter &&
                    ` Type: ${
                      typeOptions.find((o) => o.value === typeFilter)?.label
                    }`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function FuneralsPage() {
  return (
    <Content>
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            </div>
          </div>
        }
      >
        <FuneralsContent />
      </Suspense>
    </Content>
  );
}
