import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle } from 'lucide-react'

export default function TransferDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [transfer, setTransfer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransfer()
  }, [id])

  const fetchTransfer = async () => {
    try {
      const response = await api.get(`/transfers/${id}`)
      setTransfer(response.data)
    } catch (error) {
      toast.error('Failed to load transfer')
      navigate('/transfers')
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async () => {
    try {
      await api.post(`/transfers/${id}/validate`)
      toast.success('Transfer validated successfully')
      fetchTransfer()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to validate transfer')
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!transfer) return <div className="p-8">Transfer not found</div>

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/transfers')}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Transfers
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{transfer.transferId}</h1>
            <p className="text-gray-600 mt-2">Internal Transfer Details</p>
          </div>
          {transfer.status !== 'DONE' && (
            <button
              onClick={handleValidate}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
            >
              <CheckCircle className="w-4 h-4" />
              Validate Transfer
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">From Warehouse</p>
            <p className="text-lg font-semibold">{transfer.fromWarehouse?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">To Warehouse</p>
            <p className="text-lg font-semibold">{transfer.toWarehouse?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-semibold">{transfer.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created By</p>
            <p className="text-lg font-semibold">{transfer.createdBy?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="text-lg font-semibold">{new Date(transfer.createdAt).toLocaleString()}</p>
          </div>
          {transfer.notes && (
            <div>
              <p className="text-sm text-gray-500">Notes</p>
              <p className="text-lg font-semibold">{transfer.notes}</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Items</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transfer.items?.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}






