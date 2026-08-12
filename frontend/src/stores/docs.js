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
      function walk(pages, categorySlug, parentSlugs) {
        for (const page of pages || []) {
          const slugs = [...parentSlugs, page.slug]
          result.push({
            ...page,
            categorySlug,
            fullPath: slugs.join('/')
          })
          if (page.children && page.children.length) {
            walk(page.children, categorySlug, slugs)
          }
        }
      }
      for (const cat of state.categories) {
        walk(cat.pages, cat.slug, [])
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

    async fetchPageByPath(categorySlug, slugs) {
      this.loading = true
      this.error = null
      this.currentPage = null
      try {
        if (!this.categories.length) {
          await this.fetchCategories()
        }
        const cat = this.categoryBySlug(categorySlug)
        if (!cat) {
          this.error = 'Kategori tidak ditemukan.'
          return
        }
        if (!slugs || slugs.length === 0) {
          this.error = 'Halaman tidak ditemukan.'
          return
        }

        // level 1: a page directly under the category
        let node = cat.pages?.find((p) => p.slug === slugs[0])
        if (!node) {
          this.error = 'Halaman tidak ditemukan.'
          return
        }

        for (let i = 1; i < slugs.length; i++) {
          if (!node.children) {
            const res = await api.get(`/pages/${node.id}`)
            node.children = res.data.children || []
          }
          const next = node.children.find((c) => c.slug === slugs[i])
          if (!next) {
            this.error = 'Halaman tidak ditemukan.'
            return
          }
          node = next
        }

        const res = await api.get(`/pages/${node.id}`)
        node.content_html = res.data.content_html
        node.content = res.data.content
        if (res.data.children) node.children = res.data.children
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