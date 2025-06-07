import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  return {
    title: "Crew",
    description:
      "Launch Zora Coins with your friends and split the rewards.",
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: `${URL}/images/feed.png`,
        button: {
          title: `Launch Crew`,
          action: {
            type: "launch_frame",
            name: "Crews",
            url: URL,
            splashImageUrl: `${URL}/images/splash.png`,
            splashBackgroundColor: "#FFFFFF",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
