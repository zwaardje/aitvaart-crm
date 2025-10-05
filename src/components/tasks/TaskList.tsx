"use client";

import { useTasks, useTaskTypes, useStartTask, useCompleteTask } from "@/hooks";
import {
  GenericCard,
  Badge,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Skeleton,
} from "@/components/ui";
import {
  RiPlayLine,
  RiPauseLine,
  RiCheckLine,
  RiErrorWarningLine,
} from "@remixicon/react";
import { format } from "date-fns";

// Helper function to get task status color and icon
function getTaskStatusInfo(status: string) {
  switch (status) {
    case "required":
      return {
        color: "bg-red-100 text-red-700 border-red-200",
        icon: <RiErrorWarningLine className="h-3 w-3" />,
        label: "Vereist",
      };
    case "todo":
      return {
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <RiPlayLine className="h-3 w-3" />,
        label: "Te doen",
      };
    case "pending":
      return {
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: <RiPauseLine className="h-3 w-3" />,
        label: "Bezig",
      };
    case "error":
      return {
        color: "bg-red-100 text-red-700 border-red-200",
        icon: <RiErrorWarningLine className="h-3 w-3" />,
        label: "Fout",
      };
    default:
      return {
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icon: <RiPlayLine className="h-3 w-3" />,
        label: status,
      };
  }
}

// Component for individual task item
function TaskItem({
  task,
  taskType,
  funeral,
}: {
  task: any;
  taskType: any;
  funeral: any;
}) {
  const { mutateAsync: startTask, isPending: isStarting } = useStartTask();

  // Get funeral info from task data if not provided
  const funeralInfo = funeral || task.funeral;
  const { mutateAsync: completeTask, isPending: isCompleting } =
    useCompleteTask();

  const statusInfo = getTaskStatusInfo(task.status);

  const handleStartTask = async () => {
    try {
      await startTask({ taskId: task.id });
    } catch (error) {
      console.error("Failed to start task:", error);
    }
  };

  const handleCompleteTask = async () => {
    try {
      await completeTask({ taskId: task.id });
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  return (
    <li className="flex items-center justify-between not-last:border-b py-2 px-1">
      <div className="flex flex-col gap-1">
        <span className="text-xs">
          {taskType?.category || "Onbekende taak"}{" "}
        </span>
        <span className="text-xs text-gray-500">
          {taskType?.description || "Geen beschrijving beschikbaar"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {task.status === "required" || task.status === "todo" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleStartTask}
            disabled={isStarting}
          >
            <RiPlayLine className="h-3 w-3 mr-1" />
            Start
          </Button>
        ) : task.status === "pending" ? (
          <Button
            size="sm"
            onClick={handleCompleteTask}
            disabled={isCompleting}
          >
            <RiCheckLine className="h-3 w-3 mr-1" />
            Voltooi
          </Button>
        ) : null}
      </div>
    </li>
  );
}

// Main component props
interface TaskListProps {
  funeralId: string;
  statuses?: string[];
}

export function TaskList({ funeralId, statuses }: TaskListProps) {
  // Get tasks for the specific funeral
  const { data: tasks, isLoading: tasksLoading } = useTasks(funeralId);

  // Get task types for additional info
  const { data: taskTypes } = useTaskTypes();

  // Filter tasks by status if provided, otherwise show all non-done tasks
  const filteredTasks =
    tasks?.filter((task) => {
      const taskStatus = task.status || "";
      if (statuses && statuses.length > 0) {
        return statuses.includes(taskStatus);
      }
      return taskStatus !== "done";
    }) || [];

  const isLoading = tasksLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <GenericCard
        title="Geen taken gevonden"
        subtitle={
          statuses
            ? `Geen taken met status: ${statuses.join(", ")}`
            : "Alle taken zijn voltooid"
        }
        content={
          <div className="text-center py-8 text-gray-500">
            <RiCheckLine className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p>Er zijn momenteel geen taken die voldoen aan de criteria.</p>
          </div>
        }
      />
    );
  }

  return (
    <ul className="space-y-4">
      {filteredTasks.map((task) => {
        const taskType = taskTypes?.find((tt) => tt.id === task.task_type_id);
        return (
          <TaskItem
            key={task.id}
            task={task}
            taskType={taskType}
            funeral={null} // We don't need funeral context since we're already filtering by funeral
          />
        );
      })}
    </ul>
  );
}
