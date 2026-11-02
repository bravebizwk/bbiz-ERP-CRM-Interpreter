import React, { useState, useEffect, useRef } from "react";

export default function CustomerFinancialTable() {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [monthlyPayments, setMonthlyPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    // ★ 表示期間フィルター ("ThisYear" | "7years" | "ALLYear")
    const [yearFilter, setYearFilter] = useState("ThisYear");

    const containerRef = useRef(null);

    // 顧客ID取得ヘルパー
    const getCustomerId = (customer) => {
        if (!customer) return null;
        return customer.id ?? customer.customer_id ?? customer.customer_code ?? customer.code ?? null;
    };

    // 1. 初回レンダリング：顧客リスト取得
    useEffect(() => {
        fetch("/api/customers")
            .then((res) => res.json())
            .then((data) => setCustomers(data))
            .catch((err) => console.error("顧客リストの取得エラー:", err));
    }, []);

    // 2. 枠外クリック検知
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 3. 顧客選択時に monthly_payments 取得
    useEffect(() => {
        const customerId = getCustomerId(selectedCustomer);

        if (!customerId) {
            setMonthlyPayments([]);
            return;
        }

        setLoading(true);
        fetch(`/api/monthly-payments?id=${customerId}&customerId=${customerId}`)
            .then((res) => res.json())
            .then((data) => {
                setMonthlyPayments(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("monthly_payments の取得エラー:", err);
                setMonthlyPayments([]);
                setLoading(false);
            });
    }, [selectedCustomer]);

    // 候補絞り込み
    const filteredCustomers = customers.filter((c) =>
        (c.customer_name || c.name || "").toLowerCase().includes(inputValue.toLowerCase())
    );

    const handleSelectCustomer = (customer) => {
        if (customer) {
            setSelectedCustomer(customer);
            setInputValue(customer.customer_name || customer.name || "");
        } else {
            setSelectedCustomer(null);
            setInputValue("");
        }
        setIsOpen(false);
    };

    // 決算日の翌月からの12ヶ月配列を計算
    const getFiscalMonths = (fiscalYearEnd) => {
        if (!fiscalYearEnd) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const parts = fiscalYearEnd.split("-");
        const fiscalMonth = parseInt(parts.length >= 2 ? parts[1] : parts[0], 10);
        if (isNaN(fiscalMonth)) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        const calculatedMonths = [];
        for (let i = 1; i <= 12; i++) {
            let m = (fiscalMonth + i) % 12;
            calculatedMonths.push(m === 0 ? 12 : m);
        }
        return calculatedMonths;
    };

    const fiscalMonths = getFiscalMonths(selectedCustomer?.fiscal_year_end);

    // ★ 1. 全「年」を抽出しソート（順番をここへ固定）
    const allYears = [
        ...new Set(
            monthlyPayments
                .map((p) => p.year ?? p.fiscal_year)
                .filter(Boolean)
        )
    ].sort((a, b) => b - a);

    // ★ 2. 選択された期間（yearFilter）に応じて表示年を絞り込む
    const filteredYears = allYears.filter((year) => {
        const currentYear = 2026; // 最新データの2026年を今年と定義
        const y = Number(year);

        if (yearFilter === "ThisYear") {
            return y === currentYear;
        } else if (yearFilter === "7years") {
            return y >= currentYear - 6 && y <= currentYear; // 2020年〜2026年
        }
        return true; // "ALLYear"
    });

    // 指定年・月のステータス取得
    const getStatusForMonth = (year, month) => {
        const record = monthlyPayments.find(
            (p) =>
                Number(p.year ?? p.fiscal_year) === Number(year) &&
                Number(p.month) === Number(month)
        );
        return record ? record.status : "-";
    };

    // 年間の OK 件数（AR）を集計
    const getAnnualOkCount = (year) => {
        return monthlyPayments.filter(
            (p) =>
                Number(p.year ?? p.fiscal_year) === Number(year) &&
                p.status === "OK"
        ).length;
    };

    // バッジ表示
    const renderStatusBadge = (status) => {
        if (!status || status === "-") return <span style={{ color: "#888" }}>-</span>;
        let badgeClass = "bg-secondary";
        if (status === "OK") badgeClass = "bg-success";
        else if (status === "NotYet" || status === "未") badgeClass = "bg-warning text-dark";
        else if (status === "NG" || status === "遅延") badgeClass = "bg-danger";

        return <span className={`badge ${badgeClass}`}>{status}</span>;
    };

    return (
        <div className="card mb-4 shadow-sm">
            <div className="card-horizontal">

                {/* フィルタバーエリア */}    
                <div className="stats-card">
                    <div
                        className="orders-select-filter-bar-vertual"
                        ref={containerRef}
                        style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}
                    >
                        {/* 1. 会社名入力選択 */}
                 
                        <div>
                            <h2>会社名選択:</h2>
                            <div style={{ position: "relative", width: "320px" }}>
                                <input
                                    type="text"
                                    placeholder="会社名を入力・選択..."
                                    value={inputValue}
                                    style={{ width: "100%" }}
                                    onChange={(e) => {
                                        setInputValue(e.target.value);
                                        setIsOpen(true);
                                        if (e.target.value === "") {
                                            setSelectedCustomer(null);
                                        }
                                    }}
                                    onFocus={() => setIsOpen(true)}
                                />

                                {isOpen && (
                                    <ul className="dropdown-list">
                                        <li
                                            key="clear-option"
                                            className="clear-option"
                                            onClick={() => handleSelectCustomer(null)}
                                        >
                                            会社名（選択解除）
                                        </li>

                                        {filteredCustomers.length > 0 ? (
                                            filteredCustomers.map((c, index) => {
                                                const cid = getCustomerId(c);
                                                return (
                                                    <li
                                                        key={cid ?? `cust-${index}`}
                                                        onClick={() => handleSelectCustomer(c)}
                                                    >
                                                        {c.customer_name || c.name}
                                                    </li>
                                                );
                                            })
                                        ) : (
                                            <li key="no-data" style={{ cursor: "default", opacity: 0.6 }}>
                                                該当する会社がありません
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. 表示期間切替セレクトボックス */}
                <div className="stats-card">
                    <div className="year-filter-display">
                        <h2>表示期間選択:</h2>
                        <div style={{ position: "relative", width: "160px" }}>
                            <select
                                className="form-select"
                                style={{ width: "100%" }}
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                            >
                                <option value="ThisYear">今年 (ThisYear)</option>
                                <option value="7years">過去7年 (7years)</option>
                                <option value="ALLYear">全期間 (ALLYear)</option>
                            </select>
                        </div>
                    </div>
                </div>


                        {/* 4. 決算日表示 */}
                    <div className="stats-card">
                        <div className="d-flex flex-column align-items-start">
                            <h2>決算日:</h2>
                            <h3 className="badge bg-primary fs-6 px-3 py-2">
                                {selectedCustomer?.fiscal_year_end || "未設定"}
                            </h3>
                        </div>
                    </div>
               
                
            </div>

            {/* テーブルエリア */}
            <div className="card-body">
                <h3>
                    月次支払ステータス一覧
                    <span className="ms-2 fs-6 text-muted">
                        ({yearFilter === "ThisYear" ? "2026年" : yearFilter === "7years" ? "2020年〜2026年" : "全期間"})
                    </span>
                </h3>

                {loading ? (
                    <p>データを読み込み中...</p>
                ) : !selectedCustomer ? (
                    <h3>会社を選択すると月次ステータスが表示されます。</h3>
                ) : filteredYears.length === 0 ? (
                    <h3>指定された期間の月次データが存在しません。</h3>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered text-center align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ minWidth: "80px" }}>年度</th>
                                    {fiscalMonths.map((m) => (
                                        <th key={m}>{m}月</th>
                                    ))}
                                    <th style={{ minWidth: "70px" }} className="table-primary">AR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredYears.map((year) => {
                                    const arCount = getAnnualOkCount(year);

                                    return (
                                        <tr key={year}>
                                            <td className="fw-bold">{year}年</td>
                                            {fiscalMonths.map((m) => {
                                                const status = getStatusForMonth(year, m);
                                                return (
                                                    <td key={`${year}-${m}`}>
                                                        {renderStatusBadge(status)}
                                                    </td>
                                                );
                                            })}
                                            <td className="fw-bold bg-light">
                                                <span className="badge bg-info text-dark fs-6">
                                                    {arCount}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
