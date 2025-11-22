import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Plus, Search, Eye } from 'lucide-react'

export default function Transfers() {
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTransfers()
  }, [page, search])

  const fetchTransfers = async () => {
    try {
      const response = await api.get('/transfers', {
        params: { page, limit: 10, search }
      })
      setTransfers(response.data.transfers)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      toast.error('Failed to load transfers')
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async (id) => {
    try {
      await api.post(`/transfers/${id}/validate`)
      toast.success('Transfer validated successfully')
      fetchTransfers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to validate transfer')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      WAITING: 'bg-yellow-100 text-yellow-800',
      READY: 'bg-blue-100 text-blue-800',
      DONE: 'bg-green-100 text-green-800',
      CANCELED: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Internal Transfers</h1>
          <p className="text-gray-600 mt-2">Move stock between warehouses</p>
        </div>
        <button
          onClick={() => navigate('/transfers/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Transfer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search transfers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transfer ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
            ) : transfers.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No transfers found</td></tr>
            ) : (
              transfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{transfer.transferId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.fromWarehouse?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.toWarehouse?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                      {transfer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transfer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/transfers/${transfer.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {transfer.status !== 'DONE' && (
                        <button
                          onClick={() => handleValidate(transfer.id)}
                          className="text-purple-600 hover:text-purple-900 text-xs"
                        >
                          Validate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}






