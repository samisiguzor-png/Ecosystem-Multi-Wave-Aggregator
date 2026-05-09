# 🌊 The Wave Finder
### Ecosystem Multi-Wave Aggregator — Cross-Chain Discovery Layer for Open Source Sprints

> A real-time aggregation dashboard that queries Drips smart contracts across multiple blockchain networks (Ethereum, Stellar, and beyond) to surface the best open-source contribution opportunities — ranked, filtered, and personalized to your skill set.

---

## Table of Contents

1. [Background & Problem Statement](#background--problem-statement)
2. [How It Works](#how-it-works)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [Data Layer — GraphQL & Indexer](#data-layer--graphql--indexer)
7. [API Routes](#api-routes)
8. [Core Components](#core-components)
9. [TypeScript Types](#typescript-types)
10. [SWR Data Hooks](#swr-data-hooks)
11. [Points per Hour Algorithm](#points-per-hour-algorithm)
12. [Setup & Configuration](#setup--configuration)
13. [Environment Variables](#environment-variables)
14. [Usage Walkthrough](#usage-walkthrough)
15. [Extending the Project](#extending-the-project)
16. [Tech Stack](#tech-stack)
17. [Contributing](#contributing)
18. [License](#license)

---

## Background & Problem Statement

**Drips Wave** is a protocol that lets blockchain ecosystems fund open-source work in time-boxed cycles called *Waves*. Each Wave is tied to a specific repository, allocates a pool of tokens as rewards, and distributes points to contributors who complete tasks within the cycle window.

As the protocol expands across chains — Ethereum mainnet, Stellar, StarkNet, Optimism, and more — a critical UX gap has emerged:

> **There is no single place where a contributor can see all active Waves, compare reward rates across ecosystems, and find work that matches their skill set.**

A developer proficient in Rust might miss a high-value Stellar Wave because they were only watching the Ethereum feed. A Cairo developer might not know that a StarkNet Wave just opened with 200,000 points and only 48 hours remaining.

**The Wave Finder** solves this with a unified, real-time aggregation layer that:

- Indexes `WaveCreated` and `WaveClosed` on-chain events across all supported networks
- Enriches raw on-chain data with repository metadata from the Drips Wave API
- Presents a live "Opportunity Feed" sorted by reward velocity (points per hour)
- Lets contributors filter by skill, ecosystem, and reward token
- Maintains a global leaderboard of the top contributors across all chains

---

## How It Works

At a high level, the system has three layers:

**1. Indexer Layer**
A Subgraph (The Graph Protocol) or an Envoy node watches the Drips smart contracts on each supported chain. Every time a `WaveCreated` or `WaveClosed` event is emitted, the indexer updates its store. This store is queryable via a GraphQL endpoint.

**2. API Layer**
Next.js Route Handlers act as a thin BFF (Backend for Frontend). They query the indexer's GraphQL endpoint, fan out to the Drips Wave REST API to enrich each wave with repository metadata (skills required, repo URL, task count), apply server-side skill filtering, and return clean JSON to the browser.

**3. Frontend Layer**
A Next.js App Router dashboard polls the API routes via SWR. The feed refreshes every 30 seconds. The leaderboard refreshes every 60 seconds. No page reload is needed — contributors see waves appear and disappear in real time as cycles open and close on-chain.

---

## Features

| Feature | Description |
|---|---|
| **Cross-Chain Feed** | Aggregates active Wave cycles from Ethereum, Stellar, StarkNet, Optimism, and any future chain the indexer supports |
| **Points per Hour** | Computes live reward velocity — total allocated points divided by hours remaining — so you can instantly spot the highest-value opportunity |
| **Skill Matchmaking** | Filter the feed by your stack: Rust, Cairo, React, Solidity, TypeScript, Go, Python. Waves are tagged with required skills from the Drips Wave API |
| **Reward Pool Display** | Shows the token amount and symbol (ETH, XLM, STRK, OP…) for each wave's reward pool |
| **Global Leaderboard** | Top 50 Wave Riders ranked by cumulative points earned across all ecosystems and all time |
| **Ride Wave** | One-click link that takes you directly to the repository's task list on the Drips platform |
| **Auto-Refresh** | SWR polling keeps the feed live without manual reloads — waves that close disappear automatically |
| **Zero Auth to Browse** | The feed is publicly readable. GitHub auth is only required to claim tasks |

---

## Architecture

### System Diagram

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                          BLOCKCHAIN LAYER                                    ║
║                                                                              ║
║   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ║
║   │  Ethereum   │   │   Stellar   │   │  StarkNet   │   │  Optimism   │   ║
║   │  Mainnet    │   │   Network   │   │   (Cairo)   │   │   (OP)      │   ║
║   │             │   │             │   │             │   │             │   ║
║   │WaveCreated  │   │WaveCreated  │   │WaveCreated  │   │WaveCreated  │   ║
║   │WaveClosed   │   │WaveClosed   │   │WaveClosed   │   │WaveClosed   │   ║
║   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   ║
╚══════════╪═════════════════╪═════════════════╪═════════════════╪════════════╝
           │                 │                 │                 │
           └─────────────────┴────────┬────────┴─────────────────┘
                                      │  on-chain events
                          ╔═══════════▼═══════════╗
                          ║    INDEXER LAYER       ║
                          ║                        ║
                          ║  Subgraph (The Graph)  ║
                          ║       — or —           ║
                          ║    Envoy Node          ║
                          ║                        ║
                          ║  GraphQL endpoint      ║
                          ╚═══════════╤════════════╝
                                      │  GraphQL queries
                          ╔═══════════▼════════════╗
                          ║      API LAYER          ║
                          ║   (Next.js Routes)      ║
                          ║                         ║
                          ║  /api/waves             ║◀──── Drips Wave API
                          ║  /api/leaderboard       ║      (repo metadata,
                          ║                         ║       skills, repoUrl)
                          ╚═══════════╤═════════════╝
                                      │  JSON (fetch / SWR)
                          ╔═══════════▼═════════════╗
                          ║     FRONTEND LAYER       ║
                          ║    (Next.js App Router)  ║
                          ║                          ║
                          ║  ┌────────────────────┐  ║
                          ║  │  page.tsx          │  ║
                          ║  │  ├─ SkillFilter    │  ║
                          ║  │  └─ WaveFeed       │  ║
                          ║  │     └─ WaveCard×N  │  ║
                          ║  └────────────────────┘  ║
                          ║  ┌────────────────────┐  ║
                          ║  │  leaderboard/      │  ║
                          ║  │  page.tsx          │  ║
                          ║  │  └─ Leaderboard    │  ║
                          ║  └────────────────────┘  ║
                          ╚══════════════════════════╝
```

### Request Lifecycle

```
User opens /
    │
    ├─▶ useWaves(skills) [SWR, 30s interval]
    │       │
    │       └─▶ GET /api/waves?skills=Rust,Cairo
    │               │
    │               ├─▶ indexerClient.request(GET_ACTIVE_WAVES)
    │               │       └─▶ Subgraph GraphQL endpoint
    │               │               └─▶ returns Wave[]
    │               │
    │               ├─▶ Promise.all → fetch DRIPS_WAVE_API/:id  (per wave)
    │               │       └─▶ attaches repoUrl + skills[]
    │               │
    │               └─▶ filter by ?skills param → NextResponse.json(waves)
    │
    └─▶ useLeaderboard() [SWR, 60s interval]
            │
            └─▶ GET /api/leaderboard
                    │
                    └─▶ indexerClient.request(GET_LEADERBOARD)
                            └─▶ returns Contributor[] sorted by totalPoints
```

### Component Tree

```
<RootLayout>
  └── <HomePage>                    ← /
        ├── <SkillFilter>           ← pill toggles, drives useWaves(skills)
        └── <WaveFeed waves loading>
              └── <WaveCard> × N   ← one per active wave

  └── <LeaderboardPage>             ← /leaderboard
        └── <Leaderboard contributors loading>
```

---

## Project Structure

```
wave-finder/
│
├── next.config.js              # env var injection (INDEXER_URL, DRIPS_WAVE_API)
├── package.json                # Next 14, graphql-request, swr — pinned versions
├── tsconfig.json               # strict mode, path alias @/*
├── .env.local.example          # template — copy to .env.local
│
└── src/
    ├── app/                    # Next.js App Router
    │   ├── layout.tsx          # root layout, metadata, global CSS import
    │   ├── globals.css         # minimal reset + base styles
    │   ├── page.tsx            # "/" — feed page (client component)
    │   │
    │   ├── leaderboard/
    │   │   └── page.tsx        # "/leaderboard" — top wave riders (client component)
    │   │
    │   └── api/
    │       ├── waves/
    │       │   └── route.ts    # GET /api/waves?skills=
    │       └── leaderboard/
    │           └── route.ts    # GET /api/leaderboard
    │
    ├── components/
    │   ├── WaveCard.tsx        # single wave — pts/hr, reward pool, skills, ride link
    │   ├── WaveFeed.tsx        # responsive CSS grid of WaveCards
    │   ├── Leaderboard.tsx     # ranked table of contributors
    │   └── SkillFilter.tsx     # pill toggle buttons for skill selection
    │
    └── lib/
        ├── graphql.ts          # GraphQLClient instance + gql query strings
        ├── types.ts            # Wave, Contributor, RewardPool interfaces
        └── hooks.ts            # useWaves(skills), useLeaderboard — SWR wrappers
```

---

## Data Layer — GraphQL & Indexer

### GraphQL Client Setup

The indexer client is a single `GraphQLClient` instance shared across all server-side route handlers. The endpoint is injected at build time from `INDEXER_URL`.

```ts
// src/lib/graphql.ts
import { GraphQLClient, gql } from "graphql-request";

export const indexerClient = new GraphQLClient(
  process.env.INDEXER_URL ?? "https://api.thegraph.com/subgraphs/name/drips/waves"
);
```

### Query: Active Waves

Fetches all waves where `status` is `"ACTIVE"`. The indexer updates this field automatically when a `WaveClosed` event is detected on-chain.

```graphql
query GetActiveWaves {
  waves(where: { status: "ACTIVE" }) {
    id
    ecosystem
    totalPointsAllocated
    rewardPool {
      amount
      tokenSymbol
    }
    endDate
  }
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `String` | On-chain wave ID (contract address or hash) |
| `ecosystem` | `String` | Chain name — `"Ethereum"`, `"Stellar"`, `"StarkNet"`, etc. |
| `totalPointsAllocated` | `Int` | Total points available in this wave cycle |
| `rewardPool.amount` | `String` | Token amount in the reward pool |
| `rewardPool.tokenSymbol` | `String` | Token ticker — `ETH`, `XLM`, `STRK`, `OP`, etc. |
| `endDate` | `String` | ISO 8601 timestamp when the wave closes |

### Query: Global Leaderboard

Fetches the top 50 contributors ordered by cumulative points, descending.

```graphql
query GetLeaderboard {
  contributors(orderBy: totalPoints, orderDirection: desc, first: 50) {
    id
    githubHandle
    totalPoints
    ecosystems
  }
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `String` | Contributor wallet address |
| `githubHandle` | `String` | Linked GitHub username |
| `totalPoints` | `Int` | Cumulative points across all waves and ecosystems |
| `ecosystems` | `[String]` | List of chains the contributor has been active on |

### Indexer Events

The subgraph (or Envoy node) maps the following on-chain events to the schema above:

```
WaveCreated(waveId, ecosystem, totalPoints, rewardToken, rewardAmount, endDate)
  → creates a Wave entity with status: "ACTIVE"

WaveClosed(waveId)
  → updates Wave entity status to "CLOSED"

PointsAwarded(waveId, contributor, githubHandle, points)
  → upserts Contributor entity, increments totalPoints
```

---

## API Routes

### `GET /api/waves`

**Query params**

| Param | Required | Example | Description |
|---|---|---|---|
| `skills` | No | `?skills=Rust,Cairo` | Comma-separated skill names to filter by |

**What it does**

1. Calls `GET_ACTIVE_WAVES` against the indexer GraphQL endpoint
2. Fans out a `fetch` call to `DRIPS_WAVE_API/:id` for every wave in parallel (`Promise.all`)
3. Merges `repoUrl` and `skills[]` from the REST response onto each wave object
4. If `?skills=` is present, filters to waves whose `skills[]` intersects the requested set
5. Returns the enriched, filtered array as JSON

```ts
// src/app/api/waves/route.ts
export async function GET(req: NextRequest) {
  const skills = req.nextUrl.searchParams.get("skills")?.split(",").filter(Boolean) ?? [];

  const { waves } = await indexerClient.request<{ waves: Wave[] }>(GET_ACTIVE_WAVES);

  const enriched = await Promise.all(
    waves.map(async (wave) => {
      try {
        const res = await fetch(`${process.env.DRIPS_WAVE_API}/${wave.id}`, {
          next: { revalidate: 60 },   // Next.js fetch cache — revalidate every 60s
        });
        if (!res.ok) return wave;
        const meta = await res.json();
        return { ...wave, repoUrl: meta.repoUrl, skills: meta.skills ?? [] };
      } catch {
        return wave;   // graceful degradation — show wave without metadata on error
      }
    })
  );

  const filtered =
    skills.length > 0
      ? enriched.filter((w) => w.skills?.some((s: string) => skills.includes(s)))
      : enriched;

  return NextResponse.json(filtered);
}
```

**Example response**

```json
[
  {
    "id": "0xabc123",
    "ecosystem": "Stellar",
    "totalPointsAllocated": 50000,
    "rewardPool": { "amount": "5000", "tokenSymbol": "XLM" },
    "endDate": "2026-05-15T00:00:00Z",
    "repoUrl": "https://github.com/stellar-org/some-repo",
    "skills": ["Rust", "TypeScript"]
  },
  {
    "id": "0xdef456",
    "ecosystem": "StarkNet",
    "totalPointsAllocated": 120000,
    "rewardPool": { "amount": "800", "tokenSymbol": "STRK" },
    "endDate": "2026-05-12T00:00:00Z",
    "repoUrl": "https://github.com/starkware/cairo-vm",
    "skills": ["Cairo", "Rust"]
  }
]
```

---

### `GET /api/leaderboard`

No query params. Returns the top 50 contributors sorted by `totalPoints` descending.

```ts
// src/app/api/leaderboard/route.ts
export async function GET() {
  const { contributors } = await indexerClient.request<{ contributors: Contributor[] }>(
    GET_LEADERBOARD
  );
  return NextResponse.json(contributors);
}
```

**Example response**

```json
[
  {
    "id": "0xaaa111",
    "githubHandle": "wavechampion",
    "totalPoints": 142000,
    "ecosystems": ["Ethereum", "Stellar"]
  },
  {
    "id": "0xbbb222",
    "githubHandle": "cairobuilder",
    "totalPoints": 98500,
    "ecosystems": ["StarkNet"]
  }
]
```

---

## Core Components

### `WaveCard`

Renders a single wave opportunity. Computes points-per-hour on the fly, displays the reward pool, skill badges, and a "Ride Wave" link.

```tsx
// src/components/WaveCard.tsx
export default function WaveCard({ wave }: { wave: Wave }) {
  const hoursLeft = Math.max(
    0,
    Math.round((new Date(wave.endDate).getTime() - Date.now()) / 3_600_000)
  );
  const pph = hoursLeft > 0 ? (wave.totalPointsAllocated / hoursLeft).toFixed(1) : "—";

  return (
    <article style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700 }}>{wave.ecosystem}</span>
        <span style={{ fontSize: 12, color: "#64748b" }}>{hoursLeft}h left</span>
      </header>

      <p>🏆 {wave.totalPointsAllocated.toLocaleString()} pts · {wave.rewardPool.amount} {wave.rewardPool.tokenSymbol}</p>
      <p style={{ color: "#0ea5e9" }}>~{pph} pts / hr</p>

      {wave.skills?.map((s) => <span key={s}>{s}</span>)}

      {wave.repoUrl && <a href={wave.repoUrl} target="_blank" rel="noopener noreferrer">Ride Wave →</a>}
    </article>
  );
}
```

### `WaveFeed`

Wraps a responsive CSS grid of `WaveCard` components. Handles loading and empty states.

```tsx
// src/components/WaveFeed.tsx
export default function WaveFeed({ waves, loading }: { waves: Wave[]; loading: boolean }) {
  if (loading) return <p>Loading waves…</p>;
  if (!waves.length) return <p>No active waves found.</p>;

  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      {waves.map((w) => <WaveCard key={w.id} wave={w} />)}
    </section>
  );
}
```

### `SkillFilter`

Pill-style toggle buttons. Clicking a skill adds or removes it from the active filter set, which is passed up to `useWaves(skills)` to re-fetch with the new `?skills=` param.

```tsx
// src/components/SkillFilter.tsx
const SKILLS = ["Rust", "Cairo", "React", "Solidity", "TypeScript", "Go", "Python"];

export default function SkillFilter({ selected, onChange }: Props) {
  const toggle = (skill: string) =>
    onChange(selected.includes(skill)
      ? selected.filter((s) => s !== skill)
      : [...selected, skill]
    );

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
      {SKILLS.map((skill) => (
        <button
          key={skill}
          onClick={() => toggle(skill)}
          style={{
            background: selected.includes(skill) ? "#6366f1" : "transparent",
            color: selected.includes(skill) ? "#fff" : "#374151",
            borderRadius: 20, border: "1px solid", padding: "4px 12px", cursor: "pointer",
          }}
        >
          {skill}
        </button>
      ))}
    </div>
  );
}
```

### `Leaderboard`

A sortable table of the top 50 contributors. Rank, GitHub handle, total points, and active ecosystems.

```tsx
// src/components/Leaderboard.tsx
export default function Leaderboard({ contributors, loading }: Props) {
  if (loading) return <p>Loading leaderboard…</p>;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead>
        <tr>
          <th>#</th><th>Contributor</th><th>Points</th><th>Ecosystems</th>
        </tr>
      </thead>
      <tbody>
        {contributors.map((c, i) => (
          <tr key={c.id}>
            <td>{i + 1}</td>
            <td>@{c.githubHandle}</td>
            <td>{c.totalPoints.toLocaleString()}</td>
            <td>{c.ecosystems.join(", ")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## TypeScript Types

All shared types live in `src/lib/types.ts`. The `Wave` interface is the central data shape — it starts as the raw indexer response and gets `repoUrl` and `skills` merged in by the API route.

```ts
// src/lib/types.ts
export interface RewardPool {
  amount: string;       // string to preserve decimal precision from the contract
  tokenSymbol: string;  // "ETH" | "XLM" | "STRK" | "OP" | ...
}

export interface Wave {
  id: string;
  ecosystem: string;
  totalPointsAllocated: number;
  rewardPool: RewardPool;
  endDate: string;              // ISO 8601
  // enriched by /api/waves from Drips Wave API:
  repoUrl?: string;
  skills?: string[];
}

export interface Contributor {
  id: string;           // wallet address
  githubHandle: string;
  totalPoints: number;
  ecosystems: string[];
}
```

---

## SWR Data Hooks

Both hooks live in `src/lib/hooks.ts`. They call the Next.js API routes (not the indexer directly), so the browser never needs to know the indexer URL.

```ts
// src/lib/hooks.ts
import useSWR from "swr";
import type { Wave, Contributor } from "./types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Re-fetches every 30 seconds. Changing `skills` triggers an immediate re-fetch
// because the SWR key (the URL) changes.
export function useWaves(skills: string[] = []) {
  const params = skills.length ? `?skills=${skills.join(",")}` : "";
  return useSWR<Wave[]>(`/api/waves${params}`, fetcher, { refreshInterval: 30_000 });
}

// Leaderboard changes less frequently — 60 second poll is sufficient.
export function useLeaderboard() {
  return useSWR<Contributor[]>("/api/leaderboard", fetcher, { refreshInterval: 60_000 });
}
```

**Why SWR?**
- Automatic deduplication — multiple components can call `useWaves()` and only one request fires
- Stale-while-revalidate — the UI never shows a blank state on re-fetch; old data stays visible until new data arrives
- Key-based re-fetch — changing the `skills` array changes the URL key, which immediately triggers a new fetch without any manual `useEffect`

---

## Points per Hour Algorithm

The "pts / hr" metric is the core signal of the feed. It answers: *"If I start this wave right now, how many points per hour is it worth?"*

```ts
// Computed inside WaveCard on every render (no server round-trip needed)
const MS_PER_HOUR = 3_600_000;

const hoursLeft = Math.max(
  0,
  Math.round((new Date(wave.endDate).getTime() - Date.now()) / MS_PER_HOUR)
);

// Guard against division by zero when a wave is in its final hour
const pointsPerHour =
  hoursLeft > 0
    ? (wave.totalPointsAllocated / hoursLeft).toFixed(1)
    : "—";
```

**Example scenarios**

| Wave | Points | Hours Left | pts/hr |
|---|---|---|---|
| Stellar Wave #12 | 50,000 | 100h | 500 |
| StarkNet Wave #7 | 120,000 | 48h | **2,500** ← better velocity |
| Ethereum Wave #3 | 200,000 | 500h | 400 |

Even though the Ethereum wave has the largest pool, the StarkNet wave offers 6× the reward velocity — a contributor with limited time should prioritize it.

---

## Setup & Configuration

### Prerequisites

- Node.js 18+
- A deployed Drips subgraph or Envoy indexer node (or use the public testnet endpoint)
- Access to the Drips Wave REST API

### 1. Clone the repository

```bash
git clone https://github.com/your-org/wave-finder.git
cd wave-finder
```

### 2. Install dependencies

```bash
npm install
```

All dependencies are pinned to exact versions to prevent unexpected breakage:

```json
{
  "dependencies": {
    "next": "14.2.3",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "graphql": "16.8.1",
    "graphql-request": "6.1.0",
    "swr": "2.2.5"
  }
}
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your actual endpoints (see [Environment Variables](#environment-variables) below).

### 4. Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The feed will show an empty state until the indexer URL is pointed at a live subgraph.

### 5. Build for production

```bash
npm run build
npm run start
```

---

## Environment Variables

| Variable | Required | Default (fallback) | Description |
|---|---|---|---|
| `INDEXER_URL` | Yes | `https://api.thegraph.com/subgraphs/name/drips/waves` | GraphQL endpoint of your deployed Subgraph or Envoy indexer node |
| `DRIPS_WAVE_API` | Yes | `https://api.drips.network/waves` | Base URL of the Drips Wave REST API. Each wave is fetched at `{DRIPS_WAVE_API}/{waveId}` |

Both variables are server-only (used in Route Handlers). They are never exposed to the browser bundle.

```env
# .env.local
INDEXER_URL=https://api.thegraph.com/subgraphs/name/your-org/drips-waves
DRIPS_WAVE_API=https://api.drips.network/waves
```

---

## Usage Walkthrough

### Browsing the Feed

1. Navigate to `/` — the Wave Finder feed loads automatically.
2. All active waves across all chains are shown as cards, sorted by the indexer's default order.
3. Each card shows: ecosystem name, hours remaining, total points, reward pool (amount + token), points-per-hour rate, required skills, and a "Ride Wave" link.
4. The feed silently re-fetches every 30 seconds. Waves that close on-chain disappear on the next poll.

### Filtering by Skill

1. Click one or more skill pills at the top of the feed (e.g., **Rust**, **Cairo**).
2. The feed immediately re-fetches with `?skills=Rust,Cairo` and shows only waves tagged with those skills.
3. Click a pill again to deselect it and widen the results.

### Checking the Leaderboard

1. Click **Leaderboard →** in the top-right corner of the feed page.
2. The table shows the top 50 contributors globally, ranked by total points.
3. The "Ecosystems" column shows which chains each contributor has been active on.
4. Click **← Feed** to return to the opportunity feed.

### Riding a Wave

1. Find a wave that matches your skills and has a high pts/hr rate.
2. Click **Ride Wave →** on the card.
3. You are taken directly to the repository's task list on the Drips platform.
4. Complete tasks to earn points before the wave's `endDate`.

---

## Extending the Project

### Add a new ecosystem

The indexer handles new chains automatically — deploy the subgraph mapping to the new network and update `INDEXER_URL` to point at the multi-chain endpoint. No frontend changes needed.

### Add GitHub OAuth

Install `next-auth` and add a `[...nextauth]/route.ts` handler. The "Ride Wave" link can then pass a signed session token to the Drips platform to pre-authenticate the contributor.

```bash
npm install next-auth@4.24.7
```

### Add sorting controls

Extend `useWaves` to accept a `sortBy` param and pass it to `/api/waves`:

```ts
export function useWaves(skills: string[] = [], sortBy = "pph") {
  const params = new URLSearchParams();
  if (skills.length) params.set("skills", skills.join(","));
  params.set("sortBy", sortBy);
  return useSWR<Wave[]>(`/api/waves?${params}`, fetcher, { refreshInterval: 30_000 });
}
```

### Add push notifications

Use the Web Push API or a service like Knock to notify contributors when a wave matching their saved skills goes live. Store skill preferences in a lightweight KV store (Vercel KV, Upstash Redis).

### Deploy to Vercel

```bash
npx vercel --prod
```

Set `INDEXER_URL` and `DRIPS_WAVE_API` as environment variables in the Vercel project dashboard.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components, Route Handlers, and built-in fetch caching in one package |
| Language | TypeScript (strict) | End-to-end type safety from GraphQL response to rendered component |
| GraphQL client | graphql-request 6 | Minimal, zero-dependency GraphQL client — no Apollo overhead needed |
| Data fetching | SWR 2 | Stale-while-revalidate polling with automatic deduplication and key-based re-fetch |
| Indexer | The Graph (Subgraph) or Envoy | Decentralized, real-time indexing of on-chain events with a GraphQL query interface |
| Styling | Inline styles | Zero runtime CSS dependency — swap for Tailwind CSS or CSS Modules as the project grows |

---

## Contributing

1. Fork the repository and create a branch: `git checkout -b feat/your-feature`
2. Make your changes and verify locally: `npm run dev`
3. Run the build to catch type errors: `npm run build`
4. Open a pull request with:
   - A clear title (under 70 characters)
   - A description of what changed and why
   - Any environment variable changes noted

Please keep PRs focused. One feature or fix per PR makes review faster.

---

## License

MIT — see [LICENSE](./LICENSE) for details.
