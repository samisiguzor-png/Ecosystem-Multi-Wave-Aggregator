"use client";
import Link from "next/link";
import Leaderboard from "@/components/Leaderboard";
import { useLeaderboard } from "@/lib/hooks";

export default function LeaderboardPage() {
  const { data, isLoading } = useLeaderboard();

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 16px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>🏆 Top Wave Riders</h1>
        <Link href="/" style={{ fontSize: 14, color: "#6366f1" }}>
          ← Feed
        </Link>
      </header>

      <Leaderboard contributors={data ?? []} loading={isLoading} />
    </main>
  );
}
