import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSocket } from '../../hooks/useSocket';

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    quantity: '',
    buyPrice: ''
  });

  // Real-time updates via WebSocket
  useSocket('portfolio-update', (data) => {
    setPortfolio(data);
  });

  useSocket('stock-price-update', (data) => {
    // Update portfolio when stock prices change
    if (portfolio?.holdings?.some(h => h.symbol === data.symbol)) {
      fetchPortfolio();
    }
  });

  useEffect(() => {
    fetchPortfolio();
    fetchHistory();
    // Refresh every 30 seconds as backup
    const interval = setInterval(() => {
      fetchPortfolio();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get('/portfolio');
      setPortfolio(res.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/portfolio/history');
      setHistory(res.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleAddHolding = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.symbol || !formData.symbol.trim()) {
      toast.error('Please enter a stock symbol');
      return;
    }
    
    if (!formData.name || !formData.name.trim()) {
      toast.error('Please enter a stock name');
      return;
    }
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      toast.error('Please enter a valid quantity (greater than 0)');
      return;
    }
    
    if (!formData.buyPrice || parseFloat(formData.buyPrice) <= 0) {
      toast.error('Please enter a valid buy price (greater than 0)');
      return;
    }
    
    try {
      const response = await api.post('/portfolio/holdings', {
        symbol: formData.symbol.trim(),
        name: formData.name.trim(),
        quantity: parseFloat(formData.quantity),
        buyPrice: parseFloat(formData.buyPrice)
      });
      
      toast.success('Stock added to portfolio successfully!');
      setShowAddForm(false);
      setFormData({ symbol: '', name: '', quantity: '', buyPrice: '' });
      fetchPortfolio();
      fetchHistory();
    } catch (error) {
      console.error('Add holding error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.details || 'Failed to add stock';
      
      // Show helpful message if migration is needed
      if (error.response?.status === 503 || errorMessage.includes('migration')) {
        toast.error(
          <div>
            <p className="font-semibold">Database Migration Required</p>
            <p className="text-sm">Run: cd backend && npm run prisma:migrate</p>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this holding?')) return;
    try {
      await api.delete(`/portfolio/holdings/${id}`);
      toast.success('Holding removed');
      fetchPortfolio();
    } catch (error) {
      toast.error('Failed to remove holding');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const bestPerformer = portfolio?.holdings?.reduce((best, holding) => 
    holding.pnlPercent > (best?.pnlPercent || -Infinity) ? holding : best, null
  );
  const worstPerformer = portfolio?.holdings?.reduce((worst, holding) => 
    holding.pnlPercent < (worst?.pnlPercent || Infinity) ? holding : worst, null
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Portfolio Tracker</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Stock
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add Stock to Portfolio</h2>
          <form onSubmit={handleAddHolding} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Symbol</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., TCS, RELIANCE, AAPL"
                  required
                  maxLength={10}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use letters and numbers only</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Stock Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Tata Consultancy Services"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Buy Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.buyPrice}
                  onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1500.00"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Stock
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold mt-1">₹{portfolio?.totalValue?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total P&L</p>
              <p className={`text-2xl font-bold mt-1 ${portfolio?.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{portfolio?.totalPnL?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
            {portfolio?.totalPnL >= 0 ? (
              <TrendingUp className="w-8 h-8 text-green-600" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-600" />
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily P&L</p>
              <p className={`text-2xl font-bold mt-1 ${portfolio?.dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{portfolio?.dailyPnL?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
              <p className="text-2xl font-bold mt-1">₹{portfolio?.totalCost?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</p>
            </div>
            <DollarSign className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Portfolio Value Chart */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Portfolio Value Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalValue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Best/Worst Performers */}
      {(bestPerformer || worstPerformer) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bestPerformer && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2 text-green-600">Best Performer</h3>
              <p className="text-2xl font-bold">{bestPerformer.symbol}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{bestPerformer.name}</p>
              <p className="text-xl font-semibold text-green-600 mt-2">
                +{bestPerformer.pnlPercent?.toFixed(2)}% (₹{bestPerformer.pnl?.toFixed(2)})
              </p>
            </div>
          )}
          {worstPerformer && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2 text-red-600">Worst Performer</h3>
              <p className="text-2xl font-bold">{worstPerformer.symbol}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{worstPerformer.name}</p>
              <p className="text-xl font-semibold text-red-600 mt-2">
                {worstPerformer.pnlPercent?.toFixed(2)}% (₹{worstPerformer.pnl?.toFixed(2)})
              </p>
            </div>
          )}
        </div>
      )}

      {/* Holdings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Holdings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Buy Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Current Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">P&L</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">P&L %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {portfolio?.holdings?.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No holdings yet. Add your first stock to get started!
                  </td>
                </tr>
              ) : (
                portfolio?.holdings?.map((holding) => (
                  <tr key={holding.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 font-semibold">{holding.symbol}</td>
                    <td className="px-6 py-4">{holding.name}</td>
                    <td className="px-6 py-4">{holding.quantity}</td>
                    <td className="px-6 py-4">₹{holding.buyPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4">₹{holding.currentPrice?.toFixed(2)}</td>
                    <td className={`px-6 py-4 font-semibold ${holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{holding.pnl?.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 font-semibold ${holding.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {holding.pnlPercent?.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(holding.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

