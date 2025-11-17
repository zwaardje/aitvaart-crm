import { Link } from "@/components/ui";
import { GenericCard } from "@/components/ui/GenericCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RiCrossLine } from "@remixicon/react";
import { format } from "date-fns";
import { FuneralWithRelations } from "@/hooks/useFunerals";
import { useTasks } from "@/hooks/useTasks";
import { Spinner } from "@/components/ui/spinner/Spinner";

// Helper function to get funeral status display info
function getFuneralStatusDisplay(funeral: any) {
  const status = funeral.status || "planning";

  const statusConfig = {
    planning: {
      label: "Planning",
      color: "bg-yellow-100 text-yellow-700",
    },
    active: {
      label: "Actief",
      color: "bg-blue-100 text-blue-700",
    },
    completed: {
      label: "Afgerond",
      color: "bg-gray-100 text-gray-700",
    },
    cancelled: {
      label: "Geannuleerd",
      color: "bg-red-100 text-red-700",
    },
  };

  return {
    status,
    ...statusConfig[status as keyof typeof statusConfig],
  };
}

// Component to fetch and display pending tasks for a funeral
function FuneralPendingTasks({ funeralId }: { funeralId: string }) {
  const { data: tasks, isLoading } = useTasks(funeralId);
  const pendingTasks = tasks?.filter((task) => task.status !== "done") || [];

  return (
    <div className="flex items-center justify-between w-full">
      <span className="text-sm font-medium text-gray-900">
        Openstaande acties
      </span>
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="h-5 w-5 p-0 flex items-center justify-center text-xs"
        >
          {pendingTasks.length}
        </Badge>
      </div>
    </div>
  );
}

// Helper function to render team member avatars
function renderTeamMembers(teamAssignments: any[], funeralDirector?: string) {
  const avatars = [];

  // Add funeral director first if available
  if (funeralDirector) {
    avatars.push(
      <Avatar key="funeral-director" className="h-6 w-6 border-2 border-white">
        <AvatarImage src={undefined} alt="Funeral Director" />
        <AvatarFallback className="text-xs bg-gray-200 text-muted-foreground">
          FD
        </AvatarFallback>
      </Avatar>
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

    displayAssignments.forEach((assignment, index) => {
      const avatarColor = "bg-gray-200 text-muted-foreground border";

      avatars.push(
        <Avatar
          key={`team-member-${assignment.id || assignment.role}-${index}`}
          className="h-6 w-6 border-2 border-white"
        >
          <AvatarImage src={undefined} alt={`Team member ${assignment.role}`} />
          <AvatarFallback className={`text-xs ${avatarColor}`}>
            {assignment.role === "primary"
              ? "P"
              : assignment.role === "backup"
              ? "B"
              : "A"}
          </AvatarFallback>
        </Avatar>
      );
    });
  }

  return <div className="flex -space-x-2">{avatars}</div>;
}

export function FuneralCard({ funeral }: { funeral: FuneralWithRelations }) {
  return (
    <Link
      className="hover:no-underline"
      href={`/funerals/${funeral.id}`}
      size="card"
    >
      <GenericCard
        title={`${funeral.deceased?.first_names} ${funeral.deceased?.last_name}`}
        actions={
          <div className="flex items-center gap-2">
            {/* Funeral Team Members */}
            {renderTeamMembers(
              [], // team_assignments not available yet
              funeral.funeral_director || undefined
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
                getFuneralStatusDisplay(funeral).color
              } text-xs px-2 py-1`}
            >
              {getFuneralStatusDisplay(funeral).label}
            </Badge>
          </div>
        }
        content={
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RiCrossLine className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span>
                {funeral.deceased?.date_of_death
                  ? format(
                      new Date(funeral.deceased.date_of_death),
                      "dd-MM-yyyy"
                    )
                  : "-"}
              </span>
              <span>•</span>
              <span className="truncate">
                {funeral.deceased?.city || "Onbekend"}
              </span>
            </div>
          </div>
        }
        footer={<FuneralPendingTasks funeralId={funeral.id} />}
        className="hover:shadow-md transition-shadow cursor-pointer"
      />
    </Link>
  );
}
