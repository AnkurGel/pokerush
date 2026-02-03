import { ref } from 'vue'
import { API_BASE_URL } from '../config/api'

// Shared state for API calls
const isLoading = ref(false)
const error = ref(null)

export function useApi() {
  // Get the stored JWT token
  function getToken() {
    return localStorage.getItem('pokerush-token')
  }

  // Set the JWT token
  function setToken(token) {
    if (token) {
      localStorage.setItem('pokerush-token', token)
    } else {
      localStorage.removeItem('pokerush-token')
    }
  }

  // Make an API request
  async function request(endpoint, options = {}) {
    const token = getToken()
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const url = `${API_BASE_URL}${endpoint}`

    try {
      isLoading.value = true
      error.value = null

      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error ${response.status}`)
      }

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // GET request
  async function get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params).toString()
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint
    return request(url, { method: 'GET' })
  }

  // POST request
  async function post(endpoint, body = {}) {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  // PUT request
  async function put(endpoint, body = {}) {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  // DELETE request
  async function del(endpoint) {
    return request(endpoint, { method: 'DELETE' })
  }

  // Check if we're online
  function isOnline() {
    return navigator.onLine
  }

  return {
    isLoading,
    error,
    getToken,
    setToken,
    get,
    post,
    put,
    del,
    isOnline,
  }
}
