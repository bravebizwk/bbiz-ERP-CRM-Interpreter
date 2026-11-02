interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export default function StatsCard({
  title,
  value,
  change,
  trend,
}: StatsCardProps) {
  return (
    <div className="stats-card">

      <div className="stats-card-title">
        {title}
      </div>

      <div className="stats-card-value">
        {value}
      </div>

      <div
        className={`stats-card-change ${
          trend === "up"
            ? "positive"
            : "negative"
        }`}
      >
        {change}
      </div>

    </div>
  );
}