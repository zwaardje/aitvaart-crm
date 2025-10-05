"use client";

import React from "react";

// Test direct imports vs index imports
export default function TestImportsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Import Test</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Direct Import Test:</h2>
          {(() => {
            try {
              const Button = require("@/components/ui/Button").Button;
              console.log("Direct Button:", Button);
              return (
                <div className="text-green-500">
                  ✅ Direct Button import works
                </div>
              );
            } catch (error) {
              return (
                <div className="text-red-500">
                  ❌ Direct Button import failed: {error.message}
                </div>
              );
            }
          })()}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Index Import Test:</h2>
          {(() => {
            try {
              const { Button } = require("@/components/ui");
              console.log("Index Button:", Button);
              return (
                <div className="text-green-500">
                  ✅ Index Button import works
                </div>
              );
            } catch (error) {
              return (
                <div className="text-red-500">
                  ❌ Index Button import failed: {error.message}
                </div>
              );
            }
          })()}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">
            Dialog Direct Import Test:
          </h2>
          {(() => {
            try {
              const { Dialog } = require("@/components/ui/dialog");
              console.log("Direct Dialog:", Dialog);
              return (
                <div className="text-green-500">
                  ✅ Direct Dialog import works
                </div>
              );
            } catch (error) {
              return (
                <div className="text-red-500">
                  ❌ Direct Dialog import failed: {error.message}
                </div>
              );
            }
          })()}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">
            Dialog Index Import Test:
          </h2>
          {(() => {
            try {
              const { Dialog } = require("@/components/ui");
              console.log("Index Dialog:", Dialog);
              return (
                <div className="text-green-500">
                  ✅ Index Dialog import works
                </div>
              );
            } catch (error) {
              return (
                <div className="text-red-500">
                  ❌ Index Dialog import failed: {error.message}
                </div>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
}
