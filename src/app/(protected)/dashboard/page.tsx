"use client";

import { useCallback } from "react";
import { Funerals } from "@/components/funerals/Funerals";
import { Content } from "@/components/layout";
import { SmartSearchBar, SmartSearchBarAction } from "@/components/ui";
import { RiSettings3Line } from "@remixicon/react";

export default function DashboardPage() {
  const searchActions = useCallback(
    (): SmartSearchBarAction[] => [
      {
        id: "settings",
        label: "Nieuwe uitvaart",
        icon: <RiSettings3Line className="h-4 w-4" />,
        onClick: () => {
          // Navigate to settings
          console.log("Navigate to settings");
        },
      },
    ],
    []
  );

  // Stable callback for search results
  const handleSearchResultsChange = useCallback((results: any[]) => {}, []);

  return (
    <Content>
      <div className="p-2 space-y-2 w-full">
        {/* Smart Search Bar */}
        <SmartSearchBar
          placeholder="Zoek in dashboard..."
          onResultsChange={handleSearchResultsChange}
          actions={searchActions()}
          entityTypes={["funeral", "note", "contact"]}
          className="mb-6"
        />

        <Funerals />
      </div>
    </Content>
  );
}
