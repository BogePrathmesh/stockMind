import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Homepage from './pages/Homepage'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/Dashboard'
import Products from './pages/products/Products'
import ProductDetail from './pages/products/ProductDetail'
import Receipts from './pages/receipts/Receipts'
import ReceiptDetail from './pages/receipts/ReceiptDetail'
import Deliveries from './pages/deliveries/Deliveries'
import DeliveryDetail from './pages/deliveries/DeliveryDetail'
import Transfers from './pages/transfers/Transfers'
import TransferDetail from './pages/transfers/TransferDetail'
import Adjustments from './pages/adjustments/Adjustments'
import Ledger from './pages/ledger/Ledger'
import Warehouses from './pages/settings/Warehouses'
import Categories from './pages/settings/Categories'
import Profile from './pages/Profile'
import Portfolio from './pages/portfolio/Portfolio'
import Alerts from './pages/alerts/Alerts'
import Sentiment from './pages/sentiment/Sentiment'
import Backtest from './pages/backtest/Backtest'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { user, token } = useAuthStore()
  
  if (!token || !user) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="sentiment" element={<Sentiment />} />
          <Route path="backtest" element={<Backtest />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="receipts" element={<Receipts />} />
          <Route path="receipts/:id" element={<ReceiptDetail />} />
          <Route path="deliveries" element={<Deliveries />} />
          <Route path="deliveries/:id" element={<DeliveryDetail />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="transfers/:id" element={<TransferDetail />} />
          <Route path="adjustments" element={<Adjustments />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="settings/warehouses" element={<Warehouses />} />
          <Route path="settings/categories" element={<Categories />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
