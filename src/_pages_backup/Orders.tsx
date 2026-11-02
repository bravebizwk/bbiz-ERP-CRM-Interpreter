import React, { useState, useMemo, useEffect } from 'react';


export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/orders')
            .then((res) => res.json())
            .then((data) => {
                setOrders(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Orders API Fetch Error:', err);
                setLoading(false);
            });
    }, []);

    // ステータスに応じたバッジの色指定
    const getStatusStyle = (status) => {
        switch (status) {
            case '完了':
                return { backgroundColor: '#e6f4ea', color: '#137333' };
            case '保留':
                return { backgroundColor: '#fef7e0', color: '#b06000' };
            case 'キャンセル':
                return { backgroundColor: '#fce8e6', color: '#c5221f' };
            default:
                return { backgroundColor: '#f1f3f4', color: '#3c4043' };
        }
    };
    const [customerFilter, setCustomerFilter] = useState("");
    const [productFilter, setProductFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [monthFilter, setMonthFilter] = useState("");

    const filteredOrders = orders.filter((order) => {

        const year =
            order.date.split("-")[0];

        const month =
            order.date.split("-")[1];

        return (
            (customerFilter === "" ||
                order.customer === customerFilter)

            &&

            (productFilter === "" ||
                order.product === productFilter)

            &&

            (statusFilter === "" ||
                order.status === statusFilter)

            &&

            (yearFilter === "" ||
                year === yearFilter)

            &&

            (monthFilter === "" ||
                month === monthFilter)
        );
    });

    // 1. テーブルで描画しているフィルター済み配列（名前は実際のコードに合わせてください）
    // customerFilter が変わったときに確実に再計算させる定義
    // フィルター（顧客・年・月・ステータス）に連動した合計金額の計算
    const filteredTotalAmount = useMemo(() => {
        const filtered = orders.filter((o) => {
            // 1. 顧客名フィルター
            const matchCustomer = customerFilter ? o.customer === customerFilter : true;

            // 2. 年フィルター (o.date: "2026-12-27")
            const matchYear = yearFilter ? o.date?.startsWith(String(yearFilter)) : true;

            // 3. 月フィルター (1桁月を "05" 形式に補正して判定)
            const formattedMonth = monthFilter ? String(monthFilter).padStart(2, '0') : '';
            const matchMonth = monthFilter ? o.date?.includes(`-${formattedMonth}-`) : true;

            // 4. ステータスフィルター (o.status: "完了" など)
            const matchStatus = statusFilter ? o.status === statusFilter : true;

            // すべての条件を満たすデータのみ抽出
            return matchCustomer && matchYear && matchMonth && matchStatus;
        });

        // 絞り込まれたデータの金額（amount）を合計
        return filtered.reduce((sum, order) => sum + (Number(order.amount) || 0), 0);

        // 依存配列にすべてのフィルター条件を指定（状態更新時に自動再計算）
    }, [orders, customerFilter, yearFilter, monthFilter, statusFilter]);




    return (
        <div className="card" >
            <div className="card-order-header">
                {/* タイトルと説明文エリア */}
                <div className="card-order-header-title">
                    <h1 style={{ marginBottom: '8px', fontSize: '24px' }}>Orders</h1>
                    <p style={{ color: '#666', margin: 0 }}>注文履歴一覧（SQLite API連携）</p>
                </div>

                {/* タイトルの横に配置する合計金額カード */}
                <div className="card-order-header-summary">
                    <div className="summary-card">
                        <span className="summary-card-label">表示中 合計金額</span>
                        <div className="summary-card-value">
                            ¥{filteredTotalAmount.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
           
           
            <div className="orders-select-filter-bar-vertual">

                <select
                    value={customerFilter}
                    onChange={(e) =>
                        setCustomerFilter(e.target.value)
                    }
                >
                    <option value="">
                        顧客名（全て）
                    </option>

                    {[...new Set(
                        orders.map((o) => o.customer)
                    )].map((customer) => (
                        <option
                            key={customer}
                            value={customer}
                        >
                            {customer}
                        </option>
                    ))}
                </select>

                <select
                    value={productFilter}
                    onChange={(e) =>
                        setProductFilter(e.target.value)
                    }
                >
                    <option value="">
                        商品名（全て）
                    </option>

                    {[...new Set(
                        orders.map((o) => o.product)
                    )].map((product) => (
                        <option
                            key={product}
                            value={product}
                        >
                            {product}
                        </option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                >
                    <option value="">
                        ステータス（全て）
                    </option>

                    <option value="完了">
                        完了
                    </option>

                    <option value="保留">
                        保留
                    </option>

                    <option value="キャンセル">
                        キャンセル
                    </option>
                </select>

                <select
                    value={yearFilter}
                    onChange={(e) =>
                        setYearFilter(e.target.value)
                    }
                >
                    <option value="">
                        年（全て）
                    </option>

                    <option value="2026">
                        2026
                    </option>
                </select>

                <select
                    value={monthFilter}
                    onChange={(e) =>
                        setMonthFilter(e.target.value)
                    }
                >
                    <option value="">
                        月（全て）
                    </option>

                    {Array.from(
                        { length: 12 },
                        (_, i) => (
                            <option
                                key={i + 1}
                                value={String(i + 1)
                                    .padStart(2, "0")}
                            >
                                {i + 1}月
                            </option>
                        )
                    )}
                </select>

            </div>

            {loading ? (
                <p style={{ color: '#888' }}>読み込み中...</p>
            ) : (

                
                
                    <div className="orders-select-filter-bar-vertual"  style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', color: '#555' }}>
                                <th style={{ padding: '12px 8px' }}>注文ID</th>
                                <th style={{ padding: '12px 8px' }}>顧客名</th>
                                <th style={{ padding: '12px 8px' }}>商品名</th>
                                <th style={{ padding: '12px 8px' }}>金額</th>
                                <th style={{ padding: '12px 8px' }}>ステータス</th>
                                <th style={{ padding: '12px 8px' }}>日付</th>
                            </tr>
                        </thead>
                        <tbody>
                                {filteredOrders.map((order) => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{order.id}</td>
                                    <td style={{ padding: '12px 8px' }}>{order.customer}</td>
                                    <td style={{ padding: '12px 8px' }}>{order.product}</td>
                                    <td style={{ padding: '12px 8px' }}>¥{order.amount.toLocaleString()}</td>
                                    <td style={{ padding: '12px 8px' }}>
                                        <span
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                ...getStatusStyle(order.status)
                                            }}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 8px', color: '#beb9b9' }}>{order.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

