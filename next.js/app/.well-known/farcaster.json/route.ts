import { NextResponse } from "next/server";

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL!;

  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: {
      version: "next",
      name: "Crews",
      homeUrl: URL,
      iconUrl: `${URL}/images/icon.png`,
      imageUrl: `${URL}/images/feed.png`,
      buttonTitle: `Launch Crews`,
      splashImageUrl: `${URL}/images/splash.png`,
      splashBackgroundColor: "#FFFFFF",
      webhookUrl: `${URL}/api/webhook`,
    },
  });
}