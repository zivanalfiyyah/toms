import { defineStore } from 'pinia'
import api from '../api'

// Halaman yang disukai pengguna yang sedang login.
export const useLikesStore = defineStore('likes', {
  state: () => ({ items: [], loaded: false }),

  getters: {
    count: (state) => state.items.length,
    ids: (state) => new Set(state.items.map((i) => i.id)),
  },

  actions: {
    async fetch() {
      const res = await api.get('/me/likes')
      this.items = res.data
      this.loaded = true
    },
    async like(pageId) {
      const res = await api.post(`/pages/${pageId}/like`)
      await this.fetch()
      return res.data
    },
    async unlike(pageId) {
      const res = await api.delete(`/pages/${pageId}/like`)
      this.items = this.items.filter((i) => i.id !== pageId)
      return res.data
    },
    reset() {
      this.items = []
      this.loaded = false
    },
  },
})
