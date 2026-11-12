import { defineStore } from 'pinia'
import api from '../api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,

    roleNames: (state) => (state.user?.roles || []).map((r) => r.name ?? r),

    isAdmin: (state) => (state.user?.roles || []).map((r) => r.name ?? r).includes('admin'),

    canEdit: (state) => {
      const roles = (state.user?.roles || []).map((r) => r.name ?? r)
      return roles.includes('admin') || roles.includes('editor')
    },
  },

  actions: {
    async login(email, password) {
      const res = await api.post('/login', { email, password })
      const user = res.data.user
      const roles = (user?.roles || []).map((r) => r.name ?? r)

      this.token = res.data.token
      this.user = user
      localStorage.setItem('token', this.token)
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    // Daftar akun baru: berstatus menunggu sampai disetujui admin (tanpa verifikasi email).
    async register({ name, email, company_code, password, password_confirmation }) {
      const res = await api.post('/register', { name, email, company_code, password, password_confirmation })
      return res.data
    },

    async updateProfile(name) {
      const res = await api.put('/me', { name })
      this.user = res.data
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    async updatePassword(current_password, password, password_confirmation) {
      await api.put('/me/password', { current_password, password, password_confirmation })
    },

    async fetchMe() {
      const res = await api.get('/me')
      this.user = res.data
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    async logout() {
      try {
        await api.post('/logout')
      } catch (e) {

      }
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})