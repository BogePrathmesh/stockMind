import { useState, useEffect } from 'react';
import { Play, Trash2, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Backtest() {
  const [backtests, setBacktests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    buyCondition: 'MA_CROSSOVER',
    sellCondition: 'MA_CROSSOVER',
    startDate: '',
    endDate: '',
    initialCapital: '100000'
  });
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchBacktests();
  }, []);

  const fetchBacktests = async () => {
    try {
      const res = await api.get('/backtest');
      setBacktests(res.data || []);
    } catch (error) {
      console.error('Error fetching backtests:', error);
      // Don't show error if it's just empty data
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to load backtests');
      }
      setBacktests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunBacktest = async (e) => {
    e.preventDefault();
    setRunning(true);
    try {
      const strategy = {
        buyCondition: formData.buyCondition,
        sellCondition: formData.sellCondition
      };

      await api.post('/backtest', {
        ...formData,
        strategy,
        initialCapital: parseFloat(formData.initialCapital)
      });

      toast.success('Backtest completed successfully');
      setShowForm(false);
      setFormData({
        name: '',
        symbol: '',
        buyCondition: 'MA_CROSSOVER',
        sellCondition: 'MA_CROSSOVER',
        startDate: '',
        endDate: '',
        initialCapital: '100000'
      });
      fetchBacktests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to run backtest');
    } finally {
      setRunning(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this backtest?')) return;
    try {
      await api.delete(`/backtest/${id}`);
      toast.success('Backtest deleted');
      fetchBacktests();
    } catch (error) {
      toast.error('Failed to delete backtest');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Strategy Backtesting</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Test your trading strategies on historical data
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Play className="w-5 h-5" />
          Run Backtest
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">New Backtest</h2>
          <form onSubmit={handleRunBacktest} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Strategy Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="e.g., MA Crossover Strategy"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock Symbol</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="e.g., TCS"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Buy Condition</label>
                <select
                  value={formData.buyCondition}
                  onChange={(e) => setFormData({ ...formData, buyCondition: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="MA_CROSSOVER">50MA &gt; 200MA (Golden Cross)</option>
                  <option value="RSI_OVERSOLD">RSI &lt; 30 (Oversold)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sell Condition</label>
                <select
                  value={formData.sellCondition}
                  onChange={(e) => setFormData({ ...formData, sellCondition: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="MA_CROSSOVER">50MA &lt; 200MA (Death Cross)</option>
                  <option value="RSI_OVERBOUGHT">RSI &gt; 70 (Overbought)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Initial Capital (₹)</label>
                <input
                  type="number"
                  value={formData.initialCapital}
                  onChange={(e) => setFormData({ ...formData, initialCapital: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={running}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {running ? 'Running...' : 'Run Backtest'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {backtests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No backtests yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Run your first strategy backtest to see results here!
            </p>
          </div>
        ) : (
          backtests.map((backtest) => {
            const equityCurve = backtest.equityCurve ? JSON.parse(backtest.equityCurve) : [];
            return (
              <div key={backtest.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{backtest.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {backtest.symbol} • {new Date(backtest.startDate).toLocaleDateString()} - {new Date(backtest.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(backtest.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                    title="Delete backtest"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Return</p>
                    <p className={`text-2xl font-bold ${backtest.returnPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {backtest.returnPercent?.toFixed(2) || '0.00'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Final Capital</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{backtest.finalCapital?.toLocaleString('en-IN') || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Win Rate</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{backtest.winRate?.toFixed(1) || '0.0'}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Max Drawdown</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{backtest.maxDrawdown?.toFixed(2) || '0.00'}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Trades</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{backtest.totalTrades || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Winning Trades</p>
                    <p className="text-xl font-semibold text-green-600 dark:text-green-400">{backtest.winningTrades || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Losing Trades</p>
                    <p className="text-xl font-semibold text-red-600 dark:text-red-400">{backtest.losingTrades || 0}</p>
                  </div>
                </div>

                {equityCurve.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4">Equity Curve</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={equityCurve}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

