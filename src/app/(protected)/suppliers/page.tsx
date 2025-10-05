"use client";

import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import { ProtectedLayout } from "@/components/layout";
import { Content } from "@/components/layout";
import { SectionHeader } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { RiAddLine, RiStoreLine } from "@remixicon/react";

type FilterOption = {
  value: string;
  label: string;
};

function SuppliersContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  // Filter options voor leveranciers
  const typeOptions: FilterOption[] = [
    { value: "flowers", label: "Bloemen" },
    { value: "coffin", label: "Kist" },
    { value: "venue", label: "Locatie" },
    { value: "catering", label: "Catering" },
    { value: "printing", label: "Drukwerk" },
    { value: "transport", label: "Transport" },
    { value: "music", label: "Muziek" },
  ];

  const cityOptions: FilterOption[] = [
    { value: "amsterdam", label: "Amsterdam" },
    { value: "rotterdam", label: "Rotterdam" },
    { value: "den_haag", label: "Den Haag" },
    { value: "utrecht", label: "Utrecht" },
    { value: "eindhoven", label: "Eindhoven" },
    { value: "tilburg", label: "Tilburg" },
    { value: "groningen", label: "Groningen" },
  ];

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setCityFilter("");
  };

  return (
    <div className="p-6 space-y-6 w-full">
      <SectionHeader
        title="Leveranciers"
        description="Beheer alle leveranciers en hun prijslijsten"
        actions={
          <Button>
            <RiAddLine className="h-4 w-4 mr-2" />
            Nieuwe leverancier
          </Button>
        }
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiStoreLine className="h-5 w-5" />
              Leveranciers Overzicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Hier komt een overzicht van alle leveranciers met mogelijkheden om
              te filteren, zoeken en beheren.
            </p>
            {(searchTerm || typeFilter || cityFilter) && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Actieve filters:</strong>
                  {searchTerm && ` Zoekterm: "${searchTerm}"`}
                  {typeFilter &&
                    ` Type: ${
                      typeOptions.find((o) => o.value === typeFilter)?.label
                    }`}
                  {cityFilter &&
                    ` Plaats: ${
                      cityOptions.find((o) => o.value === cityFilter)?.label
                    }`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
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
        <SuppliersContent />
      </Suspense>
    </Content>
  );
}
