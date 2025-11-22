import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [categories, setCategories] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    unitOfMeasure: '',
    description: '',
    reorderLevel: '0',
    initialStock: '',
    warehouseId: '',
    image: null
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchWarehouses()
  }, [page, search])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products', {
        params: { page, limit: 10, search }
      })
      setProducts(response.data.products)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to load categories')
    }
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const response = await api.post('/categories', newCategory)
      toast.success('Category created successfully')
      setShowCategoryModal(false)
      setNewCategory({ name: '', description: '' })
      await fetchCategories()
      // Auto-select the newly created category
      setFormData({ ...formData, categoryId: response.data.id })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category')
    }
  }

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses')
      setWarehouses(response.data)
    } catch (error) {
      console.error('Failed to load warehouses')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (key !== 'image' && formData[key]) {
          formDataToSend.append(key, formData[key])
        }
      })
      if (formData.image) {
        formDataToSend.append('image', formData.image)
      }

      await api.post('/products', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Product created successfully')
      setShowModal(false)
      resetForm()
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      categoryId: '',
      unitOfMeasure: '',
      description: '',
      reorderLevel: '0',
      initialStock: '',
      warehouseId: '',
      image: null
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-amber-600 text-sm uppercase tracking-widest mb-2">PRODUCTS</p>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-serif font-bold text-white mb-2">Products</h1>
            <p className="text-gray-400">Manage your inventory products</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#0F1921] border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0B1315] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-[#0B1315]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Reorder Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#0F1921] divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">Loading...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-[#0B1315] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.image && (
                        <img
                          src={`http://localhost:5000${product.image}`}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-[#171717] dark:text-white">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">{product.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {product.category?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {product.unitOfMeasure}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {product.reorderLevel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="text-black dark:text-amber-600 hover:text-gray-700 dark:hover:text-amber-500"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white dark:bg-[#0F1921] border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 text-[#171717] dark:text-white hover:bg-gray-50 dark:hover:bg-[#0B1315] transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white dark:bg-[#0F1921] border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 text-[#171717] dark:text-white hover:bg-gray-50 dark:hover:bg-[#0B1315] transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-[#171717] dark:text-white">Create Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#171717] dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#171717] dark:text-gray-300 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-[#171717] dark:text-gray-300">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowCategoryModal(true)
                      }}
                      className="text-xs text-black dark:text-amber-600 hover:underline"
                    >
                      + Add Category
                    </button>
                  </div>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#171717] dark:text-gray-300 mb-1">
                    Unit of Measure *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unitOfMeasure}
                    onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white placeholder-gray-500"
                    placeholder="e.g., pcs, kg, L"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#171717] dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#171717] dark:text-gray-300 mb-1">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#171717] dark:text-gray-300 mb-1">
                    Initial Stock (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.initialStock}
                    onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white"
                  />
                </div>
              </div>
              {formData.initialStock && (
                <div>
                  <label className="block text-sm font-medium text-[#171717] dark:text-gray-300 mb-1">
                    Warehouse for Initial Stock
                  </label>
                  <select
                    value={formData.warehouseId}
                    onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white"
                  >
                    <option value="">Select warehouse</option>
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#171717] dark:text-gray-300 mb-1">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white hover:bg-gray-50 dark:hover:bg-[#0B1315] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black dark:bg-amber-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-amber-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-[#171717] dark:text-white">Create Category</h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#171717] dark:text-gray-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#171717] dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white"
                  rows="3"
                  placeholder="Enter category description (optional)"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false)
                    setNewCategory({ name: '', description: '' })
                  }}
                  className="px-4 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white hover:bg-gray-50 dark:hover:bg-[#0B1315] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black dark:bg-amber-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-amber-700 transition-colors"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


