import { defineStore } from 'pinia'
import api from '../api'

export const useDocsStore = defineStore('docs', {
  state: () => ({
    categories: [],
    currentPage: null,
    loading: false,
    searchQuery: '',
    searchResults: []
  }),

  getters: {
    categoryBySlug: (state) => (slug) => {
      return state.categories.find((c) => c.slug === slug) || null
    },

    flatPages: (state) => {
      const result = []
      for (const cat of state.categories) {
        for (const page of cat.pages) {
          result.push({ ...page, categorySlug: cat.slug })
        }
      }
      return result
    }
  },

  actions: {
    async fetchCategories() {
      this.loading = true
      try {
        const res = await api.get('/categories')
        this.categories = res.data
      } catch (e) {
        console.error('Gagal mengambil kategori:', e)
      }
      this.loading = false
    },

    async fetchPage(categorySlug, pageSlug) {
      this.loading = true
      try {
        const res = await api.get(`/docs/${categorySlug}/${pageSlug}`)
        this.currentPage = res.data
      } catch (e) {
        console.error('Gagal mengambil halaman:', e)
        this.currentPage = null
      }
      this.loading = false
    },

    async search(query) {
      this.searchQuery = query
      if (!query.trim()) {
        this.searchResults = []
        return
      }
      try {
        const res = await api.get('/search', { params: { q: query } })
        this.searchResults = res.data
      } catch (e) {
        console.error('Gagal mencari:', e)
        this.searchResults = []
      }
    }
  }
})