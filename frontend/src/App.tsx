import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Home from './pages/Home';
import StockBrain from './pages/StockBrain';
import Money from './pages/Money';
import AskBrain from './pages/AskBrain';
import AddData from './pages/AddData';
import Dashboard from './pages/Dashboard';

// Retain previous views for backwards-compatible direct linking
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Activity from './pages/Activity';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-content">
          <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <Routes>
            {/* Primary 5 Mobile-First Screens */}
            <Route path="/" element={<Home />} />
            <Route path="/stock-brain" element={<StockBrain />} />
            <Route path="/inventory" element={<Navigate to="/stock-brain" replace />} />
            <Route path="/money" element={<Money />} />
            <Route path="/ask-brain" element={<AskBrain />} />
            <Route path="/add-data" element={<AddData />} />

            {/* AI Order Desk & Operations */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/order-desk" element={<Navigate to="/dashboard" replace />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/activity" element={<Activity />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
