import type { Contributor } from "@/lib/types";

interface Props {
  contributors: Contributor[];
  loading: boolean;
}

export default function Leaderboard({ contributors, loading }: Props) {
  if (loading) return <p>Loading leaderboard…</p>;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
          <th style={{ padding: "8px 4px" }}>#</th>
          <th style={{ padding: "8px 4px" }}>Contributor</th>
          <th style={{ padding: "8px 4px" }}>Points</th>
          <th style={{ padding: "8px 4px" }}>Ecosystems</th>
        </tr>
      </thead>
      <tbody>
        {contributors.map((c, i) => (
          <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
            <td style={{ padding: "8px 4px", color: "#94a3b8" }}>{i + 1}</td>
            <td style={{ padding: "8px 4px", fontWeight: 600 }}>@{c.githubHandle}</td>
            <td style={{ padding: "8px 4px" }}>{c.totalPoints.toLocaleString()}</td>
            <td style={{ padding: "8px 4px", color: "#64748b" }}>{c.ecosystems.join(", ")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
