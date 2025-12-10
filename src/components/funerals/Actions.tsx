"use client";

import { useTasks, useTaskTypes, useStartTask, useCompleteTask } from "@/hooks";
import { Skeleton, Button, Badge, EmptyState } from "@/components/ui";
import {
  RiCheckLine,
  RiPlayLine,
  RiPauseLine,
  RiErrorWarningLine,
} from "@remixicon/react";
import { useState, useMemo } from "react";
import { GenericCard } from "@/components/ui/GenericCard";
import type { SearchResult } from "@/hooks/useSearch";
import type { TaskWithDetails } from "@/hooks/useTasks";

interface ActionsProps {
  funeralId: string;
}

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

export function Actions({ funeralId }: ActionsProps) {
  const { data: tasks, isLoading } = useTasks(funeralId);
  const { data: taskTypes } = useTaskTypes();
  const { mutateAsync: startTask, isPending: isStarting } = useStartTask();
  const { mutateAsync: completeTask, isPending: isCompleting } =
    useCompleteTask();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Filter tasks by status - show all non-done tasks
  const filteredTasks = useMemo(() => {
    return (
      tasks?.filter((task) => {
        const taskStatus = task.status || "";
        return taskStatus !== "done";
      }) || []
    );
  }, [tasks]);

  // Show search results if available, otherwise show all tasks
  // Note: task search is not yet implemented in the database search function
  const displayTasks = useMemo(() => {
    if (searchResults.length > 0) {
      // Filter for task results (when search supports it)
      const taskResults = searchResults
        .filter((result) => (result.entity_type as string) === "task")
        .map((result) =>
          filteredTasks?.find((task) => task.id === result.entity_id)
        )
        .filter(Boolean) as TaskWithDetails[];

      return taskResults.length > 0 ? taskResults : filteredTasks || [];
    }
    return filteredTasks || [];
  }, [searchResults, filteredTasks]);

  const handleStartTask = async (taskId: string) => {
    try {
      await startTask({ taskId });
    } catch (error) {
      console.error("Failed to start task:", error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask({ taskId });
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const isEmpty = !displayTasks || displayTasks.length === 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Acties</h3>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      {isEmpty ? (
        <EmptyState
          icon={<RiCheckLine className="h-6 w-6 text-gray-400" />}
          title="Geen acties"
          description="Alle taken zijn voltooid"
        />
      ) : (
        <div className="space-y-3">
          {displayTasks.map((task: TaskWithDetails) => {
            const taskType = taskTypes?.find(
              (tt) => tt.id === task.task_type_id
            );
            const statusInfo = getTaskStatusInfo(task.status || "");

            return (
              <GenericCard
                key={task.id}
                title={taskType?.category || "Onbekende taak"}
                subtitle={statusInfo.label}
                actions={
                  <div className="flex items-center gap-1">
                    {task.status === "required" || task.status === "todo" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartTask(task.id)}
                        disabled={isStarting}
                      >
                        <RiPlayLine className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    ) : task.status === "pending" ? (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={isCompleting}
                      >
                        <RiCheckLine className="h-3 w-3 mr-1" />
                        Voltooi
                      </Button>
                    ) : null}
                  </div>
                }
                content={
                  <div className="space-y-2">
                    <Badge
                      variant="outline"
                      className={`${statusInfo.color} border flex items-center gap-1 w-fit`}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </Badge>
                    {taskType?.description && (
                      <p className="text-sm text-gray-600">
                        {taskType.description}
                      </p>
                    )}
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
