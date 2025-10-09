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
import { ContextAwareVoiceAssistant } from "@/components/voice/ContextAwareVoiceAssistant";

import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/ui/SearchBar";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

import { cn } from "@/lib/utils";
import { AIContextMetadata } from "@/types/ai-context";

export interface SmartSearchBarAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export interface SmartSearchBarProps {
  showAiButton?: boolean;
  placeholder?: string;
  onResultsChange?: (results: any[]) => void;
  actions?: SmartSearchBarAction[];
  entityTypes?: ("funeral" | "note" | "cost" | "contact")[];
  className?: string;
  sticky?: boolean;
  aiContext?: AIContextMetadata;
}

export function SmartSearchBar({
  showAiButton = true,
  placeholder = "Zoek...",
  onResultsChange,
  actions = [],
  entityTypes,
  className,
  sticky = false,
  aiContext,
}: SmartSearchBarProps) {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Get context-specific AI button label
  const getAIButtonLabel = () => {
    if (!aiContext) return "AI Assistant";

    switch (aiContext.page) {
      case "notes":
        return "AI Notities";
      case "costs":
        return "AI Kosten";
      case "contacts":
        return "AI Contacten";
      case "scenarios":
        return "AI Scenario's";
      case "documents":
        return "AI Documenten";
      default:
        return "AI Assistant";
    }
  };

  return (
    <>
      <div
        className={cn(
          "relative flex items-center gap-2",
          !onResultsChange && "justify-end",
          sticky &&
            "sticky top-[6.5rem] md:top-[3.5rem] z-20 bg-white py-3 -mx-4 px-4 border-b",
          className
        )}
      >
        {/* Search Input */}
        {onResultsChange && (
          <div
            className={cn(
              "flex-1 transition-all duration-500 ease-in-out origin-left",
              isSearchFocused && "absolute left-5 right-5 z-10",
              sticky && isSearchFocused && "py-3 -mx-4 px-4"
            )}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          >
            <SearchBar
              placeholder={placeholder}
              onResultsChange={onResultsChange}
              entityTypes={entityTypes}
              className="w-full"
            />
          </div>
        )}

        <div
          className={cn(
            "flex items-center gap-2 ml-auto transition-all duration-300 ease-in-out",
            isSearchFocused && "opacity-0 pointer-events-none"
          )}
        >
          {showAiButton && (
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-3 gap-2"
              onClick={() => setIsAIModalOpen(true)}
            >
              <RiSparklingLine className="h-4 w-4 text-purple-600" />
              <span className="sm:inline">AI</span>
            </Button>
          )}

          {/* More Actions Menu */}
          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="sm" className="h-10 px-3 gap-2">
                  <RiMoreLine className="h-4 w-4" />
                  Meer
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto">
                {actions &&
                  actions.length > 0 &&
                  actions.map((action, index) => (
                    <React.Fragment key={action.id}>
                      {index > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className="flex items-center gap-2 cursor-pointer text-xs"
                      >
                        {action.icon}
                        {action.label}
                      </DropdownMenuItem>
                    </React.Fragment>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* AI Modal */}
      {showAiButton && (
        <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-transparent">
            <div className="flex-1 min-h-0">
              <ContextAwareVoiceAssistant
                funeralId={aiContext?.funeralId}
                aiContext={aiContext}
                autoStart={true}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
