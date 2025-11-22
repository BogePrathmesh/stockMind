import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import ThemeToggle from './ThemeToggle'
import {
  LayoutDashboard,
  Package,
  Receipt,
  Truck,
  ArrowLeftRight,
  Scale,
  History,
  Settings,
  User,
  LogOut,
  Warehouse,
  Tag
} from 'lucide-react'
import { cn } from '../utils/cn'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/receipts', label: 'Receipts', icon: Receipt },
  { path: '/deliveries', label: 'Deliveries', icon: Truck },
  { path: '/transfers', label: 'Transfers', icon: ArrowLeftRight },
  { path: '/adjustments', label: 'Adjustments', icon: Scale },
  { path: '/ledger', label: 'Stock Ledger', icon: History },
]

const settingsItems = [
  { path: '/settings/warehouses', label: 'Warehouses', icon: Warehouse },
  { path: '/settings/categories', label: 'Categories', icon: Tag },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-[#FAFAF9] dark:bg-[#0B1315] text-[#171717] dark:text-white transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#0F1921] border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-amber-600">STOCKMASTER</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Inventory Management</p>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-black dark:bg-amber-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0B1315] hover:text-black dark:hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              )
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-800">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase mb-2">
              Settings
            </p>
            <div className="space-y-1">
              {settingsItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-black dark:bg-amber-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0B1315] hover:text-black dark:hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => navigate('/profile')}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              location.pathname === '/profile'
                ? 'bg-black dark:bg-amber-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0B1315] hover:text-black dark:hover:text-white'
            )}
          >
            <User className="w-5 h-5" />
            {user?.name || 'Profile'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0B1315] hover:text-black dark:hover:text-white mt-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#FAFAF9] dark:bg-[#0B1315] transition-colors">
        <Outlet />
      </main>
    </div>
  )
}
