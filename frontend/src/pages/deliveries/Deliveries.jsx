import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Plus, Search, Eye, FileText } from 'lucide-react'

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDeliveries()
  }, [page, search])

  const fetchDeliveries = async () => {
    try {
      const response = await api.get('/deliveries', {
        params: { page, limit: 10, search }
      })
      setDeliveries(response.data.deliveries)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      toast.error('Failed to load deliveries')
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async (id) => {
    try {
      await api.post(`/deliveries/${id}/validate`)
      toast.success('Delivery validated successfully')
      fetchDeliveries()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to validate delivery')
    }
  }

  const handleDownloadPDF = async (id) => {
    try {
      const response = await api.get(`/deliveries/${id}/pdf`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `delivery-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast.error('Failed to generate PDF')
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
          <h1 className="text-3xl font-bold text-gray-900">Deliveries</h1>
          <p className="text-gray-600 mt-2">Manage outgoing goods</p>
        </div>
        <button
          onClick={() => navigate('/deliveries/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Delivery
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search deliveries..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
            ) : deliveries.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No deliveries found</td></tr>
            ) : (
              deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{delivery.deliveryId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.warehouse?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {delivery.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(delivery.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/deliveries/${delivery.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(delivery.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      {delivery.status !== 'DONE' && (
                        <button
                          onClick={() => handleValidate(delivery.id)}
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






