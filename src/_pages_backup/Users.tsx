import React, { useState, useEffect } from 'react';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/users')
            .then((res) => res.json())
            .then((data) => {
                setUsers(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Users API Fetch Error:', err);
                setLoading(false);
            });
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'アクティブ':
                return { backgroundColor: '#e6f4ea', color: '#137333' };
            case '停止中':
                return { backgroundColor: '#fce8e6', color: '#c5221f' };
            default:
                return { backgroundColor: '#f1f3f4', color: '#3c4043' };
        }
    };

    return (
        <div className="card" style={{ padding: '24px' }}>
            <h1 style={{ marginBottom: '16px', fontSize: '24px' }}>Users</h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>ユーザー一覧（SQLite API連携）</p>

            {loading ? (
                <p style={{ color: '#888' }}>読み込み中...</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', color: '#555' }}>
                                <th style={{ padding: '12px 8px' }}>ID</th>
                                <th style={{ padding: '12px 8px' }}>名前</th>
                                <th style={{ padding: '12px 8px' }}>メールアドレス</th>
                                <th style={{ padding: '12px 8px' }}>権限</th>
                                <th style={{ padding: '12px 8px' }}>ステータス</th>
                                <th style={{ padding: '12px 8px' }}>登録日</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{user.id}</td>
                                    <td style={{ padding: '12px 8px' }}>{user.name}</td>
                                    <td style={{ padding: '12px 8px' }}>{user.email}</td>
                                    <td style={{ padding: '12px 8px' }}>{user.role}</td>
                                    <td style={{ padding: '12px 8px' }}>
                                        <span
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                ...getStatusStyle(user.status)
                                            }}
                                        >
                                            {user.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 8px', color: '#666' }}>{user.joined_date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

