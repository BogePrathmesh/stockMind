import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Warehouse as WarehouseIcon, MapPin } from 'lucide-react'

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: ''
  })

  useEffect(() => {
    fetchWarehouses()
  }, [])

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses')
      setWarehouses(response.data)
    } catch (error) {
      toast.error('Failed to load warehouses')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/warehouses/${editing.id}`, formData)
        toast.success('Warehouse updated successfully')
      } else {
        await api.post('/warehouses', formData)
        toast.success('Warehouse created successfully')
      }
      setShowModal(false)
      setEditing(null)
      setFormData({ name: '', address: '', description: '' })
      fetchWarehouses()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save warehouse')
    }
  }

  const handleEdit = (warehouse) => {
    setEditing(warehouse)
    setFormData({
      name: warehouse.name,
      address: warehouse.address || '',
      description: warehouse.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this warehouse?')) return

    try {
      await api.delete(`/warehouses/${id}`)
      toast.success('Warehouse deleted successfully')
      fetchWarehouses()
    } catch (error) {
      toast.error('Failed to delete warehouse')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-gray-500 dark:text-amber-600 text-sm uppercase tracking-widest mb-2">WAREHOUSES</p>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-serif font-bold text-[#171717] dark:text-white mb-2">Warehouses</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage warehouse locations</p>
          </div>
          <button
            onClick={() => {
              setEditing(null)
              setFormData({ name: '', address: '', description: '' })
              setShowModal(true)
            }}
            className="bg-black dark:bg-amber-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Warehouse
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
      ) : warehouses.length === 0 ? (
        <div className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
          <WarehouseIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <h3 className="text-xl font-semibold text-[#171717] dark:text-white mb-2">No Warehouses</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first warehouse</p>
          <button
            onClick={() => {
              setEditing(null)
              setFormData({ name: '', address: '', description: '' })
              setShowModal(true)
            }}
            className="bg-black dark:bg-amber-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-amber-700 transition-colors mx-auto"
          >
            <Plus className="w-5 h-5" />
            Add Warehouse
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((warehouse) => (
            <div 
              key={warehouse.id} 
              className="bg-white dark:bg-[#0F1921] border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-black dark:hover:border-amber-600/50 transition-all hover:shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <WarehouseIcon className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[#171717] dark:text-white">{warehouse.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(warehouse)}
                    className="p-2 text-black dark:text-amber-600 hover:bg-gray-100 dark:hover:bg-[#0B1315] rounded-lg transition-colors"
                    title="Edit warehouse"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(warehouse.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete warehouse"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {warehouse.address && (
                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{warehouse.address}</p>
                </div>
              )}
              
              {warehouse.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{warehouse.description}</p>
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
              {editing ? 'Edit Warehouse' : 'Create Warehouse'}
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
                  placeholder="Enter warehouse name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#171717] dark:text-gray-300 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-amber-600 focus:border-transparent"
                  placeholder="Enter warehouse address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#171717] dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0B1315] border border-gray-300 dark:border-gray-700 rounded-lg text-[#171717] dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-amber-600 focus:border-transparent"
                  rows="3"
                  placeholder="Enter warehouse description"
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
