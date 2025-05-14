"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Crew } from "@/models/crew";
import { uploadImageToPinata, uploadJsonToPinata } from "@/lib/pinata";
import { account } from "@/lib/viem";
import { CreateCoinArgs } from "@zoralabs/coins-sdk";
import { createCoinWithRetry } from "@/lib/zora";
import { saveCoin } from "@/lib/coinService";
import { useRouter } from "next/navigation";
import { ConnectedWallet, usePrivy, useWallets } from "@privy-io/react-auth";

export default function CreateCoin() {
  const pathname = usePathname();
  const splitAddress = pathname.split("/")[2];

  const { ready: readyPrivy, authenticated } = usePrivy();
  const { wallets } = useWallets();

  const [coinImage, setCoinImage] = useState<File | null>(null);
  const [coinName, setCoinName] = useState("");
  const [coinDescription, setCoinDescription] = useState("");
  const [coinSymbol, setCoinSymbol] = useState("");
  const [crew, setCrew] = useState<Crew | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);

  const router = useRouter();


  useEffect(() => {
    if (readyPrivy && authenticated) {
      const wallet = wallets.find((wallet) => wallet.walletClientType === "warpcast");
      console.log("The Warpcast wallet is", wallet);
      if(wallet) {
        setWallet(wallet);
      } else {
        console.log("No wallet found");
      }
    }
  }, [readyPrivy, authenticated, wallets]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoinImage(e.target.files[0]);
    }
  };

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
    if (readyPrivy && authenticated && crew && wallet) {
      const crewMembers = crew.members.map((member) => member.address.toLowerCase());
      if (crewMembers.includes(wallet.address.toLowerCase())) {
        setIsAllowed(true);
      } else {
        setIsAllowed(false);
      }
    }
  }, [readyPrivy, authenticated, wallets, crew, wallet]);

  const handleCreateCoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (!coinImage) {
        setError("No image file provided");
        throw new Error("No image file provided");
      }
      const imageHash = await uploadImageToPinata(coinImage);
      const jsonHash = await uploadJsonToPinata(
        coinName,
        coinDescription,
        imageHash,
      );

      const imageUrl = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${imageHash}`;
      const jsonUrl = `ipfs://${jsonHash}`;

      const coinParams: CreateCoinArgs = {
        name: coinName,
        symbol: coinSymbol,
        uri: jsonUrl,
        payoutRecipient: splitAddress as `0x${string}`,
        platformReferrer: account.address,
        owners: [splitAddress as `0x${string}`],
      };

      console.log(`Coin params: ${JSON.stringify(coinParams)}`);

      const result = await createCoinWithRetry(coinParams, jsonHash);
      if (!result.address) {
        throw new Error("Failed to call Zora SDK. Please try again.");
      }
      const zoraCoinUrl = `https://zora.co/coin/base:${result.address}`;

      await saveCoin({
        name: coinName,
        symbol: coinSymbol,
        description: coinDescription,
        image: imageUrl,
        uri: jsonUrl,
        owner: splitAddress,
        payoutRecipient: splitAddress,
        platformReferrer: account.address,
        currency: result.deployment?.currency || null,
        pool: result.deployment?.pool || null,
        version: result.deployment?.version || null,
        zoraCoinUrl: zoraCoinUrl,
        address: result.address as string,
        txHash: result.hash,
      });

      console.log(
        `Coin saved in the DB: ${coinName} with address ${result.address}`,
      );

      router.push(`/crew/${splitAddress}`);
    } catch (error: unknown) {
      console.error("Error creating coin:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black items-center p-4">
      {/* Header */}
      <header className="w-full max-w-md border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/crew/${splitAddress}`}>
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <h1 className="font-medium">{crew?.name}</h1>
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
          {/* Main Content */}
          <div className="w-full max-w-md flex-1 p-6 flex flex-col">
            <h2 className="text-sm font-medium mb-6">Create a new coin</h2>
            <form onSubmit={handleCreateCoin}>
              <div className="flex-1">
                <div className="flex justify-center mb-6">
                  <label className="cursor-pointer">
                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {coinImage ? (
                        <img
                          src={URL.createObjectURL(coinImage)}
                          alt="Crew"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Plus className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                <div className="mt-auto mb-6 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                    {crew?.image ? (
                      <Image
                        src={crew.image}
                        alt={crew.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    )}
                  </div>
                  <span className="text-xs font-medium self-center">
                    {crew?.name}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-1">Name</h3>
                  <input
                    type="text"
                    placeholder="Enter coin name"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm mb-4"
                    value={coinName}
                    onChange={(e) => setCoinName(e.target.value)}
                  />
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <input
                    type="text"
                    placeholder="Enter coin description"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm mb-4"
                    value={coinDescription}
                    onChange={(e) => setCoinDescription(e.target.value)}
                  />
                  <h3 className="text-sm font-medium mb-1">Symbol</h3>
                  <input
                    type="text"
                    placeholder="Enter coin symbol (max 10 letters)"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm mb-4"
                    value={coinSymbol}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      if (/^[A-Z]{0,10}$/.test(value)) {
                        setCoinSymbol(value);
                      }
                    }}
                    maxLength={10}
                  />
                </div>
              </div>
              {/* Error message */}
              {error && (
                <div className="w-full max-w-md mb-4 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}
              <div className="flex justify-center">
                <button
                  className="flex items-center justify-between w-[300px] bg-black text-white rounded-full py-3 px-5"
                  type="submit"
                  disabled={
                    isLoading || !coinName || !coinDescription || !coinSymbol
                  }
                >
                  <span className="font-medium">
                    {isLoading ? "Creating..." : "Create Coin"}
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
