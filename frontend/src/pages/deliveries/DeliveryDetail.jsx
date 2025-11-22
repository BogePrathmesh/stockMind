import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react'

export default function DeliveryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [delivery, setDelivery] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDelivery()
  }, [id])

  const fetchDelivery = async () => {
    try {
      const response = await api.get(`/deliveries/${id}`)
      setDelivery(response.data)
    } catch (error) {
      toast.error('Failed to load delivery')
      navigate('/deliveries')
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async () => {
    try {
      await api.post(`/deliveries/${id}/validate`)
      toast.success('Delivery validated successfully')
      fetchDelivery()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to validate delivery')
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/deliveries/${id}/pdf`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `delivery-${delivery.deliveryId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast.error('Failed to generate PDF')
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!delivery) return <div className="p-8">Delivery not found</div>

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/deliveries')}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Deliveries
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{delivery.deliveryId}</h1>
            <p className="text-gray-600 mt-2">Delivery Order Details</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
            >
              <FileText className="w-4 h-4" />
              Download PDF
            </button>
            {delivery.status !== 'DONE' && (
              <button
                onClick={handleValidate}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
              >
                <CheckCircle className="w-4 h-4" />
                Validate Delivery
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="text-lg font-semibold">{delivery.customer}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Warehouse</p>
            <p className="text-lg font-semibold">{delivery.warehouse?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-semibold">{delivery.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created By</p>
            <p className="text-lg font-semibold">{delivery.createdBy?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="text-lg font-semibold">{new Date(delivery.createdAt).toLocaleString()}</p>
          </div>
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
              {delivery.items?.map((item) => (
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






