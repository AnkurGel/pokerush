import { ref, computed } from 'vue'
import { useApi } from './useApi'
import { API_ENDPOINTS } from '../config/api'

// Shared auth state (singleton)
const user = ref(null)
const isInitialized = ref(false)

export function useAuth() {
  const { get, post, setToken, getToken, isLoading, error } = useApi()

  const isLoggedIn = computed(() => !!user.value)
  const isGuest = computed(() => !user.value)

  // Initialize auth state from stored token
  async function initialize() {
    if (isInitialized.value) return

    const token = getToken()
    if (token) {
      try {
        const userData = await get(API_ENDPOINTS.me)
        user.value = userData
      } catch (err) {
        // Token is invalid, clear it
        setToken(null)
        user.value = null
      }
    }
    isInitialized.value = true
  }

  // Register a new user
  async function register(email, password, displayName) {
    try {
      const result = await post(API_ENDPOINTS.register, {
        email,
        password,
        displayName,
      })
      setToken(result.token)
      user.value = result.user
      return result
    } catch (err) {
      throw err
    }
  }

  // Login with email/password
  async function login(email, password) {
    try {
      const result = await post(API_ENDPOINTS.login, { email, password })
      setToken(result.token)
      user.value = result.user
      return result
    } catch (err) {
      throw err
    }
  }

  // Logout
  async function logout() {
    try {
      await post(API_ENDPOINTS.logout)
    } catch (err) {
      // Ignore errors on logout
    }
    setToken(null)
    user.value = null
  }

  // Update display name
  async function updateDisplayName(displayName) {
    try {
      const updated = await post(`${API_ENDPOINTS.users}/me`, { displayName })
      user.value = { ...user.value, displayName: updated.displayName }
      return updated
    } catch (err) {
      throw err
    }
  }

  // Get current user
  async function getCurrentUser() {
    if (!getToken()) return null
    try {
      const userData = await get(API_ENDPOINTS.me)
      user.value = userData
      return userData
    } catch (err) {
      return null
    }
  }

  return {
    user,
    isLoggedIn,
    isGuest,
    isInitialized,
    isLoading,
    error,
    initialize,
    register,
    login,
    logout,
    updateDisplayName,
    getCurrentUser,
  }
}
