import clsx from "clsx";

interface ScoreBadgeProps {
  score: number;
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  let status: "strong" | "good-start" | "needs-work" = "needs-work";
  let label = "Needs Work";

  if (score > 70) {
    status = "strong";
    label = "Strong";
  } else if (score > 49) {
    status = "good-start";
    label = "Good Start";
  }

  return (
    <div
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-badge-green text-green-600": status === "strong",
          "bg-badge-yellow text-yellow-600": status === "good-start",
          "bg-badge-red text-red-600": status === "needs-work",
        }
      )}
    >
      <p>{label}</p>
    </div>
  );
}
