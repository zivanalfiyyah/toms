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

    // Recursively flattens the whole tree (as deep as what's currently
    // loaded in `categories`, i.e. category -> pages -> children).
    // NOTE: this still can't see levels deeper than what /categories
    // returns (currently 2 levels under category). Prev/Next pager
    // will only be fully accurate for pages within that depth. Making
    // it accurate at every depth requires either the backend to return
    // the full nested tree from /categories, or a dedicated flatten
    // endpoint — flagging this as a follow-up, not silently faking it.
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

    // Resolves a page at ANY depth by walking the slug chain one level
    // at a time. Levels already present in `categories` (page + its
    // direct children) are matched locally with no extra request.
    // Once we run out of locally-known children, we fetch that node's
    // full record (which includes ITS children) and keep walking —
    // repeating for however many levels deep the URL goes.
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

        // walk the rest of the chain, fetching on demand whenever the
        // current node's children haven't been loaded locally yet.
        // IMPORTANT: we mutate `node.children` in place (instead of
        // replacing `node` with a fresh object) so the fetched data
        // gets permanently attached to the same object living inside
        // `this.categories`. That's what lets `flatPages` (and the
        // prev/next pager) see levels deeper than what /categories
        // originally returned.
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

        // always fetch the final node's full record so we have its
        // content_html AND its own children (for the Subbab list).
        // Same in-place approach: attach children onto `node` itself
        // rather than discarding it, so it's cached for next time too.
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