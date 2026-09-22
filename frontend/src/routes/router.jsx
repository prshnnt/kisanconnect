import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ProtectedLayout from '../components/layout/ProtectedLayout'
import DashboardPage from '../pages/dashboard/DashboardPage'
import LotsPage from '../pages/lots/LotsPage'
import AdvanceSuppliesPage from '../pages/lots/AdvanceSuppliesPage'
import LiveAuctionsPage from '../pages/auctions/LiveAuctionsPage'
import AuctionDetailPage from '../pages/auctions/AuctionDetailPage'
import TradesPage from '../pages/trade/TradesPage'
import BillsPage from '../pages/trade/BillsPage'
import ServicesBrowsePage from '../pages/marketplace/ServicesBrowsePage'
import BookingsPage from '../pages/marketplace/BookingsPage'
import ProviderCatalogsPage from '../pages/marketplace/ProviderCatalogsPage'
import MandisPage from '../pages/mandis/MandisPage'
import ProfilePage from '../pages/profile/ProfilePage'
import CommissionAgentPage from '../pages/agents/CommissionAgentPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProtectedLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="lots" element={<LotsPage />} />
        <Route path="lots/supplies" element={<AdvanceSuppliesPage />} />
        <Route path="auctions" element={<LiveAuctionsPage />} />
        <Route path="auctions/:auctionId" element={<AuctionDetailPage />} />
        <Route path="trades" element={<TradesPage />} />
        <Route path="trades/bills" element={<BillsPage />} />
        <Route path="marketplace" element={<ServicesBrowsePage />} />
        <Route path="marketplace/bookings" element={<BookingsPage />} />
        <Route path="marketplace/catalogs" element={<ProviderCatalogsPage />} />
        <Route path="mandis" element={<MandisPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="agent" element={<CommissionAgentPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRoutes
