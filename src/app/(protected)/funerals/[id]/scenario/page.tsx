"use client";

import { Suspense, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Content } from "@/components/layout";
import { SectionHeader } from "@/components/layout";
import {
  Skeleton,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import {
  ScenarioForm,
  ScenarioEditForm,
  ScenarioDeleteForm,
} from "@/components/forms";
import { useScenarios } from "@/hooks/useScenarios";
import { Database } from "@/types/database";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCalendarLine,
} from "@remixicon/react";

type FuneralScenario = Database["public"]["Tables"]["funeral_scenarios"]["Row"];

interface ScenarioContentProps {
  funeralId: string;
}

function ScenarioContent({ funeralId }: ScenarioContentProps) {
  const t = useTranslations();
  const { data: scenarios, isLoading } = useScenarios(funeralId);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingScenario, setEditingScenario] =
    useState<FuneralScenario | null>(null);
  const [deletingScenario, setDeletingScenario] =
    useState<FuneralScenario | null>(null);

  // Group scenarios by section
  const groupedScenarios =
    scenarios?.reduce((acc, scenario) => {
      if (!acc[scenario.section]) {
        acc[scenario.section] = [];
      }
      acc[scenario.section].push(scenario);
      return acc;
    }, {} as Record<string, FuneralScenario[]>) || {};

  const sectionLabels: Record<string, string> = {
    soort_uitvaart: "Soort uitvaart",
    verzorging_en_opbaring: "Verzorging en opbaring",
    ceremonie: "Ceremonie",
    kosten: "Kosten",
  };

  const itemTypeLabels: Record<string, string> = {
    begrafenis: "Begrafenis",
    crematie: "Crematie",
    laatste_verzorging: "Laatste verzorging",
    thanatopraxie: "Thanatopraxie",
    opbaring: "Opbaring",
    ceremonie: "Ceremonie",
    muziek: "Muziek",
    bloemen: "Bloemen",
    transport: "Transport",
  };

  const handleAddSuccess = () => {
    setIsAddOpen(false);
  };

  const handleEditSuccess = () => {
    setEditingScenario(null);
  };

  const handleDeleteSuccess = () => {
    setDeletingScenario(null);
  };

  return (
    <div className="space-y-6 w-full">
      <SectionHeader
        title="Uitvaartscenario"
        description="Beheer alle onderdelen van het uitvaartscenario"
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <RiAddLine className="h-4 w-4 mr-2" />
                Toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Item toevoegen</DialogTitle>
              </DialogHeader>
              <ScenarioForm
                funeralId={funeralId}
                onSuccess={handleAddSuccess}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedScenarios).map(
            ([section, sectionScenarios]) => (
              <Card key={section}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RiCalendarLine className="h-5 w-5" />
                    {sectionLabels[section] || section}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sectionScenarios.map((scenario) => (
                      <div
                        key={scenario.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-gray-900">
                                {scenario.title}
                              </h3>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {itemTypeLabels[scenario.item_type] ||
                                  scenario.item_type}
                              </span>
                            </div>

                            {scenario.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                {scenario.description}
                              </p>
                            )}

                            {scenario.extra_field_label &&
                              scenario.extra_field_value && (
                                <div className="text-sm">
                                  <span className="text-gray-500">
                                    {scenario.extra_field_label}:
                                  </span>
                                  <span className="ml-1 text-gray-900">
                                    {scenario.extra_field_value}
                                  </span>
                                </div>
                              )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingScenario(scenario)}
                                >
                                  <RiEditLine className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Item wijzigen</DialogTitle>
                                </DialogHeader>
                                {editingScenario && (
                                  <ScenarioEditForm
                                    scenario={editingScenario}
                                    onSuccess={handleEditSuccess}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeletingScenario(scenario)}
                                >
                                  <RiDeleteBinLine className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle> Weet je het zeker?</DialogTitle>
                                </DialogHeader>
                                {deletingScenario && (
                                  <ScenarioDeleteForm
                                    scenario={deletingScenario}
                                    onSuccess={handleDeleteSuccess}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    ))}

                    {sectionScenarios.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Geen items in deze sectie</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {Object.keys(groupedScenarios).length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  Nog geen scenario items toegevoegd
                </p>
                <Button onClick={() => setIsAddOpen(true)}>
                  <RiAddLine className="h-4 w-4 mr-2" />
                  Eerste item toevoegen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function ScenarioPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const [id, setId] = useState<string>("");

  useEffect(() => {
    if (params instanceof Promise) {
      params.then(({ id: resolvedId }) => {
        setId(resolvedId);
      });
    } else {
      setId(params.id);
    }
  }, [params]);
  return (
    <Content>
      <Suspense
        fallback={
          <div className="p-6 space-y-6">
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
        <ScenarioContent funeralId={id} />
      </Suspense>
    </Content>
  );
}
