"use client";

import { distributeAndWithdrawForAll, getSplitBalance } from "@/lib/splits";
import { Crew } from "@/models/crew";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Coin } from "@/models/coin";
import { formatAddress } from "@/lib/utils";
import { usePrivy, useWallets } from "@privy-io/react-auth";

export default function CrewProfile() {
  const pathname = usePathname();
  const splitAddress = pathname.split("/").pop();

  const { ready: readyPrivy, authenticated } = usePrivy();
  const { wallets, ready: readyWallets } = useWallets();

  const [crew, setCrew] = useState<Crew | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);

  useEffect(() => {
    const fetchCrew = async () => {
      if (splitAddress) {
        const response = await fetch(`/api/crew/${splitAddress}`);
        if (response.ok) {
          const crewData = await response.json();
          setCrew(crewData);
        }
      }
    };
    fetchCrew();
  }, [splitAddress]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (splitAddress) {
        const splitBalance = await getSplitBalance(splitAddress);
        setBalance(splitBalance);
      }
    };
    fetchBalance();
  }, [splitAddress]);

  useEffect(() => {
    const fetchCoins = async () => {
      const response = await fetch(`/api/coin/owner/${splitAddress}`);
      const coins = await response.json();
      setCoins(coins);
    };
    fetchCoins();
  }, [splitAddress]);

  useEffect(() => {
    if (readyPrivy && authenticated && readyWallets && crew) {
      const crewMembers = crew.members.map((member) => member.address.toLowerCase());
      const wallet = wallets.find((wallet) => wallet.linked);
      console.log("My MetaMask wallet is", wallet);
      if (crewMembers.includes(wallet?.address.toLowerCase() || "")) {
        setIsAllowed(true);
      } else {
        setIsAllowed(false);
      }
    }
  }, [readyPrivy, authenticated, readyWallets, wallets, crew]);

  console.log("readyPrivy", readyPrivy);
  console.log("authenticated", authenticated);
  console.log("readyWallets", readyWallets);
  console.log("wallets", wallets);
  console.log("isAllowed", isAllowed);
  console.log("crew", crew);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black items-center p-4">
      {/* Header */}
      <header className="w-full max-w-md border-b border-gray-200 p-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <Link href="/">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <h1 className="font-medium">Home</h1>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </header>

      {readyPrivy && !authenticated && (
        <div className="flex flex-col bg-white text-black items-center justify-center p-4">
          <p className="text-lg font-medium">Please login to view this page</p>
          <Link href="/" className="text-blue-500 hover:underline mt-2">
            Go back home
          </Link>
        </div>
      )}

      {readyPrivy && authenticated && !isAllowed && (
        <div className="flex flex-col bg-white text-black items-center justify-center p-4">
          <p className="text-lg font-medium">
            You are not allowed to view this page
          </p>
          <Link href="/" className="text-blue-500 hover:underline mt-2">
            Go back home
          </Link>
        </div>
      )}

      {readyPrivy && authenticated && isAllowed && (
        <>
          {/* Profile Header */}
          <div className="w-full max-w-md p-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
              <Image
                src={crew?.image || "/placeholder.svg"}
                alt={crew?.name || ""}
                width={80}
                height={80}
                className="object-cover w-full h-full rounded-full"
              />
            </div>
            <h2 className="text-lg font-medium mb-1">{crew?.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{crew?.description}</p>
            <span
              className="text-sm text-black-500 mb-4 cursor-pointer"
              onClick={() =>
                navigator.clipboard.writeText(splitAddress as string)
              }
            >
              {formatAddress(splitAddress as string)}
            </span>

            <div className="mb-2">
              <div className="flex justify-center items-center mb-1 gap-2">
                <span className="text-sm font-medium">
                  Balance: {balance} ETH
                </span>
              </div>
              <button
                className="w-[300px] bg-gray-200 text-gray-800 rounded-full py-1.5 text-sm font-medium flex justify-center"
                onClick={async () => {
                  await distributeAndWithdrawForAll(splitAddress as string);
                  const splitBalance = await getSplitBalance(
                    splitAddress as string,
                  );
                  setBalance(splitBalance);
                }}
              >
                Claim
              </button>
            </div>
          </div>

          {/* Members Section */}
          <div className="w-full max-w-md px-6 pb-6 ">
            <h3 className="text-sm font-medium mb-3">Members</h3>

            {/* Member rows */}
            {crew?.members?.map((member, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">{`${formatAddress(member.address)}`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <div className="w-4 h-4 rounded-full bg-blue-300 border border-white"></div>
                    <div className="w-4 h-4 rounded-full bg-green-300 border border-white"></div>
                    <div className="w-4 h-4 rounded-full bg-purple-300 border border-white"></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {member.percentage}%
                  </span>
                </div>
              </div>
            ))}

            {/* Create a coin button */}
            <div className="mt-6 flex justify-center">
              <Link href={`/crew/${splitAddress}/create-coin`}>
                <button className="flex items-center justify-between w-[300px] bg-black text-white rounded-full py-3 px-5">
                  <span className="font-medium">Create coin</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Coins Section */}
          <div className="w-full max-w-md px-6 pb-6">
            <h3 className="text-sm font-medium mb-3">Coins Created</h3>
            <div className="space-y-4">
              {coins.map((coin, i) => (
                <div key={i} className="border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500"></div>
                    <div>
                      <span className="text-sm font-medium">{coin.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatDistanceToNow(new Date(coin.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="ml-8 mt-2 rounded-md overflow-hidden">
                    <Image
                      src={coin.image}
                      alt={coin.name}
                      width={300}
                      height={200}
                      className="w-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium mt-2 ml-8">{coin.symbol}</p>
                  <p className="text-xs text-gray-600 ml-8">
                    {coin.description}
                  </p>
                  <a
                    href={coin.zoraCoinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-gray-700 ml-8 mt-1"
                  >
                    See it on Zora
                  </a>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
