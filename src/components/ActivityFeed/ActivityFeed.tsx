'use client';

// src/scripts/components/ActivityFeed/ActivityFeed.jsx
import { useState, useEffect } from "react";

interface ActivityItem {
  id: number | string;
  user_name?: string;
  action: string;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Node.js API からアクティビティ一覧を取得
    fetch("/api/activities")
      .then((res) => res.json())
      .then((data: ActivityItem[]) => {
        setActivities(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("ActivityFeed API Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="card">
      <h2>Recent Activity</h2>

      {loading ? (
        <p style={{ color: "#888", padding: "10px 0" }}>読み込み中...</p>
      ) : (
        <ul className="activity-list">
          {activities.map((item) => (
            <li key={item.id}>
              {/* user_name と action を組み合わせて表示 */}
              {item.user_name ? `${item.user_name} : ${item.action}` : item.action}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
