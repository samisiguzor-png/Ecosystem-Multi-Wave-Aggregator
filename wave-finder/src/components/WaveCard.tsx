import type { Wave } from "@/lib/types";

interface Props {
  wave: Wave;
}

export default function WaveCard({ wave }: Props) {
  const hoursLeft = Math.max(
    0,
    Math.round((new Date(wave.endDate).getTime() - Date.now()) / 3_600_000)
  );
  const pph =
    hoursLeft > 0 ? (wave.totalPointsAllocated / hoursLeft).toFixed(1) : "—";

  return (
    <article style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700 }}>{wave.ecosystem}</span>
        <span style={{ fontSize: 12, color: "#64748b" }}>{hoursLeft}h left</span>
      </header>

      <p style={{ margin: "8px 0", fontSize: 14 }}>
        🏆 {wave.totalPointsAllocated.toLocaleString()} pts &nbsp;·&nbsp;
        {wave.rewardPool.amount} {wave.rewardPool.tokenSymbol}
      </p>

      <p style={{ margin: "4px 0", fontSize: 13, color: "#0ea5e9" }}>
        ~{pph} pts / hr
      </p>

      {wave.skills && wave.skills.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
          {wave.skills.map((s) => (
            <span
              key={s}
              style={{
                background: "#f1f5f9",
                borderRadius: 4,
                padding: "2px 6px",
                fontSize: 11,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {wave.repoUrl && (
        <a
          href={wave.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-block", marginTop: 12, fontSize: 13, color: "#6366f1" }}
        >
          Ride Wave →
        </a>
      )}
    </article>
  );
}
