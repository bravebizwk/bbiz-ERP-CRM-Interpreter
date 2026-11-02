import React, { useState, useEffect } from 'react';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products')
            .then((res) => res.json())
            .then((data) => {
                setProducts(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Products API Fetch Error:', err);
                setLoading(false);
            });
    }, []);

    // ステータスに応じたバッジの配色
    const getStatusStyle = (status) => {
        switch (status) {
            case '販売中':
                return { backgroundColor: '#e6f4ea', color: '#4d86b9' };
            case '残りわずか':
                return { backgroundColor: '#fef7e0', color: '#5474a0' };
            case '在庫切れ':
                return { backgroundColor: '#fce8e6', color: '#7e238c' };
            default:
                return { backgroundColor: '#f1f3f4', color: '#3c4043' };
        }
    };

    return (
        <div className="card" style={{ padding: '24px' }}>
            <h1 style={{ marginBottom: '16px', fontSize: '24px' }}>Products</h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>商品・サービス一覧（SQLite API連携）</p>

            {loading ? (
                <p style={{ color: '#888' }}>読み込み中...</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', color: '#555' }}>
                                <th style={{ padding: '12px 8px' }}>商品コード</th>
                                <th style={{ padding: '12px 8px' }}>商品・サービス名</th>
                                <th style={{ padding: '12px 8px' }}>カテゴリー</th>
                                <th style={{ padding: '12px 8px' }}>価格</th>
                                <th style={{ padding: '12px 8px' }}>在庫数</th>
                                <th style={{ padding: '12px 8px' }}>ステータス</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{product.id}</td>
                                    <td style={{ padding: '12px 8px' }}>{product.name}</td>
                                    <td style={{ padding: '12px 8px' }}>{product.category}</td>
                                    <td style={{ padding: '12px 8px' }}>HKD{product.price.toLocaleString()}</td>
                                    <td style={{ padding: '12px 8px' }}>{product.stock}</td>
                                    <td style={{ padding: '12px 8px' }}>
                                        <span
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                ...getStatusStyle(product.status)
                                            }}
                                        >
                                            {product.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
