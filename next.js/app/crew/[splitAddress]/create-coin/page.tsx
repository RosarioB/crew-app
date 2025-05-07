"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, Router } from "lucide-react";
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

export default function CreateCoin() {
  const pathname = usePathname();
  const splitAddress = pathname.split("/")[2];
  const [coinImage, setCoinImage] = useState<File | null>(null);
  const [coinName, setCoinName] = useState("");
  const [coinDescription, setCoinDescription] = useState("");
  const [coinSymbol, setCoinSymbol] = useState("");
  const [crew, setCrew] = useState<Crew | null>(null);
  const router = useRouter();

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

  const handleCreateCoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!coinImage) {
      console.error("No image file provided");
      return;
    }
    const imageHash = await uploadImageToPinata(coinImage);
    const jsonHash = await uploadJsonToPinata(
      coinName,
      coinDescription,
      imageHash,
    );

    /* const imageHash = "bafybeifwevrhhi4n7rxr3oz7mvne67amw5a6trhhozibvmr7tu4lcgqygm";
    const jsonHash = "bafkreidn46m7tnqnqwam2qwtphr6j2ynsneikn4sow5rk3rbrx3fzhyu2y"; */
    const imageUrl = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${imageHash}`;
    const jsonUrl = `ipfs://${jsonHash}`;

    try {
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

      router.push(`/crew/${splitAddress}`);
    } catch (error) {
      console.error("Error creating coin:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black items-center justify-center p-4">
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
                placeholder="Enter coin symbol"
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm mb-4"
                value={coinSymbol}
                onChange={(e) => setCoinSymbol(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              className="flex items-center justify-between w-[300px] bg-black text-white rounded-full py-3 px-5"
              type="submit"
            >
              <span className="font-medium">Create Coin</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
