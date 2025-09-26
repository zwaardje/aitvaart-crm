"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  RiMicLine,
  RiMicOffLine,
  RiSendPlaneLine,
  RiAddLine,
  RiFileTextLine,
  RiUserAddLine,
  RiSearchLine,
  RiInformationLine,
} from "@remixicon/react";

interface VoiceCommandPanelProps {
  onSendMessage: (message: string) => void;
  isConnected: boolean;
  disabled?: boolean;
  isVoiceEnabled?: boolean;
  onToggleVoice?: () => void;
  isLoading?: boolean;
}

const commandGroups = [
  {
    heading: "Uitvaart Acties",
    commands: [
      {
        id: "add-cost",
        label: "Kosten toevoegen",
        description: "Voeg kosten toe aan de uitvaart",
        command: "Voeg kosten toe",
        icon: RiAddLine,
      },
      {
        id: "add-note",
        label: "Notitie maken",
        description: "Maak een nieuwe notitie",
        command: "Voeg notitie toe",
        icon: RiFileTextLine,
      },
      {
        id: "add-contact",
        label: "Contact toevoegen",
        description: "Voeg een contact toe",
        command: "Voeg contact toe",
        icon: RiUserAddLine,
      },
    ],
  },
  {
    heading: "Zoeken & Informatie",
    commands: [
      {
        id: "search-funeral",
        label: "Uitvaart zoeken",
        description: "Zoek naar een uitvaart op naam",
        command: "Zoek uitvaart voor",
        icon: RiSearchLine,
      },
      {
        id: "get-info",
        label: "Uitvaart informatie",
        description: "Toon informatie over huidige uitvaart",
        command: "Wat weet je over deze uitvaart?",
        icon: RiInformationLine,
      },
    ],
  },
];

export function VoiceCommandPanel({
  onSendMessage,
  isConnected,
  disabled = false,
  isVoiceEnabled = true,
  onToggleVoice,
  isLoading = false,
}: VoiceCommandPanelProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Keyboard shortcut to open command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleCommandSelect = (command: string) => {
    setOpen(false);
    onSendMessage(command);
  };

  const handleSendCustomMessage = () => {
    if (searchValue.trim()) {
      handleCommandSelect(searchValue);
      setSearchValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchValue.trim()) {
      e.preventDefault();
      handleSendCustomMessage();
    }
  };

  // Filter commands based on search
  const filteredGroups = commandGroups
    .map((group) => ({
      ...group,
      commands: group.commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(searchValue.toLowerCase()) ||
          cmd.description.toLowerCase().includes(searchValue.toLowerCase()) ||
          cmd.command.toLowerCase().includes(searchValue.toLowerCase())
      ),
    }))
    .filter((group) => group.commands.length > 0);

  return (
    <>
      <Card className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Voice Assistant Commands</h3>
            <p className="text-xs text-muted-foreground">
              Druk op{" "}
              <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
                <span className="text-xs">⌘</span>K
              </kbd>{" "}
              om het command menu te openen
            </p>
          </div>

          {/* Voice Toggle Button */}
          {onToggleVoice && (
            <Button
              onClick={onToggleVoice}
              variant="outline"
              size="sm"
              disabled={!isConnected || disabled}
              className="shrink-0"
            >
              {isVoiceEnabled ? (
                <RiMicOffLine className="h-4 w-4" />
              ) : (
                <RiMicLine className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isVoiceEnabled
                  ? "Microfoon uitschakelen"
                  : "Microfoon inschakelen"}
              </span>
            </Button>
          )}
        </div>

        {/* Quick Access Commands */}
        <div className="grid grid-cols-2 gap-2">
          {commandGroups
            .flatMap((group) => group.commands)
            .slice(0, 4)
            .map((cmd) => {
              const Icon = cmd.icon;
              return (
                <Button
                  key={cmd.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleCommandSelect(cmd.command)}
                  disabled={!isConnected || disabled || isLoading}
                  className="h-auto p-3 flex-col items-start gap-1"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-medium truncate">
                      {cmd.label}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    {cmd.description}
                  </span>
                </Button>
              );
            })}
        </div>

        {/* Custom Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Command className="rounded-lg border shadow-sm">
              <CommandInput
                placeholder="Typ een commando of vraag..."
                value={searchValue}
                onValueChange={setSearchValue}
                onKeyDown={handleKeyDown}
                disabled={!isConnected || disabled}
              />
            </Command>
          </div>
          <Button
            onClick={handleSendCustomMessage}
            disabled={
              !isConnected || disabled || !searchValue.trim() || isLoading
            }
            size="sm"
            className="shrink-0"
          >
            <RiSendPlaneLine className="h-4 w-4" />
            <span className="sr-only">Verzenden</span>
          </Button>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="text-sm text-muted-foreground text-center py-2">
            Wachten op verbinding met voice assistant...
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Commando wordt uitgevoerd...
          </div>
        )}
      </Card>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Zoek een commando of typ een vraag..."
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <CommandList>
          <CommandEmpty>Geen commando's gevonden.</CommandEmpty>

          {filteredGroups.map((group, groupIndex) => (
            <Fragment key={group.heading}>
              {groupIndex > 0 && <CommandSeparator />}
              <CommandGroup heading={group.heading}>
                {group.commands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <CommandItem
                      key={cmd.id}
                      value={`${cmd.label} ${cmd.description} ${cmd.command}`}
                      onSelect={() => handleCommandSelect(cmd.command)}
                      className="flex items-center gap-3 p-3"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{cmd.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {cmd.description}
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Fragment>
          ))}

          {/* Custom Command */}
          {searchValue.trim() && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Aangepast Commando">
                <CommandItem
                  onSelect={() => handleCommandSelect(searchValue)}
                  className="flex items-center gap-3 p-3"
                >
                  <RiSendPlaneLine className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">Verzend bericht</div>
                    <div className="text-sm text-muted-foreground">
                      "{searchValue}"
                    </div>
                  </div>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
