import { defineStore } from 'pinia'
import api from '../api'

// Cari page dengan id tertentu di pohon pages (termasuk children di level
// manapun), bukan cuma level pertama. Dipakai createPage/updatePage supaya
// tetap kerja untuk halaman yang sudah nested (mis. "Standar Pool" yang
// sendirinya adalah child dari page lain).
function findPageDeep(pages, id) {
  for (const p of pages || []) {
    if (p.id === id) return p
    const found = findPageDeep(p.children, id)
    if (found) return found
  }
  return null
}

// Hapus page dengan id tertentu dari pohon pages di level manapun (in-place).
// Return true kalau ketemu & terhapus.
function removePageDeep(pages, id) {
  if (!pages) return false
  const idx = pages.findIndex((p) => p.id === id)
  if (idx !== -1) {
    pages.splice(idx, 1)
    return true
  }
  for (const p of pages) {
    if (removePageDeep(p.children, id)) return true
  }
  return false
}

export const useAdminStore = defineStore('admin', {
  state: () => ({
    stats: null,
    statsLoading: false,

    users: [],
    usersLoading: false,

    categories: [],
    categoriesLoading: false,

    importSubmitting: false,

    accessRequests: [],
    accessRequestsLoading: false,

    error: null,
  }),

  actions: {
    async fetchStats() {
      this.statsLoading = true
      this.error = null
      try {
        const res = await api.get('/stats')
        this.stats = res.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat statistik dashboard.'
      } finally {
        this.statsLoading = false
      }
    },

    async fetchUsers() {
      this.usersLoading = true
      this.error = null
      try {
        const res = await api.get('/users')
        this.users = res.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat daftar user.'
      } finally {
        this.usersLoading = false
      }
    },

    async createUser(payload) {
      const res = await api.post('/users', payload)
      this.users.unshift(res.data)
      return res.data
    },

    async updateUser(id, payload) {
      const res = await api.put(`/users/${id}`, payload)
      const idx = this.users.findIndex((u) => u.id === id)
      if (idx !== -1) this.users[idx] = res.data
      return res.data
    },

    async deleteUser(id) {
      await api.delete(`/users/${id}`)
      this.users = this.users.filter((u) => u.id !== id)
    },

    async fetchCategories() {
      this.categoriesLoading = true
      this.error = null
      try {
        const res = await api.get('/categories')
        this.categories = res.data.data || res.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat kategori.'
      } finally {
        this.categoriesLoading = false
      }
    },

    // insertBeforeId opsional: kalau diisi, kategori baru disisipkan tepat
    // sebelum kategori dengan id tsb, dan semua kategori dari posisi itu
    // ke bawah digeser +1. Kalau tidak diisi, behavior lama tetap jalan
    // (selalu ditambahkan di paling bawah).
    async createCategory(payload, insertBeforeId = null) {
      let order

      if (insertBeforeId) {
        const sorted = [...this.categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        const targetIdx = sorted.findIndex((c) => c.id === insertBeforeId)

        if (targetIdx !== -1) {
          order = sorted[targetIdx].order ?? targetIdx + 1
          // Geser kategori dari posisi target ke bawah, +1 semua, lewat
          // endpoint update kategori yang sudah ada (tidak nebak endpoint baru).
          for (const cat of sorted.slice(targetIdx)) {
            const newOrder = (cat.order ?? 0) + 1
            await api.put(`/categories/${cat.id}`, {
              name: cat.name,
              slug: cat.slug,
              icon: cat.icon,
              order: newOrder,
            })
            cat.order = newOrder
          }
        }
      }

      if (order === undefined) {
        order = this.categories.length
          ? Math.max(...this.categories.map((c) => c.order ?? 0)) + 1
          : 1
      }

      const res = await api.post('/categories', { ...payload, order })
      await this.fetchCategories()
      return res.data
    },

    async updateCategory(id, payload) {
      const res = await api.put(`/categories/${id}`, payload)
      const idx = this.categories.findIndex((c) => c.id === id)
      if (idx !== -1) this.categories[idx] = res.data
      return res.data
    },

    // Tukar posisi (order) kategori dengan tetangganya (naik/turun satu
    // langkah). Pakai endpoint update kategori yang sudah ada, cuma
    // ganti field order-nya saja. Setelah itu ambil ulang data dari
    // server (bukan cuma ubah state lokal) supaya kalau backend diam-diam
    // menolak field order, tampilan tidak "bohong" bilang berhasil.
    async reorderCategory(id, direction) {
      const sorted = [...this.categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      const idx = sorted.findIndex((c) => c.id === id)
      if (idx === -1) return

      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= sorted.length) return

      const a = sorted[idx]
      const b = sorted[swapIdx]
      const aOrder = a.order
      const bOrder = b.order

      await Promise.all([
        api.put(`/categories/${a.id}`, { name: a.name, slug: a.slug, icon: a.icon, order: bOrder }),
        api.put(`/categories/${b.id}`, { name: b.name, slug: b.slug, icon: b.icon, order: aOrder }),
      ])

      await this.fetchCategories()

      const stillWrongOrder = (() => {
        const refreshedA = this.categories.find((c) => c.id === a.id)
        const refreshedB = this.categories.find((c) => c.id === b.id)
        if (!refreshedA || !refreshedB) return false
        return direction === 'up'
          ? (refreshedA.order ?? 0) >= (refreshedB.order ?? 0)
          : (refreshedA.order ?? 0) <= (refreshedB.order ?? 0)
      })()

      if (stillWrongOrder) {
        throw new Error(
          'Urutan tidak tersimpan di server — backend tampaknya belum mendukung update field "order" pada kategori.'
        )
      }
    },

    // Pindahkan kategori yang sudah ada ke posisi tepat sebelum kategori
    // lain (bisa lompat berapa langkah pun, bukan cuma tetangga terdekat
    // seperti reorderCategory). Dipakai dari modal Edit Kategori.
    async moveCategoryTo(id, beforeId) {
      if (!beforeId || beforeId === id) return

      const sorted = [...this.categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      const moving = sorted.find((c) => c.id === id)
      const target = sorted.find((c) => c.id === beforeId)
      if (!moving || !target) return

      const rest = sorted.filter((c) => c.id !== id)
      const targetIdx = rest.findIndex((c) => c.id === beforeId)
      if (targetIdx === -1) return
      rest.splice(targetIdx, 0, moving)

      // Hitung urutan baru berurutan, lalu cuma kirim update untuk yang
      // order-nya benar-benar berubah (pakai endpoint update yang sudah ada).
      for (let i = 0; i < rest.length; i++) {
        const cat = rest[i]
        const newOrder = i + 1
        if ((cat.order ?? 0) !== newOrder) {
          await api.put(`/categories/${cat.id}`, {
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            order: newOrder,
          })
        }
      }

      await this.fetchCategories()

      const refreshedMoving = this.categories.find((c) => c.id === id)
      const refreshedTarget = this.categories.find((c) => c.id === beforeId)
      if (
        refreshedMoving &&
        refreshedTarget &&
        (refreshedMoving.order ?? 0) >= (refreshedTarget.order ?? 0)
      ) {
        throw new Error(
          'Posisi tidak tersimpan di server — backend tampaknya belum mendukung update field "order" pada kategori.'
        )
      }
    },

    async deleteCategory(id) {
      await api.delete(`/categories/${id}`)
      this.categories = this.categories.filter((c) => c.id !== id)
    },

    async createPage(categoryId, payload) {
      const emptyDoc = { type: 'doc', content: [{ type: 'paragraph' }] }
      const res = await api.post('/pages', {
        ...payload,
        category_id: categoryId,
        parent_id: payload.parent_id ?? null,
        content: emptyDoc,
        content_html: '<p></p>',
        content_text: '',
        status: 'draft',
      })
      const cat = this.categories.find((c) => c.id === categoryId)
      if (cat) {
        if (payload.parent_id) {
          // Cari parent-nya di level manapun (bukan cuma cat.pages
          // langsung), supaya bisa nambah sub halaman ke page yang
          // sudah nested (mis. "Standar Pool" yang sendirinya child).
          const parent = findPageDeep(cat.pages, payload.parent_id)
          if (parent) {
            parent.children = parent.children || []
            parent.children.push(res.data)
          }
        } else {
          cat.pages = cat.pages || []
          cat.pages.push(res.data)
        }
      }
      return res.data
    },

    async updatePage(id, payload) {
      const res = await api.put(`/pages/${id}`, payload)
      for (const cat of this.categories) {
        const existing = findPageDeep(cat.pages, id)
        if (existing) Object.assign(existing, res.data)
      }
      return res.data
    },

    async deletePage(id) {
      await api.delete(`/pages/${id}`)
      for (const cat of this.categories) {
        removePageDeep(cat.pages, id)
      }
    },
    async loadPageChildren(page) {
      if (page.children !== undefined) return
      try {
        const res = await api.get(`/pages/${page.id}`)
        page.children = res.data.children || []
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat sub halaman.'
      }
    },
    async importDocx({ file, categoryId, title, slug, parentId }) {
      this.importSubmitting = true
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category_id', categoryId)
        formData.append('title', title)
        // Kirim slug eksplisit dari frontend supaya tidak bergantung
        // sepenuhnya pada auto-generate di backend (ini penyebab bug
        // slug kosong sebelumnya, mis. halaman "Customer Experience").
        if (slug) formData.append('slug', slug)
        if (parentId) formData.append('parent_id', parentId)

        const res = await api.post('/pages/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        return res.data
      } finally {
        this.importSubmitting = false
      }
    },

    async reimportDocx(pageId, { file, categoryId, title, slug }) {
      this.importSubmitting = true
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('_method', 'PUT')
        if (categoryId) formData.append('category_id', categoryId)
        if (title) formData.append('title', title)
        if (slug) formData.append('slug', slug)

        const res = await api.post(`/pages/${pageId}/import`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        return res.data
      } finally {
        this.importSubmitting = false
      }
    },

    // Import docx sebagai konten kategori itu sendiri (bukan page).
    // Asumsi endpoint backend: POST /categories/:id/import (pakai
    // _method=PUT via FormData, sama seperti pola reimportDocx di atas).
    // Kalau nama endpoint backend beda, cukup ganti path di bawah ini.
    async importDocxToCategory(categoryId, { file }) {
      this.importSubmitting = true
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('_method', 'PUT')

        const res = await api.post(`/categories/${categoryId}/import`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        const idx = this.categories.findIndex((c) => c.id === categoryId)
        if (idx !== -1) this.categories[idx] = { ...this.categories[idx], ...res.data }
        return res.data
      } finally {
        this.importSubmitting = false
      }
    },

    async fetchAccessRequests() {
      this.accessRequestsLoading = true
      this.error = null
      try {
        const res = await api.get('/access-requests')
        this.accessRequests = res.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat permintaan akses.'
      } finally {
        this.accessRequestsLoading = false
      }
    },

    async rejectAccessRequest(id) {
      await api.post(`/access-requests/${id}/reject`)
      const idx = this.accessRequests.findIndex((r) => r.id === id)
      if (idx !== -1) this.accessRequests[idx].status = 'rejected'
    },

    async inviteFromAccessRequest(id, role) {
      this.importSubmitting = true
      try {
        await api.post(`/access-requests/${id}/invite`, { role })
        const idx = this.accessRequests.findIndex((r) => r.id === id)
        if (idx !== -1) this.accessRequests[idx].status = 'invited'
      } finally {
        this.importSubmitting = false
      }
    },

  },
})