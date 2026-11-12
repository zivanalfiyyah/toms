// Mencocokkan sebuah label topik (mis. dari menu / panel bab) ke halaman asli di
// pohon dokumentasi berdasarkan judulnya. Murni fungsi.

const STOP = new Set(['dan', 'atau', 'yang', 'di', 'ke', 'untuk', 'the', 'of'])

export function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/&/g, ' dan ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(s) {
  return norm(s).split(' ').filter((t) => t && !STOP.has(t))
}

function score(label, title) {
  const a = norm(label)
  const b = norm(title)
  if (!a || !b) return 0
  if (a === b) return 100
  if ((a.includes(b) && b.length >= 6) || (b.includes(a) && a.length >= 6)) return 70
  const ta = new Set(tokens(label))
  const tb = new Set(tokens(title))
  if (!ta.size || !tb.size) return 0
  let common = 0
  for (const t of ta) if (tb.has(t)) common++
  const jac = common / (ta.size + tb.size - common)
  return jac >= 0.5 ? Math.round(jac * 60) : 0
}

/** Kembalikan entri indeks (lihat searchIndex.buildIndex) terbaik untuk label, atau null. */
export function resolveTopic(index, label) {
  let best = null
  let bestScore = 0
  for (const item of index || []) {
    let s = score(label, item.title)
    if (!s) continue
    if (item.type === 'Kategori') s -= 1 // halaman lebih diutamakan daripada bab
    if (s > bestScore) { best = item; bestScore = s }
  }
  return best
}
