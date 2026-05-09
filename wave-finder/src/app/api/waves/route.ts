import { NextRequest, NextResponse } from "next/server";
import { indexerClient, GET_ACTIVE_WAVES } from "@/lib/graphql";
import type { Wave } from "@/lib/types";

export async function GET(req: NextRequest) {
  const skills = req.nextUrl.searchParams.get("skills")?.split(",").filter(Boolean) ?? [];

  const { waves } = await indexerClient.request<{ waves: Wave[] }>(GET_ACTIVE_WAVES);

  // Enrich with Drips Wave API metadata (repo URL, skills)
  const enriched = await Promise.all(
    waves.map(async (wave) => {
      try {
        const res = await fetch(`${process.env.DRIPS_WAVE_API}/${wave.id}`, {
          next: { revalidate: 60 },
        });
        if (!res.ok) return wave;
        const meta = await res.json();
        return { ...wave, repoUrl: meta.repoUrl, skills: meta.skills ?? [] };
      } catch {
        return wave;
      }
    })
  );

  const filtered =
    skills.length > 0
      ? enriched.filter((w) => w.skills?.some((s: string) => skills.includes(s)))
      : enriched;

  return NextResponse.json(filtered);
}
