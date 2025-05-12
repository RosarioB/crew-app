"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import { usePrivy } from "@privy-io/react-auth";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const { ready, authenticated, user, login, logout } = usePrivy();
  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black items-center justify-center p-4">
      {/* Header */}
      <header className="w-full max-w-md border-b border-gray-200 p-4 flex items-center justify-between">
      {authenticated && (
        <div className="flex justify-start">
          <button
            className="text-sm font-medium text-blue-500"
            onClick={() => logout()}
          >
            Logout
          </button>
        </div>
      )}
        <div className="flex justify-end ml-auto">{saveFrameButton}</div>
      </header>

      {/* View All Crews Link */}
      <div className="w-full max-w-md px-6 pt-4 flex justify-between items-center">
        <h2 className="text-sm font-medium">Recent Crews</h2>
        <Link
          href="/crews"
          className="text-sm text-gray-500 flex items-center gap-1"
        >
          <span>View all</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        {/* Main Content */}
        <div className="p-6">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl font-light text-[#252525]">
              Start a crew.
            </h2>
            <h2 className="text-2xl font-light text-[#252525]">
              Coin anything.
            </h2>
            <h2 className="text-2xl font-light text-[#252525]">
              Split everything.
            </h2>
          </div>

          <div className="text-sm text-[#6e6e6e] text-center mb-12">
            <p>
              Publish coins on Zora with your friends and split the rewards.
            </p>
          </div>

          <div className="flex justify-center">
          {ready && !authenticated && (
              <button
                className="flex items-center justify-between w-[300px] bg-black text-white rounded-full py-3 px-5"
                onClick={() => login()}
              >
                <span className="font-medium">Login</span>
                <ChevronRight className="w-5 h-5" />
              </button>
          )}
          {authenticated && (
            <Link href="/create-crew">
              <button className="flex items-center justify-between w-[300px] bg-black text-white rounded-full py-3 px-5">
                <span className="font-medium">Start a crew</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </Link>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
