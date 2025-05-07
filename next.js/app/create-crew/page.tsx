"use client";

import { ChevronLeft, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { saveCrew } from "@/lib/crewService";
import { useRouter } from "next/navigation";
import { createSplitContract } from "@/lib/splits";

export default function CreateCrew() {
  const [crewName, setCrewName] = useState("");
  const [crewBio, setCrewBio] = useState("");
  const [member1Address, setMember1Address] = useState("");
  const [member1Percentage, setMember1Percentage] = useState("");
  const [member2Address, setMember2Address] = useState("");
  const [member2Percentage, setMember2Percentage] = useState("");
  const [crewImage, setCrewImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCrewImage(e.target.files[0]);
    }
  };

  const handleCreateCrew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const members = [
        {
          address: member1Address,
          percentage: parseInt(member1Percentage) || 50,
        },
        {
          address: member2Address,
          percentage: parseInt(member2Percentage) || 50,
        },
      ];

      const {splitAddress} = await createSplitContract(members, 1, account.address);

      // TESTING
      //const splitAddress = "0x" + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');

      let imageUrl = "";
      if (crewImage) {
        const formData = new FormData();
        formData.append('file', crewImage);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        imageUrl = data.url;
      }

      await saveCrew({
        name: crewName,
        description: crewBio,
        image: imageUrl,
        members,
        splitAddress,
      });

      router.push(`/crew/${splitAddress}`);
    } catch (error) {
      console.error("Error creating crew:", error);
      alert("Failed to create crew. Please try again.");
    } finally {
      setIsLoading(false);
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
      <div className="flex-1 p-6 flex flex-col">
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
                value={member1Address}
                onChange={(e) => setMember1Address(e.target.value)}
              />
              <input
                type="number"
                placeholder="%"
                min="0"
                max="100"
                className="w-20 border border-gray-300 rounded-md py-2 px-3 text-sm"
                value={member1Percentage}
                onChange={(e) => setMember1Percentage(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Address 2"
                className="flex-1 border border-gray-300 rounded-md py-2 px-3 text-sm"
                value={member2Address}
                onChange={(e) => setMember2Address(e.target.value)}
              />
              <input
                type="number"
                placeholder="%"
                min="0"
                max="100"
                className="w-20 border border-gray-300 rounded-md py-2 px-3 text-sm"
                value={member2Percentage}
                onChange={(e) => setMember2Percentage(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-md font-medium disabled:opacity-50"
              disabled={isLoading || !crewName || !crewBio}
            >
              {isLoading ? "Creating..." : "Create Crew"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
