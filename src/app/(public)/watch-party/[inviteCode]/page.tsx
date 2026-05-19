import type { Metadata } from "next";
import { redirect } from "next/navigation";
import WatchPartyPageClient from "@/components/pages/WatchPartyPageClient";

interface Props {
  params: Promise<{ inviteCode: string }> | { inviteCode: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { inviteCode } = params instanceof Promise ? await params : params;
  return {
    title: `Xem chung — ${inviteCode}`,
    description: "Phòng xem phim cùng bạn bè",
    robots: { index: false },
  };
}

export default async function WatchPartyPage({ params }: Props) {
  const { inviteCode } = params instanceof Promise ? await params : params;

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  let partyInfo: {
    id: number;
    contentTitle: string;
    posterUrl: string | null;
    movieId: number | null;
    tvId: number | null;
    season: number | null;
    episode: number | null;
    hostName: string;
    isActive: boolean;
    expiresAt: string;
  } | null = null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/watch-party/${inviteCode}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const json = (await res.json()) as { success: boolean; data: typeof partyInfo };
      if (json.success) partyInfo = json.data;
    }
  } catch {
    // fetch failed — will show error on client
  }

  if (!partyInfo) {
    redirect("/?error=watch-party-not-found");
  }

  return (
    <WatchPartyPageClient
      inviteCode={inviteCode}
      partyInfo={partyInfo}
    />
  );
}
