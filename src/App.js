import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import OrdersPage from './pages/OrdersPage';
import CreateOrderPage from './pages/CreateOrderPage';
import EditOrderPage from './pages/EditOrderPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TopBar from './components/TopBar';
import PhoneEntryPage  from './pages/PhoneEntryPage';
import CodeVerifyPage  from './pages/CodeVerifyPage';
import MyOrdersPage    from './pages/MyOrdersPage';
//BAGMIASPLA

function App() {
  return (
    <Router>
      {/*  1️⃣  Top-level bar with Logout / user email  */}
      <TopBar />

      {/*  2️⃣  (optional) keep your old text nav below it  */}
      <nav style={{ margin: '20px 0' }}>
        <Link to="/">Orders</Link> | <Link to="/create">New Order</Link>
      </nav>

      {/*  3️⃣  All your routes  */}
      <Routes>
        <Route path="/"            element={<OrdersPage />} />
        <Route path="/create"      element={<CreateOrderPage />} />
        <Route path="/edit/:id"    element={<EditOrderPage />} />
        <Route path="/order/:id"   element={<OrderDetailsPage />} />
        <Route path="/login"       element={<LoginPage />} />
        <Route path="/register"    element={<RegisterPage />} />
        <Route path="/phone-login" element={<PhoneEntryPage />} />
        <Route path="/verify-code" element={<CodeVerifyPage />} />
        <Route path="/my-orders"   element={<MyOrdersPage />} />
      </Routes>
    </Router>
  );
}

export default App;
