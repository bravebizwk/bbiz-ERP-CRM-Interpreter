'use client';
import React, { useState, useEffect } from "react";

export default function PaymentDashboard() {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentData, setPaymentData] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. 初回レンダリング時に顧客一覧（決算日含む）を取得
    useEffect(() => {
        fetch("/api/customers")
            .then((res) => res.json())
            .then((data) => {
                setCustomers(data);
                if (data.length > 0) {
                    setSelectedCustomerId(data[0].customer_id);
                }
            })
            .catch((err) => console.error("顧客データの取得に失敗しました:", err));
    }, []);

    // 2. 選択された顧客オブジェクトの特定と該当顧客の全期間データの取得
    useEffect(() => {
        if (!selectedCustomerId) return;

        const currentCust = customers.find(
            (c) => String(c.customer_id) === String(selectedCustomerId)
        );
        setSelectedCustomer(currentCust || null);

        setLoading(true);
        fetch(`/api/payments?customerId=${selectedCustomerId}`)
            .then((res) => res.json())
            .then((data) => {
                setPaymentData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("支払いデータの取得に失敗:", err);
                setLoading(false);
            });
    }, [selectedCustomerId, customers]);

    const getFiscalMonths = (fiscalYearEnd) => {
        if (!fiscalYearEnd) {
            return Array.from({ length: 12 }, (_, i) => i + 1);
        }
        const fiscalMonth = parseInt(fiscalYearEnd.split("-")[1], 10);
        const months = [];
        for (let i = 1; i <= 12; i++) {
            let m = (fiscalMonth + i) % 12;
            months.push(m === 0 ? 12 : m);
        }
        return months;
    };

    const fiscalMonths = getFiscalMonths(selectedCustomer?.fiscal_year_end);
    const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

    // ステータスとURLを同時に取得するヘルパー関数
    const getPaymentItem = (year, month) => {
        const item = paymentData.find((p) => p.year === year && p.month === month);
        return {
            status: item ? item.status : "NotYet",
            url: item && item.url ? item.url : "#"
        };
    };

    const getAnnualOkCount = (year) => {
        return paymentData.filter((p) => p.year === year && p.status === "OK").length;
    };

    return (
        <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: "450px" }}>
                    <label className="form-label text-nowrap m-0 fw-bold">顧客選択:</label>
                    <select
                        className="form-select form-select-sm"
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                    >
                        {customers.map((c) => (
                            <option key={c.customer_id} value={c.customer_id}>
                                {c.customer_name} ({c.customer_code})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small">決算日:</span>
                    <span className="badge bg-primary fs-6">
                        {selectedCustomer?.fiscal_year_end || "未設定"}
                    </span>
                </div>
            </div>

            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle text-center mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: "90px" }}>年度</th>
                                {fiscalMonths.map((m) => (
                                    <th key={m} style={{ minWidth: "60px" }}>
                                        {m}月
                                    </th>
                                ))}
                                <th className="bg-secondary text-white" style={{ minWidth: "110px" }}>
                                    AnnualReturn
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="14" className="py-4 text-center">
                                        読み込み中...
                                    </td>
                                </tr>
                            ) : (
                                years.map((year) => {
                                    const okCount = getAnnualOkCount(year);
                                    return (
                                        <tr key={year}>
                                            <td className="fw-bold">{year}年</td>
                                            {fiscalMonths.map((month) => {
                                                const { status, url } = getPaymentItem(year, month);
                                                return (
                                                    <td key={month} className="p-1">
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-decoration-none"
                                                        >
                                                            <span
                                                                className={`badge bg-${getBadgeColor(
                                                                    status
                                                                )} w-100 py-2`}
                                                                style={{ fontSize: "11px", cursor: "pointer" }}
                                                            >
                                                                {status}
                                                            </span>
                                                        </a>
                                                    </td>
                                                );
                                            })}
                                            <td className="fw-bold bg-light">
                                                <span className="text-success">{okCount}</span> / 12 OK
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function getBadgeColor(status) {
    switch (status) {
        case "OK":
            return "success";
        case "Checking":
            return "warning";
        case "Passed":
            return "danger";
        case "NotYet":
        default:
            return "secondary";
    }
}