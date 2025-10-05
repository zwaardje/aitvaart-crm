"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/Button";
import {
  RiArrowDownSLine,
  RiSettingsLine,
  RiUserLine,
  RiLogoutBoxLine,
} from "@remixicon/react";
import { useEffect, useState } from "react";

export default function TestDropdownPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Dropdown Component Test
          </h1>
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Dropdown Component Test
        </h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Basic Dropdown
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Select an option
                  <RiArrowDownSLine className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <RiUserLine className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <RiSettingsLine className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <RiLogoutBoxLine className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Dropdown with Button Trigger
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  Open Menu
                  <RiArrowDownSLine className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Option 1</DropdownMenuItem>
                <DropdownMenuItem>Option 2</DropdownMenuItem>
                <DropdownMenuItem>Option 3</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Dropdown with Icon Trigger
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <RiSettingsLine className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Preferences</DropdownMenuItem>
                <DropdownMenuItem>Privacy</DropdownMenuItem>
                <DropdownMenuItem>Notifications</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ If you can see and interact with these dropdowns, the component
            is working correctly!
          </p>
        </div>
      </div>
    </div>
  );
}
