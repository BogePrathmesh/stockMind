import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    alertType: 'PRICE_ABOVE',
    targetValue: '',
    targetPercent: ''
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Don't show error if it's just empty data
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to load alerts');
      }
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      await api.post('/alerts', formData);
      toast.success('Alert created successfully');
      setShowAddForm(false);
      setFormData({ symbol: '', alertType: 'PRICE_ABOVE', targetValue: '', targetPercent: '' });
      fetchAlerts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create alert');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;
    try {
      await api.delete(`/alerts/${id}`);
      toast.success('Alert deleted');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to delete alert');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/alerts/${id}`, {
        status: currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
      });
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to update alert');
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
        <h1 className="text-3xl font-bold">Price Alerts</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Create Alert
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Alert</h2>
          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Stock Symbol</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="e.g., TCS, RELIANCE"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alert Type</label>
                <select
                  value={formData.alertType}
                  onChange={(e) => setFormData({ ...formData, alertType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="PRICE_ABOVE">Price Above</option>
                  <option value="PRICE_BELOW">Price Below</option>
                  <option value="PRICE_CHANGE_PERCENT">Price Change %</option>
                  <option value="VOLUME_INCREASE">Volume Increase</option>
                </select>
              </div>
              {(formData.alertType === 'PRICE_ABOVE' || formData.alertType === 'PRICE_BELOW') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Target Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    required
                  />
                </div>
              )}
              {(formData.alertType === 'PRICE_CHANGE_PERCENT' || formData.alertType === 'VOLUME_INCREASE') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Target Percentage (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.targetPercent}
                    onChange={(e) => setFormData({ ...formData, targetPercent: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    required
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Alert
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Alerts</h2>
        </div>
        {alerts.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No alerts yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Create your first alert to get notified about price movements!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Alert Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{alert.symbol}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {alert.alertType === 'PRICE_ABOVE' && 'Price Above'}
                      {alert.alertType === 'PRICE_BELOW' && 'Price Below'}
                      {alert.alertType === 'PRICE_CHANGE_PERCENT' && 'Price Change %'}
                      {alert.alertType === 'VOLUME_INCREASE' && 'Volume Increase'}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {alert.targetValue && `₹${parseFloat(alert.targetValue).toFixed(2)}`}
                      {alert.targetPercent && `${parseFloat(alert.targetPercent).toFixed(2)}%`}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        alert.status === 'TRIGGERED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(alert.id, alert.status)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                          title={alert.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                        >
                          {alert.status === 'ACTIVE' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(alert.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                          title="Delete alert"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

