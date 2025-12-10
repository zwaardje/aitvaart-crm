"use client";

import { ReactNode } from "react";
import { Card, CardContent, Button } from "@/components/ui";
import { RiAddLine } from "@remixicon/react";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: EmptyStateAction;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          {icon}
        </div>
        <h4 className="mt-4 text-lg font-medium text-gray-900">{title}</h4>
        <p className="mt-2 text-sm text-gray-500 text-center">{description}</p>
        {action && (
          <Button onClick={action.onClick} className="mt-4">
            {action.icon || <RiAddLine className="h-4 w-4 mr-2" />}
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
