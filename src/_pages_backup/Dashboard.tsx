import StatsCard from "@/components/StatsCard/StatsCard";
import { statsData } from "@/components/StatsCard/statsData";
import RevenueChart from "@/components/RevenueChart/RevenueChart";
import ActivityFeed from "@/components/ActivityFeed/ActivityFeed";

export default function Dashboard() {
  return (
    <div className="dashboard-page">

      {/* Header */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Dashboard Sample</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statsData.map((item) => (
          <StatsCard
            key={item.id}
            title={item.title}
            value={item.value}
            change={item.change}
            trend={item.trend}
          />
        ))}
      </div>

      {/* Revenue + Activity */}
      <div className="chart-section">

        <RevenueChart />

        <ActivityFeed />

      </div>

    </div>
  );
}