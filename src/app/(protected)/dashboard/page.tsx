"use client";

import { useState } from "react";
import { Funerals } from "@/components/funerals/Funerals";
import { Content } from "@/components/layout";
import { SectionHeader } from "@/components/layout";
import { FilterBar, FilterOption } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiDashboardLine, RiAddLine } from "@remixicon/react";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Filter options voor dashboard
  const statusOptions: FilterOption[] = [
    { value: "recent", label: "Recent" },
    { value: "urgent", label: "Urgent" },
    { value: "planned", label: "Gepland" },
    { value: "completed", label: "Voltooid" },
  ];

  const priorityOptions: FilterOption[] = [
    { value: "high", label: "Hoog" },
    { value: "medium", label: "Gemiddeld" },
    { value: "low", label: "Laag" },
  ];

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPriorityFilter("");
  };

  return (
    <Content>
      <div className="p-6 space-y-6 w-full">
        <SectionHeader
          title="Dashboard"
          description="Overzicht van alle activiteiten en uitvaarten"
          actions={
            <Button>
              <RiAddLine className="h-4 w-4 mr-2" />
              Nieuwe uitvaart
            </Button>
          }
        />

        {/* Filter Bar */}
        <FilterBar
          searchPlaceholder="Zoek in dashboard..."
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
              key: "priority",
              label: "Prioriteit",
              options: priorityOptions,
              value: priorityFilter,
              onValueChange: setPriorityFilter,
            },
          ]}
          onClearFilters={handleClearFilters}
        />

        {/* Dashboard Content */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RiDashboardLine className="h-5 w-5" />
                Dashboard Overzicht
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Hier komt een overzicht van alle activiteiten met mogelijkheden
                om te filteren, zoeken en beheren.
              </p>
              {(searchTerm || statusFilter || priorityFilter) && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Actieve filters:</strong>
                    {searchTerm && ` Zoekterm: "${searchTerm}"`}
                    {statusFilter &&
                      ` Status: ${
                        statusOptions.find((o) => o.value === statusFilter)
                          ?.label
                      }`}
                    {priorityFilter &&
                      ` Prioriteit: ${
                        priorityOptions.find((o) => o.value === priorityFilter)
                          ?.label
                      }`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Funerals Component */}
          <Funerals />
        </div>
      </div>
    </Content>
  );
}
