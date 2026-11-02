import PaymentDashboard from "@/components/MonthlyPayment/PaymentDashboard";
import SecondRowSection from "@/components/MonthlyPayment/SecondRowSection";
import ThirdRowSection from "@/components/MonthlyPayment/ThirdRowSection";


export default function Dashboard() {
    return (
        <div className="dashboard-page">

            {/* Header */}
            <div className="page-header mb-4">
                <h1>Dashboard</h1>
                <p>顧客支払い管理＆パフォーマンス分析</p>
            </div>

            {/* 1段目：支払い確認（上下＆左右カラム構造） */}
            <PaymentDashboard />

            {/* 2段目：自由拡張エリア */}
            <SecondRowSection />

            {/* 3段目：自由拡張エリア */}
            <ThirdRowSection />

        </div>
    );
}