import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Dashboard from '@/components/pages/Dashboard';
import Users from '@/components/pages/Users';
import Products from '@/components/pages/Products';
import Orders from '@/components/pages/Orders';
import RegDoc from '@/components/pages/RegDoc';
import Smpl1 from '@/components/pages/1';
import Smpl2 from '@/components/pages/2';
import Smpl3 from '@/components/pages/3';
import Smpl4 from '@/components/pages/4';
import Smpl5 from '@/components/pages/5';
import Smpl6 from '@/components/pages/6';
import KanbanPage from '@/components/pages/kanban-page';
import MonthlyPayment from '@/components/pages/MonthlyPayment';
import Items from '@/components/pages/Items';
import Interpreter from '@/components/pages/Interpreter';
import OrderClients from '@/components/pages/OrderClients';

function NotFound() {
  return (
    <section className="not-found-page">
      <h1>ページが見つかりません</h1>
      <p>URLを確認するか、サイドバーからページを選択してください。</p>
    </section>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />

          <Route path="/orderclients" element={<OrderClients />} />
          
          
          <Route path="/registereddocument" element={<RegDoc />} />
          <Route path="/1" element={<Smpl1 />} />
          <Route path="/2" element={<Smpl2 />} />
          <Route path="/3" element={<Smpl3 />} />
          <Route path="/4" element={<Smpl4 />} />
          <Route path="/5" element={<Smpl5 />} />
          <Route path="/6" element={<Smpl6 />} />
          <Route path="/chat" element={<Smpl6 />} />
          <Route path="/monthly-payment" element={<MonthlyPayment />} />
          <Route path="/interpreter" element={<Interpreter />} />
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="/items" element={<Items />} />
          <Route path="/item-list" element={<Items />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
