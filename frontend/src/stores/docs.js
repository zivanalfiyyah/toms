import { defineStore } from 'pinia'

const API_URL = import.meta.env.VITE_API_BASE_URL

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
        const res = await fetch(`${API_URL}/categories`)
        this.categories = await res.json()
      } catch (e) {
        console.error('Gagal mengambil kategori:', e)
      }
      this.loading = false
    },

    async fetchPage(categorySlug, pageSlug) {
      this.loading = true
      if (!this.categories.length) {
        await this.fetchCategories()
      }
      const cat = this.categoryBySlug(categorySlug)
      this.currentPage = cat?.pages?.find(p => p.slug === pageSlug) || null
      this.loading = false
    },

    async search(query) {
      this.searchQuery = query
      if (!query.trim()) {
        this.searchResults = []
        return
      }
      try {
        const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`)
        this.searchResults = await res.json()
      } catch (e) {
        console.error('Gagal mencari:', e)
        this.searchResults = []
      }
    }
  }
})