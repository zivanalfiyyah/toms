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

    canEdit: (state) => {
      const roles = (state.user?.roles || []).map((r) => r.name ?? r)
      return roles.includes('admin') || roles.includes('editor')
    },
  },

  actions: {
    async login(email, password) {
      const res = await api.post('/login', { email, password })
      this.token = res.data.token
      this.user = res.data.user
      localStorage.setItem('token', this.token)
      localStorage.setItem('user', JSON.stringify(this.user))
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