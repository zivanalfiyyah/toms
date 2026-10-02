import { defineStore } from 'pinia'
import api from '../api'

// Pohon Daftar Isi lengkap (level halaman tidak terbatas).
//
// Endpoint /categories hanya memuat halaman + satu tingkat sub-halaman.
// Untuk level yang lebih dalam, store ini meniru cara panel admin:
// memanggil GET /pages/{id} untuk tiap halaman yang anaknya belum dimuat,
// lalu mengulanginya ke bawah sampai tidak ada lagi anak.
//
// Store ini bekerja pada SALINAN data (bukan docsStore.categories), jadi
// sidebar, pencarian, dan halaman dokumen tidak terpengaruh sama sekali.

const CONCURRENCY = 8
const TTL_MS = 2 * 60 * 1000 // pohon dianggap segar selama 2 menit

function toNode(p) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    // undefined = anak belum dimuat; array (boleh kosong) = sudah dimuat
    children: Array.isArray(p.children) ? p.children.map(toNode) : undefined
  }
}

export const useTocStore = defineStore('toc', {
  state: () => ({
    tree: [], // [{ id, name, slug, icon, pages: [node] }]
    pending: 0, // jumlah halaman yang anaknya masih antre / sedang dimuat
    failed: 0, // jumlah halaman yang gagal dimuat anaknya
    loadedAt: 0,
    runId: 0
  }),

  actions: {
    async load(categories, { force = false, ttl = TTL_MS } = {}) {
      const fresh = this.tree.length && Date.now() - this.loadedAt < ttl
      if (!force && (this.pending > 0 || fresh)) return

      const runId = ++this.runId
      this.failed = 0
      this.loadedAt = Date.now()
      this.tree = (categories || []).map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        pages: (cat.pages || []).map(toNode)
      }))

      // Kumpulkan semua node yang anaknya belum dimuat (lewat proxy reaktif).
      const seen = new Set()
      const queue = []
      const walk = (nodes) => {
        for (const n of nodes) {
          if (seen.has(n.id)) {
            // id ganda (data tidak wajar): jangan biarkan penanda "memuat" menyala terus
            if (n.children === undefined) n.children = []
            continue
          }
          seen.add(n.id)
          if (n.children === undefined) queue.push(n)
          else walk(n.children)
        }
      }
      for (const cat of this.tree) walk(cat.pages)
      this.pending = queue.length

      const worker = async () => {
        while (queue.length && runId === this.runId) {
          const node = queue.shift()
          try {
            const res = await api.get(`/pages/${node.id}`)
            if (runId !== this.runId) return
            const kids = (res.data.children || [])
              .filter((k) => !seen.has(k.id)) // cegah siklus data
              .map(toNode)
            kids.forEach((k) => seen.add(k.id))
            node.children = kids
            // node.children sekarang berupa proxy reaktif
            for (const kid of node.children) queue.push(kid)
            this.pending += kids.length
          } catch (err) {
            if (runId !== this.runId) return
            node.children = []
            this.failed += 1
          } finally {
            if (runId === this.runId) this.pending -= 1
          }
        }
      }

      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker))
    }
  }
})
