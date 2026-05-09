import useSWR from "swr";
import type { Wave, Contributor } from "./types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useWaves(skills: string[] = []) {
  const params = skills.length ? `?skills=${skills.join(",")}` : "";
  return useSWR<Wave[]>(`/api/waves${params}`, fetcher, { refreshInterval: 30_000 });
}

export function useLeaderboard() {
  return useSWR<Contributor[]>("/api/leaderboard", fetcher, { refreshInterval: 60_000 });
}
