import type { Wave } from "@/lib/types";
import WaveCard from "./WaveCard";

interface Props {
  waves: Wave[];
  loading: boolean;
}

export default function WaveFeed({ waves, loading }: Props) {
  if (loading) return <p>Loading waves…</p>;
  if (!waves.length) return <p>No active waves found.</p>;

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16,
      }}
    >
      {waves.map((w) => (
        <WaveCard key={w.id} wave={w} />
      ))}
    </section>
  );
}
