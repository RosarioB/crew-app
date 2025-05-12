"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { saveCrew } from "@/lib/crewService";
import { useRouter } from "next/navigation";
import { createSplitContract } from "@/lib/splits";
import { account } from "@/lib/viem";
import { getEthereumAddress } from "@/lib/utils";

const MAX_MEMBERS = 5;
interface Member {
  address: string;
  percentage: number;
}

export default function CreateCrew() {
  const [crewName, setCrewName] = useState("");
  const [crewBio, setCrewBio] = useState("");
  const [crewImage, setCrewImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [memberCount, setMemberCount] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>(
    Array.from({ length: MAX_MEMBERS }, () => ({
      address: "",
      percentage: 0,
    })),
  );
  const router = useRouter();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCrewImage(e.target.files[0]);
    }
  };

  const validateMembers = async (members: Member[]) => {
    const validMembers = members.filter(
      (member) => member.address !== "" && member.percentage !== 0,
    );
  
    try {
      const validAddresses = await Promise.all(
        validMembers.map(async (member) => ({
          ...member,
          address: await getEthereumAddress(member.address),
        })),
      );
  
      // Check that the sum of percentages is 100
      if (
        validAddresses.reduce((sum, member) => sum + member.percentage, 0) !==
        100
      ) {
        throw new Error(
          "Invalid percentages, sum of percentages must be 100",
        );
      }
  
      return validAddresses;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create crew. Please try again.",
      );
      throw error;
    }
  };

  const handleCreateCrew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      
      const validAddresses = await validateMembers(members);

      console.log("validAddresses", validAddresses);

      const { splitAddress } = await createSplitContract(
        validAddresses,
        1,
        account.address,
      );

      // TESTING
      //const splitAddress = "0x" + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');

      console.log("splitAddress", splitAddress);

      let imageUrl = "";
      if (crewImage) {
        const formData = new FormData();
        formData.append("file", crewImage);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        imageUrl = data.url;
      }

      await saveCrew({
        name: crewName,
        description: crewBio,
        image: imageUrl,
        members: validAddresses,
        splitAddress,
      });

      console.log(`Crew saved in the DB: ${crewName} with splitAddress ${splitAddress}`);

      router.push(`/crew/${splitAddress}`);
    } catch (error) {
      console.error("Error creating crew:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create crew. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateMembersByIndex = (
    index: number,
    address: string | null,
    percentage: number | null,
  ) => {
    if (index >= 0 && index < MAX_MEMBERS && (address || percentage)) {
      let updatedMembers;
      if (!address && percentage) {
        updatedMembers = members.map((member, i) => {
          if (i === index) {
            return { ...member, percentage: percentage as number };
          }
          return member;
        });
      } else {
        updatedMembers = members.map((member, i) => {
          if (i === index) {
            return { ...member, address: address as string };
          }
          return member;
        });
      }
      setMembers(updatedMembers);
    }
  };

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

      {/* Main Content */}
      <div className="w-full max-w-md flex-1 p-6 flex flex-col">
        <h2 className="text-sm font-medium mb-6">Start a new crew</h2>
        <form onSubmit={handleCreateCrew}>
          <div className="flex justify-center mb-6">
            <label className="cursor-pointer">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {crewImage ? (
                  <img
                    src={URL.createObjectURL(crewImage)}
                    alt="Crew"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Plus className="w-6 h-6 text-gray-400" />
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

          <div className="mb-6">
            <h3 className="text-sm font-medium mb-1">Name</h3>
            <input
              type="text"
              placeholder="Enter crew name"
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm mb-4"
              value={crewName}
              onChange={(e) => setCrewName(e.target.value)}
            />
            <h3 className="text-sm font-medium mb-1">Bio</h3>
            <input
              type="text"
              placeholder="Enter crew bio"
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm mb-4"
              value={crewBio}
              onChange={(e) => setCrewBio(e.target.value)}
            />
            <h3 className="text-sm font-medium mb-1">Members</h3>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Address 1"
                className="flex-1 border border-gray-300 rounded-md py-2 px-3 text-sm"
                value={members[0].address}
                onChange={(e) => {
                  updateMembersByIndex(0, e.target.value, null);
                }}
              />
              <input
                type="number"
                placeholder="%"
                min="0"
                max="100"
                className="w-20 border border-gray-300 rounded-md py-2 px-3 text-sm"
                value={members[0].percentage}
                onChange={(e) =>
                  updateMembersByIndex(0, null, parseInt(e.target.value))
                }
              />
            </div>

            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Address 2"
                className="flex-1 border border-gray-300 rounded-md py-2 px-3 text-sm"
                value={members[1].address}
                onChange={(e) => updateMembersByIndex(1, e.target.value, null)}
              />
              <input
                type="number"
                placeholder="%"
                min="0"
                max="100"
                className="w-20 border border-gray-300 rounded-md py-2 px-3 text-sm"
                value={members[1].percentage}
                onChange={(e) =>
                  updateMembersByIndex(1, null, parseInt(e.target.value))
                }
              />
            </div>
            {Array.from({ length: memberCount - 2 }).map((_, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder={`Address ${index + 3}`}
                  className="flex-1 border border-gray-300 rounded-md py-2 px-3 text-sm"
                  value={members[index + 2].address}
                  onChange={(e) =>
                    updateMembersByIndex(index + 2, e.target.value, null)
                  }
                />
                <input
                  type="number"
                  placeholder="%"
                  min="0"
                  max="100"
                  className="w-20 border border-gray-300 rounded-md py-2 px-3 text-sm"
                  value={members[index + 2].percentage}
                  onChange={(e) =>
                    updateMembersByIndex(
                      index + 2,
                      null,
                      parseInt(e.target.value) || 0,
                    )
                  }
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                if (memberCount < MAX_MEMBERS) {
                  setMemberCount(memberCount + 1);
                }
              }}
              className="text-blue-500 text-sm mt-2 hover:text-blue-700"
            >
              + Add member
            </button>
            </div>

          {/* Error message */}
          {error && (
              <div className="w-full max-w-md mb-4 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}
          <div className="w-full max-w-md flex justify-center">
            <button
              className="flex items-center justify-between w-[300px] bg-black text-white rounded-full py-3 px-5"
              type="submit"
              disabled={isLoading || !crewName || !crewBio}
            >
              <span className="font-medium">{isLoading ? "Creating..." : "Create Crew"}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
