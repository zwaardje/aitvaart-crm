"use client";

import { useFunerals } from "@/hooks/useFunerals";
import {
  Skeleton,
  Badge,
  GenericCard,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { RiAddLine, RiCrossLine, RiArrowRightLine } from "@remixicon/react";
import { SectionHeader } from "@/components/layout";
import { format } from "date-fns";
import { Link } from "@/components/ui";

// Helper function to determine funeral status
function getFuneralStatus(funeral: any) {
  // If there's a signing_date, the funeral is completed
  if (funeral.signing_date) {
    return {
      status: "completed",
      label: "Afgerond",
      color: "bg-gray-100 text-gray-700",
    };
  }

  // If there's a funeral_director assigned, it's active
  if (funeral.funeral_director) {
    return {
      status: "active",
      label: "Actief",
      color: "bg-black text-white",
    };
  }

  // Otherwise, it's in planning phase
  return {
    status: "planning",
    label: "Planning",
    color: "bg-yellow-100 text-yellow-700",
  };
}

// Helper function to render team member avatars
function renderTeamMembers(teamAssignments: any[], funeralDirector?: string) {
  const avatars = [];

  // Add funeral director first if available
  if (funeralDirector) {
    avatars.push(
      <TooltipProvider key="director">
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className="h-6 w-6 border-2 border-white">
              <AvatarImage src={undefined} alt="Funeral Director" />
              <AvatarFallback className="text-xs bg-gray-200 text-muted-foreground">
                FD
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Uitvaartleider: {funeralDirector}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Add team assignments if available
  if (teamAssignments && teamAssignments.length > 0) {
    // Sort by role priority: primary first, then assigned, then backup
    const sortedAssignments = [...teamAssignments].sort((a, b) => {
      const roleOrder = { primary: 0, assigned: 1, backup: 2 };
      return (
        (roleOrder[a.role as keyof typeof roleOrder] || 1) -
        (roleOrder[b.role as keyof typeof roleOrder] || 1)
      );
    });

    // Show max 2 team members (since funeral director takes 1 slot)
    const displayAssignments = sortedAssignments.slice(0, 2);

    displayAssignments.forEach((assignment) => {
      const roleLabels = {
        primary: "Primaire begeleider",
        backup: "Backup begeleider",
        assigned: "Toegewezen begeleider",
      };

      const avatarColor = "bg-gray-200 text-muted-foreground border";

      avatars.push(
        <TooltipProvider key={assignment.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-6 w-6 border-2 border-white">
                <AvatarImage
                  src={undefined}
                  alt={`Team member ${assignment.role}`}
                />
                <AvatarFallback className={`text-xs ${avatarColor}`}>
                  {assignment.role === "primary"
                    ? "P"
                    : assignment.role === "backup"
                    ? "B"
                    : "A"}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {roleLabels[assignment.role as keyof typeof roleLabels] ||
                  assignment.role}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    });
  }

  if (avatars.length === 0) {
    return null;
  }

  return <div className="flex -space-x-2">{avatars}</div>;
}

export function Funerals() {
  const { funerals, isLoading } = useFunerals();

  const isEmpty = !funerals || funerals.length === 0;

  return (
    <section className="space-y-4 w-full">
      <SectionHeader
        title="Uitvaarten"
        description="Beheer alle uitvaarten en hun details"
      />

      {isLoading && isEmpty ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : isEmpty ? (
        <GenericCard
          title="Geen uitvaarten gevonden"
          content={
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-muted-foreground/30">
                <RiAddLine className="h-5 w-5 text-muted-foreground/50" />
              </div>
            </div>
          }
          className="text-center"
        />
      ) : (
        <div className="space-y-4">
          {funerals!.map((f, i) => (
            <Link
              className="hover:no-underline"
              href={`/funerals/${f.id}`}
              key={f.id}
            >
              <GenericCard
                title={`${f.deceased?.first_names} ${f.deceased?.last_name}`}
                actions={
                  <div className="flex items-center gap-2">
                    {/* Funeral Team Members */}
                    {renderTeamMembers(
                      f.team_assignments || [],
                      f.funeral_director || undefined
                    ) || (
                      <div className="flex -space-x-2">
                        <Avatar className="h-6 w-6 border-2 border-white">
                          <AvatarImage src={undefined} alt="No team assigned" />
                          <AvatarFallback className="text-xs bg-gray-100 text-gray-500">
                            ?
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}

                    {/* Status Badge */}
                    <Badge
                      variant="secondary"
                      className={`${
                        getFuneralStatus(f).color
                      } text-xs px-2 py-1`}
                    >
                      {getFuneralStatus(f).label}
                    </Badge>
                  </div>
                }
                content={
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <RiCrossLine className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span>
                        {f.deceased?.date_of_death
                          ? format(
                              new Date(f.deceased.date_of_death),
                              "dd-MM-yyyy"
                            )
                          : "-"}
                      </span>
                      <span>•</span>
                      <span className="truncate">
                        {f.deceased?.city || "Onbekend"}
                      </span>
                    </div>
                  </div>
                }
                footer={
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-gray-900">
                      Openstaande acties
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="destructive"
                        className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        3
                      </Badge>
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <RiArrowRightLine className="h-3 w-3 text-gray-600" />
                      </div>
                    </div>
                  </div>
                }
                className="hover:shadow-md transition-shadow cursor-pointer"
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
