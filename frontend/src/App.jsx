import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import OrderPage from './pages/OrderPage';
import KitchenPage from './pages/KitchenPage';
import AdminPage from './pages/AdminPage';
import StaffPage from './pages/StaffPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/order/:tableNumber" element={<OrderPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/staff" element={<StaffPage />} />
      </Routes>
    </BrowserRouter>
  );
}
