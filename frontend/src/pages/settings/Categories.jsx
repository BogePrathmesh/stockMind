import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Tag, Package } from 'lucide-react'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, formData)
        toast.success('Category updated successfully')
      } else {
        await api.post('/categories', formData)
        toast.success('Category created successfully')
      }
      setShowModal(false)
      setEditing(null)
      setFormData({ name: '', description: '' })
      fetchCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category')
    }
  }

  const handleEdit = (category) => {
    setEditing(category)
    setFormData({
      name: category.name,
      description: category.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return

    try {
      await api.delete(`/categories/${id}`)
      toast.success('Category deleted successfully')
      fetchCategories()
    } catch (error) {
      toast.error('Failed to delete category')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-gray-500 dark:text-amber-600 text-sm uppercase tracking-widest mb-2">CATEGORIES</p>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-serif font-bold text-[#171717] dark:text-white mb-2">Categories</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage product categories</p>
          </div>
          <button
            onClick={() => {
              setEditing(null)
              setFormData({ name: '', description: '' })
              setShowModal(true)
            }}
            className="bg-black dark:bg-amber-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
          <Tag className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <h3 className="text-xl font-semibold text-[#171717] dark:text-white mb-2">No Categories</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first category</p>
          <button
            onClick={() => {
              setEditing(null)
              setFormData({ name: '', description: '' })
              setShowModal(true)
            }}
            className="bg-black dark:bg-amber-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-amber-700 transition-colors mx-auto"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-black dark:hover:border-amber-600/50 transition-all hover:shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Tag className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[#171717] dark:text-white">{category.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-black dark:text-amber-600 hover:bg-gray-100 dark:hover:bg-[#0B1315] rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {category.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{category.description}</p>
              )}
              
              {category._count && (
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {category._count.products} {category._count.products === 1 ? 'product' : 'products'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-[#171717] dark:text-white">
              {editing ? 'Edit Category' : 'Create Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#171717] dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-amber-600 focus:border-transparent"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#171717] dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-amber-600 focus:border-transparent"
                  rows="3"
                  placeholder="Enter category description"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditing(null)
                  }}
                  className="px-4 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white hover:bg-gray-50 dark:hover:bg-[#0B1315] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black dark:bg-amber-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-amber-700 transition-colors"
                >
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
