import { ref } from 'vue'

const STORAGE_KEY = 'berkeley-contributor-auth'
const PASSWORD = import.meta.env.VITE_CONTRIBUTOR_PASSWORD || 'password'

const isAuthenticated = ref(sessionStorage.getItem(STORAGE_KEY) === 'true')

export function useAuth() {
  function login(password) {
    if (password === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      isAuthenticated.value = true
      return true
    }
    return false
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY)
    isAuthenticated.value = false
  }

  return { isAuthenticated, login, logout }
}
