import { defineStore } from 'pinia'
import api from '../api'

// ============================================================================
// KONTRAK API (asumsi) — konfirmasi & sesuaikan dengan backend temanmu:
//
// GET  /categories
//   -> Array kategori berisi nested pages & children (untuk sidebar, breadcrumb,
//      navigasi sebelumnya/selanjutnya, dan pencarian lokal). Tidak perlu
//      menyertakan "content" penuh di level ini, cukup ringan:
//      [{ id, title, slug, icon, description, order,
//         pages: [{ id, title, slug, description,
//                   children: [{ id, title, slug, description }] }] }]
//
// GET  /pages/:id
//   -> Detail lengkap satu halaman child, termasuk isi Tiptap/ProseMirror JSON:
//      { id, title, status, content: { type: 'doc', content: [...] } }
//
// PUT  /pages/:id   (dipakai di EditPage.vue)
//   -> Body: { title, status, content } ; mengembalikan halaman yang sudah disimpan.
//
// Kalau kontrak backend temanmu beda (nama field/endpoint), cukup ubah di file
// ini saja (fetchCategories & fetchPage) — komponen lain tidak perlu diubah.
// ============================================================================

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
    // Level 1: Ambil data kategori berdasarkan slug
    categoryBySlug: (state) => (slug) => {
      return state.categories.find((c) => c.slug === slug) || null
    },

    // Level 2: Ambil data subbab (page) berdasarkan slug kategori & page
    pageBySlug: (state) => (catSlug, pageSlug) => {
      const cat = state.categories.find((c) => c.slug === catSlug)
      return cat?.pages?.find((p) => p.slug === pageSlug) || null
    },

    // Level 2.5: Meratakan seluruh page (subbab) lintas kategori untuk navigasi sebelumnya/selanjutnya
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

    // Level 3: Meratakan seluruh anak subbab (child) untuk kebutuhan pencarian / navigasi
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
    // Memuat struktur navigasi (kategori > page > child) dari backend.
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

    // Memuat isi lengkap satu halaman child berdasarkan slug 3-level (category/page/child).
    // Kategori perlu sudah dimuat dulu untuk menemukan id halaman yang dicari.
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

    // Pencarian lokal berbasis kategori yang sudah dimuat (tidak perlu endpoint /search terpisah).
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