import { create } from 'zustand'
import api from '../utils/api'

// Load from localStorage
const loadAuth = () => {
  try {
    const stored = localStorage.getItem('auth-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        user: parsed.state?.user || null,
        token: parsed.state?.token || null,
        refreshToken: parsed.state?.refreshToken || null
      }
    }
  } catch (e) {
    console.error('Failed to load auth from localStorage', e)
  }
  return { user: null, token: null, refreshToken: null }
}

// Save to localStorage
const saveAuth = (user, token, refreshToken) => {
  try {
    localStorage.setItem('auth-storage', JSON.stringify({
      state: { user, token, refreshToken }
    }))
  } catch (e) {
    console.error('Failed to save auth to localStorage', e)
  }
}

const initialState = loadAuth()

const useAuthStore = create((set, get) => ({
  user: initialState.user,
  token: initialState.token,
  refreshToken: initialState.refreshToken,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post('/auth/login', { email, password })
      const { user, token, refreshToken } = response.data
      set({
        user,
        token,
        refreshToken,
        loading: false,
        error: null
      })
      saveAuth(user, token, refreshToken)
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      set({ loading: false, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  signup: async (name, email, password, role) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post('/auth/signup', { name, email, password, role })
      const { user, token, refreshToken } = response.data
      set({
        user,
        token,
        refreshToken,
        loading: false,
        error: null
      })
      saveAuth(user, token, refreshToken)
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed'
      set({ loading: false, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  logout: () => {
    set({ user: null, token: null, refreshToken: null, error: null })
    localStorage.removeItem('auth-storage')
  },

  updateUser: (userData) => {
    const updatedUser = { ...get().user, ...userData }
    set({ user: updatedUser })
    const { token, refreshToken } = get()
    saveAuth(updatedUser, token, refreshToken)
  }
}))

export { useAuthStore }
export default useAuthStore

