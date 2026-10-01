// Kotak biru (callout) HANYA untuk kutipan yang diberi tanda eksplisit di awal teksnya,
// mis. "Catatan: ...", "Penting: ...". Kutipan biasa (blockquote tanpa tanda) tampil
// netral, supaya warna biru tidak dipakai untuk teks yang bukan hal penting.
//
// Ubah daftar kata di bawah bila ingin tanda yang berbeda.
export const CALLOUT_MARKERS = [
  'catatan', 'penting', 'perhatian', 'peringatan', 'tips', 'info', 'note', 'important', 'warning'
]

const MARKER_RE = new RegExp(
  // <blockquote ...> lalu <p ...> (boleh dibungkus <strong>/<em>/<span>) lalu "Kata:"
  `<blockquote((?:\\s[^>]*)?)>(\\s*<p[^>]*>\\s*(?:<(?:strong|b|em|i|span)[^>]*>\\s*)*)(${CALLOUT_MARKERS.join('|')})(\\s*:)`,
  'gi'
)

/** Menambahkan class "callout" pada blockquote yang diawali tanda (string in, string out). */
export function markCallouts(html) {
  if (!html || typeof html !== 'string') return html
  return html.replace(MARKER_RE, (_m, attrs, lead, word, colon) => {
    const hasClass = /\sclass=["']/i.test(attrs)
    const newAttrs = hasClass
      ? attrs.replace(/(\sclass=["'])/i, '$1callout ')
      : `${attrs} class="callout"`
    return `<blockquote${newAttrs}>${lead}${word}${colon}`
  })
}
