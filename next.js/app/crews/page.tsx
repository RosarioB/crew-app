"use client";

import { formatAddress } from "@/lib/utils";
import { Crew } from "@/models/crew";
import { useWallets, usePrivy, ConnectedWallet } from "@privy-io/react-auth";
import {
  ChevronLeft,
  MoreHorizontal,
  Search,
  Plus,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface CrewData {
  name: string;
  description: string;
  image: string | null;
  members: string[];
  splitAddress: string;
  id: string;
}

export default function AllCrews() {
  const { ready: readyPrivy, authenticated } = usePrivy();
  const { wallets } = useWallets();

  const [searchQuery, setSearchQuery] = useState("");
  const [crewsData, setCrewsData] = useState<CrewData[]>([]);
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);

  useEffect(() => {
    if (readyPrivy && authenticated) {
      const wallet = wallets.find(
        (wallet) => wallet.walletClientType === "warpcast",
      );
      console.log("The Warpcast wallet is", wallet);
      if (wallet) {
        setWallet(wallet);
      } else {
        console.log("No wallet found");
      }
    }
  }, [readyPrivy, authenticated, wallets]);

  useEffect(() => {
    const fetchCrews = async () => {
      try {
        const response = await fetch("/api/crew");
        if (response.ok && wallet) {
          const data = await response.json();
          const crewsData: CrewData[] = data.map((crew: Crew) => ({
            ...crew,
            members: crew.members.map((member) => member.address),
            id: crew.splitAddress,
          }));
          const filteredCrewsData = crewsData.filter((crewData) =>
            crewData.members.includes(wallet.address),
          );
          setCrewsData(filteredCrewsData);
        }
      } catch (error) {
        console.error("Error fetching crews:", error);
      }
    };

    fetchCrews();
  }, [wallet]);

  // Filter crews based on search query
  const filteredCrews = crewsData.filter(
    (crew) =>
      crew.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crew.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-screen bg-white text-black items-center justify-center p-4">
      {/* Header */}
      <header className="w-full max-w-md border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <h1 className="font-medium">Home</h1>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </header>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 w-full max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search crews"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Crews List */}
      <div className="flex-1 p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium">
            Showing {filteredCrews.length} crews
          </h2>
          <Link
            href="/create-crew"
            className="flex items-center gap-1 text-sm font-medium text-black"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </Link>
        </div>

        <div className="space-y-4">
          {filteredCrews.map((crew) => (
            <Link href={`/crew/${crew.id}`} key={crew.id}>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={crew.image || "/placeholder.svg"}
                      alt={crew.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{crew.name}</h3>
                      {/* <div className="text-xs text-gray-500">${crew.coins} Coins</div> */}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {crew.description}
                    </p>
                    <div className="flex flex-col gap-2 mt-2">
                      {crew.members.map((address, index) => (
                        <div
                          key={address}
                          className="flex items-center gap-2"
                          title={address}
                        >
                          <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                            <span className="text-[10px]">{index + 1}</span>
                          </div>
                          <span className="text-xs text-gray-700">
                            {formatAddress(address)}
                          </span>
                        </div>
                      ))}
                      {/* <span className="text-xs text-gray-500 mt-1">
                        {crew.members.length} members
                      </span> */}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredCrews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="font-medium mb-1">No crews found</h3>
            <p className="text-sm text-gray-500 mb-4">
              Try a different search or create a new crew
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
