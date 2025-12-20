import { Link } from "@/components/ui";
import { GenericCard } from "@/components/ui/GenericCard";
import { Badge } from "@/components/ui/badge";
import { RiCrossLine } from "@remixicon/react";
import { format } from "date-fns";
import { FuneralWithRelations } from "@/hooks/useFunerals";
import { useTasks } from "@/hooks/useTasks";
import { getFuneralStatusDisplay } from "@/constants/funeral-status";

// Component to fetch and display pending tasks for a funeral
function FuneralPendingTasks({ funeralId }: { funeralId: string }) {
  const { data: tasks, isLoading } = useTasks(funeralId);
  const pendingTasks = tasks?.filter((task) => task.status !== "done") || [];

  return (
    <div className="flex items-center justify-between w-full">
      <span className="text-xs  text-gray-900">Openstaande acties</span>
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
            <div className="flex items-center gap-2 text-sm text-gray-600 font-thin">
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
