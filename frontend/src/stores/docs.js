import { defineStore } from 'pinia'
import { categories, pageContents } from '../data/mockDocs'

export const useDocsStore = defineStore('docs', {
  state: () => ({
    categories: [],
    currentPage: null,
    loading: false,
    searchQuery: '',
    searchResults: []
  }),

  getters: {
    // Cari data kategori (termasuk daftar pages-nya) berdasarkan slug
    categoryBySlug: (state) => (slug) => {
      return state.categories.find((c) => c.slug === slug) || null
    },

    // Daftar semua halaman berurutan lintas kategori, dipakai untuk prev/next
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
    fetchCategories() {
      this.loading = true
      this.categories = categories
      this.loading = false
    },

    fetchPage(categorySlug, pageSlug) {
      this.loading = true
      const key = `${categorySlug}/${pageSlug}`
      this.currentPage = pageContents[key] || null
      this.loading = false
    },

    search(query) {
      this.searchQuery = query
      if (!query.trim()) {
        this.searchResults = []
        return
      }
      const q = query.toLowerCase()
      const results = []
      for (const [path, page] of Object.entries(pageContents)) {
        const plainText = extractText(page.content).toLowerCase()
        if (page.title.toLowerCase().includes(q) || plainText.includes(q)) {
          results.push({ path, title: page.title, snippet: makeSnippet(plainText, q) })
        }
      }
      this.searchResults = results
    }
  }
})

function extractText(node) {
    if (!node) return ''
    let text = node.text || ''
    if (node.content) for (const child of node.content) text += ' ' + extractText(child)
    return text
}

function makeSnippet(text, query) {
    const idx = text.indexOf(query)
    if (idx === -1) return text.substring(0, 80)
    return text.substring(Math.max(0, idx - 30), idx + 60)
}