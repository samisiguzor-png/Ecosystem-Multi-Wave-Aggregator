import { NextResponse } from "next/server";
import { indexerClient, GET_LEADERBOARD } from "@/lib/graphql";
import type { Contributor } from "@/lib/types";

export async function GET() {
  const { contributors } = await indexerClient.request<{ contributors: Contributor[] }>(
    GET_LEADERBOARD
  );
  return NextResponse.json(contributors);
}
