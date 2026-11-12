import api from '../api'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

// Unduh dokumen sebagai PDF (dibuat server, ada watermark di latar belakang).
// Tamu diarahkan ke pop-up "harus login terlebih dahulu".
export async function downloadPdf(kind, id, fallbackName = 'dokumen') {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) {
    useUiStore().promptLogin(window.location.pathname)
    return { ok: false, reason: 'login' }
  }
  try {
    const url = kind === 'category' ? `/categories/${id}/pdf` : `/pages/${id}/pdf`
    const res = await api.get(url, { responseType: 'blob' })
    const cd = res.headers['content-disposition'] || ''
    const m = /filename="?([^";]+)"?/i.exec(cd)
    const name = m ? m[1] : `TOMS-${fallbackName}.pdf`
    const href = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = href
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(href), 4000)
    return { ok: true }
  } catch (e) {
    let msg = 'Gagal mengunduh PDF. Coba lagi.'
    try {
      const txt = await e.response?.data?.text?.()
      if (txt) msg = JSON.parse(txt).message || msg
    } catch { /* abaikan */ }
    return { ok: false, reason: 'error', message: msg }
  }
}
