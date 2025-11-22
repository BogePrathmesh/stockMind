import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Package } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`)
      setProduct(response.data)
    } catch (error) {
      toast.error('Failed to load product')
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!product) {
    return <div className="p-8">Product not found</div>
  }

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/products')}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-6">
          {product.image && (
            <img
              src={`http://localhost:5000${product.image}`}
              alt={product.name}
              className="w-32 h-32 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description || 'No description'}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">SKU</p>
                <p className="text-lg font-semibold">{product.sku}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-lg font-semibold">{product.category?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Unit of Measure</p>
                <p className="text-lg font-semibold">{product.unitOfMeasure}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reorder Level</p>
                <p className="text-lg font-semibold">{product.reorderLevel}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Stock by Warehouse</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.stock && product.stock.length > 0 ? (
              product.stock.map((stock) => (
                <div key={stock.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{stock.warehouse.name}</p>
                      <p className="text-2xl font-bold text-blue-600 mt-2">
                        {stock.quantity} {product.unitOfMeasure}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  {stock.quantity <= product.reorderLevel && (
                    <p className="text-sm text-red-600 mt-2">Low stock!</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No stock in any warehouse</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}






