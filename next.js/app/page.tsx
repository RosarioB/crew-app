"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import { Home } from "./components/DemoComponents";
import { Features } from "./components/DemoComponents";

import { ChevronRight, MoreHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const router = useRouter();
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [activeTab, setActiveTab] = useState("my-crews");

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

  /* useEffect(() => {
    if (ready && authenticated) {
      router.push("/crew");
    }
  }, [ready, authenticated, router]); */

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
      {authenticated && (
        <div className="flex justify-end">
          <button
            className="text-sm font-medium"
            onClick={() => logout()}
          >
            Logout
          </button>
        </div>
      )}

      <div className="text-center space-y-4">
        {/* Tabs */}
        <div className="flex border-b border-[#f1f1f1]">
          <button
            className={`flex-1 py-3 text-sm font-medium ${activeTab === "my-crews" ? "border-b-2 border-black" : ""}`}
            onClick={() => setActiveTab("my-crews")}
          >
            My Crews
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${activeTab === "explore-crews" ? "border-b-2 border-black" : ""}`}
            onClick={() => setActiveTab("explore-crews")}
          >
            Explore Crews
          </button>
        </div>

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

          {ready && !authenticated && (
            <div className="flex justify-center">
              <button
                className="flex items-center justify-between w-36 bg-black text-white rounded-full py-3 px-5"
                onClick={() => login()}
              >
                <span className="font-medium">Login</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
          {authenticated && (
            <div className="flex justify-center">
              <Link href="/create-crew">
                <button className="flex items-center justify-between w-full bg-black text-white rounded-full py-3 px-5">
                  <span className="font-medium">Start a crew</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
