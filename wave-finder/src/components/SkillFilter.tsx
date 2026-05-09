const SKILLS = ["Rust", "Cairo", "React", "Solidity", "TypeScript", "Go", "Python"];

interface Props {
  selected: string[];
  onChange: (skills: string[]) => void;
}

export default function SkillFilter({ selected, onChange }: Props) {
  const toggle = (skill: string) =>
    onChange(
      selected.includes(skill) ? selected.filter((s) => s !== skill) : [...selected, skill]
    );

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
      {SKILLS.map((skill) => (
        <button
          key={skill}
          onClick={() => toggle(skill)}
          style={{
            padding: "4px 12px",
            borderRadius: 20,
            border: "1px solid",
            cursor: "pointer",
            fontSize: 13,
            background: selected.includes(skill) ? "#6366f1" : "transparent",
            color: selected.includes(skill) ? "#fff" : "#374151",
            borderColor: selected.includes(skill) ? "#6366f1" : "#d1d5db",
          }}
        >
          {skill}
        </button>
      ))}
    </div>
  );
}
