// Utility bersama untuk mem-parsing heading (H1-H6) dari HTML hasil Tiptap.
//
// Sebelumnya ada 2 implementasi terpisah yang saling tidak sinkron:
//  - TiptapRenderer.vue menyuntik id heading dari string `content_html`
//  - TableOfContents.vue membaca heading dari JSON `content` (field lain,
//    kadang kosong/basi, dan cuma level teratas yang dibaca)
// Akibatnya sidebar "Pada halaman ini" sering kosong padahal heading-nya
// ada, atau linknya nyasar kalau ada heading dengan teks yang sama persis.
//
// Modul ini menyatukan logикanya di satu tempat: id yang disuntik ke HTML
// yang tampil dan id yang dipakai di link sidebar SELALU sama, karena
// berasal dari fungsi & pemanggilan yang sama persis.

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function stripTags(html) {
  return String(html || '').replace(/<[^>]+>/g, '').trim()
}

// Entity HTML paling umum muncul di heading (terutama hasil import dari
// Word yang sering menulis "&" sebagai "&amp;"). stripTags() di atas cuma
// membuang TAG, bukan men-decode entity — tanpa ini, teks "Data & Komponen"
// akan tampil literal sebagai "Data &amp; Komponen" di sidebar TOC (karena
// Vue meng-escape lagi "&"-nya saat interpolasi teks).
function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

// Membangun tree heading yang BENAR-BENAR berjenjang: H2 jadi anak dari H1
// terdekat sebelumnya, H3 jadi anak dari H2 terdekat sebelumnya, dst —
// bukan cuma 2 lapis (level teratas vs "sisanya diratakan").
//
// Pakai algoritma stack: setiap heading baru mencari "induk" dengan level
// LEBIH KECIL (lebih tinggi di hierarki) yang paling akhir dilihat. Kalau
// tidak ada, dia jadi node akar baru.
function buildTree(flat) {
  if (!flat.length) return []
  const root = []
  const stack = [] // { level, node }

  for (const h of flat) {
    const node = { ...h, children: [] }

    while (stack.length && stack[stack.length - 1].level >= h.level) {
      stack.pop()
    }

    if (stack.length === 0) {
      root.push(node)
    } else {
      stack[stack.length - 1].node.children.push(node)
    }

    stack.push({ level: h.level, node })
  }

  return root
}

/**
 * Mengumpulkan semua id heading di dalam tree secara rekursif (semua
 * kedalaman), dengan urutan sesuai urutan tampil di dokumen. Dipakai untuk
 * fitur "heading aktif saat scroll" supaya tetap jalan sampai H3, bukan
 * cuma 2 level teratas.
 */
export function flattenHeadingIds(tree) {
  const ids = []
  for (const node of tree) {
    ids.push(node.id)
    if (node.children?.length) ids.push(...flattenHeadingIds(node.children))
  }
  return ids
}

/**
 * Menyuntik id unik ke setiap tag <h1>-<h6> di dalam string HTML, dan
 * sekaligus mengembalikan daftar headingnya (flat + tersusun/tree) untuk
 * dipakai membangun navigasi "Pada halaman ini".
 *
 * - Heading dengan teks yang sama persis (mis. banyak heading "Definisi")
 *   tetap mendapat id unik: definisi, definisi-2, definisi-3, dst — supaya
 *   anchor link-nya tidak saling menimpa.
 * - Berbeda dari implementasi lama, ini juga menangkap heading yang punya
 *   atribut (mis. hasil import Word: <h2 style="...">), bukan cuma <h2>
 *   polos.
 *
 * @param {string} html - HTML mentah (content_html)
 * @returns {{ html: string, headings: Array }}
 */
export function extractHeadings(html) {
  if (!html || typeof html !== 'string') {
    return { html: html || '', headings: [] }
  }

  const usedSlugs = new Map()
  const flat = []

  const withIds = html.replace(
    /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, level, attrs, inner) => {
      const text = decodeHtmlEntities(stripTags(inner))
      if (!text) return match

      // Buang id lama (kalau ada) supaya tidak dobel dengan yang baru kita suntik
      const cleanAttrs = attrs.replace(/\sid=["'][^"']*["']/i, '')

      const base = slugify(text) || 'section'
      const seen = usedSlugs.get(base) || 0
      const id = seen > 0 ? `${base}-${seen + 1}` : base
      usedSlugs.set(base, seen + 1)

      flat.push({ id, text, level: Number(level) })
      return `<h${level}${cleanAttrs} id="${id}">${inner}</h${level}>`
    }
  )

  return { html: withIds, headings: buildTree(flat) }
}