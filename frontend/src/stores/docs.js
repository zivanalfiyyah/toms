import { defineStore } from 'pinia'
import api from '../api'

export const useDocsStore = defineStore('docs', {
  state: () => ({
    categories: [],
    currentPage: null,
    loading: false,
    error: null,
    searchQuery: '',
    searchResults: []
  }),

  getters: {
    categoryBySlug: (state) => (slug) => {
      return state.categories.find((c) => c.slug === slug) || null
    },

    pageBySlug: (state) => (catSlug, pageSlug) => {
      const cat = state.categories.find((c) => c.slug === catSlug)
      return cat?.pages?.find((p) => p.slug === pageSlug) || null
    },

    flatCategoryPages: (state) => {
      const result = []
      for (const cat of state.categories) {
        for (const page of cat.pages || []) {
          result.push({
            ...page,
            categorySlug: cat.slug
          })
        }
      }
      return result
    },

    flatPages: (state) => {
      const result = []
      for (const cat of state.categories) {
        for (const page of cat.pages || []) {
          for (const child of page.children || []) {
            result.push({
              ...child,
              categorySlug: cat.slug,
              pageSlug: page.slug
            })
          }
        }
      }
      return result
    }
  },

  actions: {
    async fetchCategories() {
      this.loading = true
      this.error = null
      try {
        const res = await api.get('/categories')
        this.categories = res.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat daftar kategori. Pastikan backend menyala.'
        this.categories = []
      } finally {
        this.loading = false
      }
    },

    async fetchPage(categorySlug, pageSlug, childSlug) {
      this.loading = true
      this.error = null
      this.currentPage = null
      try {
        if (!this.categories.length) {
          await this.fetchCategories()
        }
        const child = this.flatPages.find(
          (c) => c.categorySlug === categorySlug && c.pageSlug === pageSlug && c.slug === childSlug
        )
        if (!child) {
          this.error = 'Halaman tidak ditemukan.'
          return
        }
        const res = await api.get(`/pages/${child.id}`)
        this.currentPage = res.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat halaman.'
      } finally {
        this.loading = false
      }
    },

    search(query) {
      this.searchQuery = query
      if (!query.trim()) {
        this.searchResults = []
        return
      }

      const q = query.toLowerCase()
      const allPages = this.flatPages

      this.searchResults = allPages.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      )
    }
  }
})