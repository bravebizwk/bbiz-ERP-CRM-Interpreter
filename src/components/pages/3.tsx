'use client';

import React, { useState, useEffect, useRef } from "react";

interface Customer {
    id?: number;
    customer_id?: number;
    customer_code?: number;
    code?: number;
    customer_name?: string;
    name?: string;
    fiscal_year_end?: string;
}

interface MonthlyPayment {
    year?: number;
    fiscal_year?: number;
    month?: number;
    status?: string;
}

export default function CustomerFinancialTable() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [monthlyPayments, setMonthlyPayments] = useState<MonthlyPayment[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 顧客IDを取得するヘルパー関数
    const getCustomerId = (customer: Customer | null): number | null => {
        if (!customer) return null;
        return customer.id ?? customer.customer_id ?? customer.customer_code ?? customer.code ?? null;
    };

    // 決算日（fiscal_year_end: "YYYY-MM-DD" や "MM-DD"）から「翌月〜12ヶ月分」の月配列を計算
    const getFiscalMonths = (fiscalYearEnd?: string): number[] => {
        if (!fiscalYearEnd) {
            return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        }
        const parts = fiscalYearEnd.split("-");
        const fiscalMonth = parseInt(parts.length >= 2 ? parts[1] : parts[0], 10);

        if (isNaN(fiscalMonth)) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        const calculatedMonths: number[] = [];
        for (let i = 1; i <= 12; i++) {
            let m = (fiscalMonth + i) % 12;
            calculatedMonths.push(m === 0 ? 12 : m);
        }
        return calculatedMonths;
    };

    // 選択された顧客の決算期月に応じた12ヶ月配列
    const fiscalMonths = getFiscalMonths(selectedCustomer?.fiscal_year_end);

    // 1. 初回レンダリング：顧客リスト取得
    useEffect(() => {
        fetch("/api/customers")
            .then((res) => res.json())
            .then((data: Customer[]) => setCustomers(data))
            .catch((err) => console.error("顧客リストの取得エラー:", err));
    }, []);

    // 2. 枠外クリック検知
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
            .then((data: MonthlyPayment[]) => {
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

    const handleSelectCustomer = (customer: Customer | null) => {
        if (customer) {
            setSelectedCustomer(customer);
            setInputValue(customer.customer_name || customer.name || "");
        } else {
            setSelectedCustomer(null);
            setInputValue("");
        }
        setIsOpen(false);
    };

    // 存在する全「年」を抽出
    const years = [
        ...new Set(
            monthlyPayments
                .map((p) => p.year ?? p.fiscal_year)
                .filter((y): y is number => y !== undefined && y !== null)
        )
    ].sort((a, b) => b - a);

    // 指定した年・月のステータスを取得
    const getStatusForMonth = (year: number, month: number): string => {
        const record = monthlyPayments.find(
            (p) =>
                Number(p.year ?? p.fiscal_year) === Number(year) &&
                Number(p.month) === Number(month)
        );
        return record?.status ? record.status : "-";
    };

    // バッジ表示
    const renderStatusBadge = (status?: string) => {
        if (!status || status === "-") {
            return <span style={{ color: "#888" }}>-</span>;
        }

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
                    <div className="orders-select-filter-bar" ref={containerRef}>
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

                {/* 会社番号（ID）表示部分 */}
                <div className="stats-card">
                    <div className="company-id-display">
                        <h2>会社番号 (ID):</h2>
                        <h3>
                            {selectedCustomer ? (getCustomerId(selectedCustomer) ?? "未選択") : "未選択"}
                        </h3>
                    </div>
                </div>

                {/* 決算日表示部分 */}
                <div className="stats-card">
                    <div className="stats-card-title">決算日:</div>
                    <h3>
                        {selectedCustomer?.fiscal_year_end || "未設定"}
                    </h3>
                </div>
            </div>

            {/* テーブルエリア */}
            <div className="card">
                <h3 className="stats-card-title">月次支払ステータス一覧</h3>

                {loading ? (
                    <p>データを読み込み中...</p>
                ) : !selectedCustomer ? (
                    <p className="stats-card-title">会社を選択すると月次ステータスが表示されます。</p>
                ) : years.length === 0 ? (
                    <p className="stats-card-title">該当する月次データが存在しません。</p>
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
                                {years.map((year) => (
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
                                        <td>-</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
