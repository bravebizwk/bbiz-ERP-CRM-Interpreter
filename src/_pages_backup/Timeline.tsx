
// 13個のタイムラインデータ例
const timelineData = [
    { id: 1, color: 'yellow', time: '14 min ago · ongoing', title: '1-Queue worker degraded', desc: 'eu-west-1 latency spike, mitigated via autoscale.' },
    { id: 2, color: 'green', time: '2 hours ago · resolved', title: '2-Database failover completed', desc: 'Replica promoted; primary recovered in 4m12s.' },
    { id: 3, color: 'red', time: 'Yesterday · resolved', title: '3-Auth outage — 3 minutes', desc: '4xx spike on /login. Cause: stale JWT signing key.' },
    { id: 4, color: 'green', time: '2 days ago · resolved', title: '4+SSL cert renewed', desc: 'gentelella.io · auto-renewed via ACM.' },
    { id: 5, color: 'blue', time: '3 days ago · info', title: '5-API Gateway deploy', desc: 'v2.4.0 deployed to production cleanly.' },
    { id: 6, color: 'yellow', time: '4 days ago · resolved', title: '6-Cache memory high', desc: 'Redis memory hit 85%, evicted stale keys.' },
    { id: 7, color: 'green', time: '5 days ago · resolved', title: '7-CDN Edge updated', desc: 'Updated ruleset for static asset compression.' },
    { id: 8, color: 'primary', time: '6 days ago · resolved', title: '8-Scheduled Maintenance', desc: 'Database index rebuild completed in off-peak.' },
    { id: 9, color: 'red', time: '1 week ago · resolved', title: '9-DNS Resolution Lag', desc: 'Upstream Provider outage impacted 0.02% requests.' },
    { id: 10, color: 'green', time: '8 days ago · resolved', title: '10-Billing API Sync', desc: 'Stripe webhook listener backlog cleared.' },
    { id: 11, color: 'blue', time: '9 days ago · info', title: '11-Security Scan Completed', desc: 'Zero critical vulnerabilities detected.' },
    { id: 12, color: 'green', time: '10 days ago · resolved', title: '12-S3 Storage Migration', desc: 'Archived legacy logs to Glacier Deep Archive.' },
    { id: 13, color: 'primary', time: '12 days ago · resolved', title: 'AR-System Init & Upgrade', desc: 'Core cluster updated to OS kernel 6.1.' }
];

const Timeline = () => {
    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">Incident timeline</div>
            </div>
            <div className="card-body">
                {/* 横スクロール可能なコンテナ */}
                <div className="timeline-horizontal-wrapper">
                    <div className="timeline-horizontal">
                        {timelineData.map((item) => (
                            <div key={item.id} className={`timeline-item is-${item.color}`}>
                                
                                <div className="ti-time">{item.time}</div>
                                <div className="ti-title">{item.title}</div>
                                <div className="ti-desc">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;