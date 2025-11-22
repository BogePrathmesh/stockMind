import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import ThemeToggle from '../components/ThemeToggle'
import { Package, ArrowRight, TrendingUp, BarChart3, Warehouse, Users, CheckCircle } from 'lucide-react'

export default function Homepage() {
  const navigate = useNavigate()
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (token && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [token, user, navigate])

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#0B1315] text-[#171717] dark:text-white transition-colors">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="text-2xl font-bold tracking-wider">STOCKMASTER</div>
          <div className="hidden md:flex gap-6 text-sm">
            <a href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</a>
            <a href="#about" className="hover:text-black dark:hover:text-white transition-colors">About</a>
            <a href="#contact" className="hover:text-black dark:hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm hover:text-black dark:hover:text-white transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="bg-black dark:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            Get started
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-serif font-bold mb-6 leading-tight text-[#171717] dark:text-white">
            Streamline Your Inventory,
            <br />
            Supercharge Your Operations
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            All-in-one platform to manage stock, track movements, and optimize warehouse operations — faster and smarter.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="bg-black dark:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-800 dark:hover:bg-amber-700 transition-colors flex items-center gap-2 mx-auto"
          >
            Get started for Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Overview - 3 Columns */}
        <div className="grid md:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
          <div className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-xl p-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#171717] dark:text-white">Real-Time Collaboration</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track inventory changes instantly and keep everyone in sync with live updates, notifications, and team coordination.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-xl p-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#171717] dark:text-white">Stock & Inventory Tracking</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor stock levels, set reorder points, and visualize inventory with dashboards tailored to your warehouse needs.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-xl p-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#171717] dark:text-white">Performance Insights</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Make smarter decisions with analytics that show stock trends, low inventory alerts, and warehouse efficiency metrics.
            </p>
          </div>
        </div>

        {/* Mid-Page Headline */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-4 text-[#171717] dark:text-white">
            Everything Your Team Needs to Work Smarter
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            From stock tracking to real-time updates, our features are built to keep your inventory organized, accessible, and moving forward—together.
          </p>
        </div>

        {/* Detailed Features - 2x2 Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-20 max-w-6xl mx-auto">
          {/* Top Left - Built-In Team Chat */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-3">Product Management</h3>
              <p className="text-white/90">
                Manage products seamlessly within your inventory—no need to switch apps.
              </p>
            </div>
          </div>

          {/* Top Right - Task Assignment */}
          <div className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-3 text-[#171717] dark:text-white">Receipts & Deliveries</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Easily create, track, and manage incoming receipts and outgoing deliveries to keep everyone aligned and accountable.
            </p>
          </div>

          {/* Bottom Left - Real-Time Scheduling */}
          <div className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-3 text-[#171717] dark:text-white">Stock Transfers</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Plan transfers, set schedules, and sync inventory across warehouses so your team stays on the same page.
            </p>
          </div>

          {/* Bottom Right - Progress Tracking */}
          <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-3">Stock Ledger</h3>
              <p className="text-white/90">
                Visualize inventory performance with dashboards that highlight what's in stock and what needs attention.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-4 text-[#171717] dark:text-white">
            Proven Results, Real Impact
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            See how teams around the world are managing inventory faster, tracking stock better, and getting more done with our all-in-one management platform.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="bg-black dark:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-800 dark:hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
              Get started for Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white dark:bg-[#0F1921] border-2 border-gray-300 dark:border-gray-700 text-[#171717] dark:text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 dark:hover:bg-[#0B1315] transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4 text-[#171717] dark:text-white">STOCKMASTER</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Get out there & manage your inventory with confidence. Track stock, manage warehouses, and optimize operations.
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs">Copyright 2024 StockMaster IMS. All rights reserved.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#171717] dark:text-white">More on The Blog</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">About StockMaster</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Contributors</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Write For Us</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#171717] dark:text-white">More on StockMaster</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">The Team</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Jobs</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
