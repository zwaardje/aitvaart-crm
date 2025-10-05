"use client";

import React, { useState } from "react";
import { RiRobotLine, RiMoreLine, RiSparklingLine } from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/ui/SearchBar";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

import { cn } from "@/lib/utils";

export interface SmartSearchBarAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export interface SmartSearchBarProps {
  placeholder?: string;
  onResultsChange?: (results: any[]) => void;
  actions?: SmartSearchBarAction[];
  entityTypes?: ("funeral" | "note" | "cost" | "contact")[];
  className?: string;
}

export function SmartSearchBar({
  placeholder = "Zoek...",
  onResultsChange,
  actions = [],
  entityTypes,
  className,
}: SmartSearchBarProps) {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-2 transition-all duration-300 ease-in-out",
          "focus-within:gap-1",
          className
        )}
      >
        {/* Search Input */}
        <div className="relative flex-1 transition-all duration-300 ease-in-out group-focus-within:flex-[2]">
          <SearchBar
            placeholder={placeholder}
            onResultsChange={onResultsChange}
            entityTypes={entityTypes}
            className="w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 transition-all duration-300 ease-in-out group-focus-within:scale-95 group-focus-within:opacity-80">
          {/* AI Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3 gap-2"
            onClick={() => setIsAIModalOpen(true)}
          >
            <RiSparklingLine className="h-4 w-4" />
            <span className="hidden sm:inline">AI</span>
          </Button>

          {/* More Actions Menu */}
          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                {/* <Button variant="outline" size="sm" className="h-10 px-3 gap-2">
                  <RiMoreLine className="h-4 w-4" />
                  <span className="inline">Meer</span>
                </Button> */}
                <div>omfg</div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {actions && actions.length > 0 ? (
                  actions.map((action, index) => (
                    <React.Fragment key={action.id}>
                      {index > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        {action.icon}
                        {action.label}
                      </DropdownMenuItem>
                    </React.Fragment>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    Geen acties beschikbaar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* AI Modal */}
      <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RiRobotLine className="h-5 w-5" />
              AI Assistant
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <RiRobotLine className="h-16 w-16 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">AI Assistant</h3>
              <p className="text-muted-foreground">
                De AI assistant wordt hier geladen...
              </p>
              <Button onClick={() => setIsAIModalOpen(false)}>Sluiten</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
