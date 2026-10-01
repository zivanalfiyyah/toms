import { defineStore } from 'pinia'
import api from '../api'
import { useTocStore } from './toc'

// Data untuk pencarian di panel admin. Sengaja TIDAK memakai useAdminStore /
// useDocsStore, supaya state halaman admin lain (Pengguna, Permintaan Akses,
// Kategori) tidak ikut berubah (mis. flag loading atau error).

const FRESH_MS = 60 * 1000 // pengguna & permintaan akses dianggap segar 1 menit
const TREE_TTL_MS = 5 * 60 * 1000 // pohon halaman (lihat stores/toc.js)

export const useAdminSearchStore = defineStore('adminSearch', {
  state: () => ({
    users: [],
    requests: [],
    categories: [],
    loading: false,
    loadedAt: 0,
    failed: [] // nama sumber data yang gagal dimuat
  }),

  actions: {
    async load({ isAdmin = false, force = false } = {}) {
      const toc = useTocStore()
      const fresh = this.loadedAt && Date.now() - this.loadedAt < FRESH_MS
      if (!force && (this.loading || fresh)) return

      this.loading = true
      this.failed = []
      try {
        const jobs = [
          api.get('/categories').then((res) => {
            this.categories = res.data.data || res.data
          })
        ]
        const names = ['Kategori & halaman']
        // Pengguna & permintaan akses hanya boleh diakses admin.
        if (isAdmin) {
          jobs.push(api.get('/users').then((res) => { this.users = res.data }))
          names.push('Pengguna')
          jobs.push(api.get('/access-requests').then((res) => { this.requests = res.data }))
          names.push('Permintaan akses')
        }
        const results = await Promise.allSettled(jobs)
        this.failed = names.filter((_, i) => results[i].status === 'rejected')
        this.loadedAt = Date.now()
      } finally {
        this.loading = false
      }

      // Halaman di semua level dimuat bertahap di belakang layar.
      toc.load(this.categories, { force, ttl: TREE_TTL_MS })
    }
  }
})
