// Indeks pencarian judul untuk seluruh pohon dokumentasi (kategori + halaman
// dengan level tidak terbatas). Murni fungsi, tanpa akses jaringan.

const LEVEL_LABELS = ['Halaman', 'Sub Halaman', 'Sub-sub Halaman']

export const MAX_RESULTS = 50

/**
 * Meratakan pohon [{ id, name, slug, pages: [node] }] menjadi daftar entri
 * yang siap dicari. Node yang anaknya belum dimuat (children undefined)
 * tetap ikut; anaknya menyusul saat sudah tersedia.
 */
export function buildIndex(tree) {
  const out = []
  for (const cat of tree || []) {
    out.push({
      key: `c-${cat.id}`,
      title: cat.name || '',
      type: 'Kategori',
      trail: '',
      path: cat.slug
    })

    const walk = (nodes, slugs, trail, depth) => {
      for (const node of nodes || []) {
        const nextSlugs = [...slugs, node.slug]
        out.push({
          key: `p-${node.id}`,
          title: node.title || '',
          type: LEVEL_LABELS[depth] ?? `Level ${depth + 1}`,
          trail: [cat.name, ...trail].join(' › '),
          path: `${cat.slug}/${nextSlugs.join('/')}`
        })
        walk(node.children, nextSlugs, [...trail, node.title], depth + 1)
      }
    }
    walk(cat.pages, [], [], 0)
  }
  return out
}

export function tokenize(query) {
  return String(query || '').toLowerCase().split(/\s+/).filter(Boolean)
}

/**
 * Cocokkan judul: semua kata pada kueri harus ada di judul (urutan bebas).
 * Urutan hasil: judul diawali frasa > memuat frasa utuh > memuat semua kata,
 * lalu mengikuti urutan dokumen.
 */
export function searchIndex(index, query, limit = MAX_RESULTS) {
  const tokens = tokenize(query)
  if (!tokens.length) return []
  const phrase = tokens.join(' ')

  const scored = []
  for (let i = 0; i < index.length; i++) {
    const item = index[i]
    const title = item.title.toLowerCase()
    if (!tokens.every((t) => title.includes(t))) continue
    const score = title.startsWith(phrase) ? 0 : title.includes(phrase) ? 1 : 2
    scored.push({ item, score, i })
  }
  scored.sort((a, b) => a.score - b.score || a.i - b.i)
  return scored.slice(0, limit).map((s) => s.item)
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Pecah judul menjadi potongan { text, hit } untuk penyorotan kata yang cocok. */
export function highlightParts(title, query) {
  const text = String(title || '')
  const tokens = tokenize(query)
  if (!tokens.length) return [{ text, hit: false }]
  const re = new RegExp(`(${tokens.map(escapeRe).join('|')})`, 'gi')
  return text
    .split(re)
    .filter((s) => s !== '')
    .map((s) => ({ text: s, hit: tokens.includes(s.toLowerCase()) }))
}
