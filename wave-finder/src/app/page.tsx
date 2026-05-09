"use client";
import { useState } from "react";
import Link from "next/link";
import SkillFilter from "@/components/SkillFilter";
import WaveFeed from "@/components/WaveFeed";
import { useWaves } from "@/lib/hooks";

export default function HomePage() {
  const [skills, setSkills] = useState<string[]>([]);
  const { data, isLoading } = useWaves(skills);

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>🌊 The Wave Finder</h1>
        <Link href="/leaderboard" style={{ fontSize: 14, color: "#6366f1" }}>
          Leaderboard →
        </Link>
      </header>

      <SkillFilter selected={skills} onChange={setSkills} />
      <WaveFeed waves={data ?? []} loading={isLoading} />
    </main>
  );
}
