"use client";

import {
  Root,
  Trigger,
  Portal,
  Content,
  Item,
} from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";

export default function RadixTestPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Raw Radix Test
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
          Raw Radix Test
        </h1>

        <Root>
          <Trigger asChild>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Open Menu
            </button>
          </Trigger>
          <Portal>
            <Content className="bg-white border rounded shadow-lg p-2 min-w-[200px]">
              <Item className="px-2 py-1 hover:bg-gray-100 cursor-pointer">
                Item 1
              </Item>
              <Item className="px-2 py-1 hover:bg-gray-100 cursor-pointer">
                Item 2
              </Item>
              <Item className="px-2 py-1 hover:bg-gray-100 cursor-pointer">
                Item 3
              </Item>
            </Content>
          </Portal>
        </Root>

        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ If you can see and interact with this dropdown, Radix UI is
            working!
          </p>
        </div>
      </div>
    </div>
  );
}
