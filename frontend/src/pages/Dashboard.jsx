import { useEffect, useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useSocket } from '../hooks/useSocket'
import {
  Package,
  AlertTriangle,
  Receipt,
  Truck,
  ArrowLeftRight,
  Scale
} from 'lucide-react'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#d97706', '#059669', '#dc2626', '#7c3aed', '#ec4899', '#3b82f6']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Real-time updates via Socket.io
  useSocket('dashboard-update', (data) => {
    console.log('Dashboard update received:', data)
    fetchStats()
  })

  useEffect(() => {
    fetchStats()
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Don't show error toast on auto-refresh
      if (loading) {
        toast.error('Failed to load dashboard data')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const kpiCards = [
    {
      title: 'Total Products',
      value: stats?.kpis?.totalProducts || 0,
      icon: Package,
      color: 'bg-amber-600'
    },
    {
      title: 'Low Stock Items',
      value: stats?.kpis?.lowStockItems || 0,
      icon: AlertTriangle,
      color: 'bg-red-600'
    },
    {
      title: 'Pending Receipts',
      value: stats?.kpis?.pendingReceipts || 0,
      icon: Receipt,
      color: 'bg-yellow-600'
    },
    {
      title: 'Pending Deliveries',
      value: stats?.kpis?.pendingDeliveries || 0,
      icon: Truck,
      color: 'bg-orange-600'
    },
    {
      title: 'Scheduled Transfers',
      value: stats?.kpis?.scheduledTransfers || 0,
      icon: ArrowLeftRight,
      color: 'bg-purple-600'
    },
    {
      title: 'Pending Adjustments',
      value: stats?.kpis?.pendingAdjustments || 0,
      icon: Scale,
      color: 'bg-pink-600'
    }
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-gray-500 dark:text-amber-600 text-sm uppercase tracking-widest mb-2">DASHBOARD</p>
        <h1 className="text-5xl font-serif font-bold text-[#171717] dark:text-white mb-2">Inventory Overview</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitor your inventory at a glance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-black dark:hover:border-amber-600/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{card.title}</p>
                  <p className="text-4xl font-bold text-[#171717] dark:text-white">{card.value}</p>
                </div>
                <div className={`${card.color} p-4 rounded-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Stock Over Time */}
        <div className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[#171717] dark:text-white mb-4">Stock Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.stockOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                tick={{ fill: '#64748b' }}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748b"
                tick={{ fill: '#64748b' }}
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#171717'
                }}
                labelStyle={{ color: '#171717' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="stock" 
                stroke="#d97706" 
                strokeWidth={2}
                dot={{ fill: '#d97706', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Items by Category */}
        <div className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[#171717] dark:text-white mb-4">Items by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.itemsByCategory || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => {
                  if (percent === 0) return ''
                  return `${category} ${(percent * 100).toFixed(0)}%`
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {(stats?.itemsByCategory || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#171717'
                }}
                labelStyle={{ color: '#171717' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[#171717] dark:text-white mb-4">Recent Activity</h2>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-[#0B1315]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Warehouse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    New Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#0F1921] divide-y divide-gray-200 dark:divide-gray-800">
                {stats.recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-[#0B1315] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#171717] dark:text-white">
                      {activity.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {activity.warehouse}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {activity.movementType}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      activity.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {activity.change > 0 ? '+' : ''}{activity.change}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {activity.newStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No recent activity
          </div>
        )}
      </div>
    </div>
  )
}
