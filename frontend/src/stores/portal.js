import { defineStore } from 'pinia'
import api from '../api'
import { contact as defaultContact } from '../data/contact'
import { faqTopics as defaultFaq } from '../data/faq'
import { babTopics as defaultBab } from '../data/babTopics'

// Konten portal yang dikelola admin. Bila admin belum mengisi, dipakai isi bawaan di kode.
export const usePortalStore = defineStore('portal', {
  state: () => ({
    settings: { contact: null, faq: null, bab_topics: null },
    loaded: false,
    loading: null,
  }),

  getters: {
    contact: (s) => ({ ...defaultContact, ...(s.settings.contact || {}) }),
    faqTopics: (s) => s.settings.faq || defaultFaq,
    babTopics: (s) => s.settings.bab_topics || defaultBab,
  },

  actions: {
    async load(force = false) {
      if (this.loaded && !force) return
      if (this.loading) return this.loading
      this.loading = api
        .get('/settings')
        .then((res) => {
          this.settings = { contact: null, faq: null, bab_topics: null, ...res.data }
          this.loaded = true
        })
        .catch(() => {
          // Backend belum siap: tetap tampil dengan isi bawaan.
        })
        .finally(() => { this.loading = null })
      return this.loading
    },
    async save(key, value) {
      const res = await api.put(`/settings/${key}`, { value })
      this.settings[key] = res.data[key]
    },
    async reset(key) {
      await api.delete(`/settings/${key}`)
      this.settings[key] = null
    },
  },
})
