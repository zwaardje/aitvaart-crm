"use client";

import { Button } from "@/components/ui/Button";

export default function SimpleTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Simple Button Test
        </h1>

        <div className="space-y-4">
          <Button>Test Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="destructive">Destructive Button</Button>
        </div>

        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ If you can see these buttons, the Button component is working!
          </p>
        </div>
      </div>
    </div>
  );
}
