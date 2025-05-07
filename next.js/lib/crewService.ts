import { Recipient } from "@/models/crew";

export interface CreateCrewData {
  name: string;
  description: string;
  image: string | null;
  members: Recipient[];
  splitAddress: string;
}

export async function saveCrew(crewData: CreateCrewData) {
  try {
    // Create form data
    const formData = new FormData();
    formData.append("name", crewData.name);
    formData.append("description", crewData.description);
    if (crewData.image) {
      formData.append("image", crewData.image);
    }
    formData.append("members", JSON.stringify(crewData.members));
    formData.append("splitAddress", crewData.splitAddress);

    // Log FormData contents
    console.log("Crew Name:", crewData.name);
    console.log("Crew Bio:", crewData.description);
    console.log("Members:", JSON.stringify(crewData.members, null, 2));
    console.log("Split Address:", crewData.splitAddress);
    console.log("Image URL:", crewData.image || "No image");

    // Save to API
    const response = await fetch("/api/crew", {
      method: "POST",
      body: formData,
    });

    if(response.ok) {
      console.log("Crew created successfully");
    } else {
        console.error("Failed to create the crew:");
    }

    return response;
  } catch (error) {
    console.error("Error creating crew:", error);
    throw error;
  }
} 