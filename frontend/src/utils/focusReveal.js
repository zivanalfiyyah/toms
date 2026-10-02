// Menggulir ke elemen ber-atribut data-focus-key="<key>" lalu menyorotnya sebentar.
// Dipakai pencarian panel admin: elemen tujuan (mis. halaman level dalam) baru
// muncul setelah data/anak-anaknya selesai dimuat, jadi kita memantau DOM.
//
// - Menunggu DOM "tenang" (600 ms tanpa perubahan) supaya posisi tidak bergeser
//   lagi akibat konten lain yang masih dimuat; paling lama 4 detik sejak ditemukan.
// - Menyerah diam-diam setelah `timeout` bila elemen tidak pernah muncul
//   (mis. halamannya sudah dihapus).
// Mengembalikan fungsi pembatal.
export function revealByKey(key, onDone, { timeout = 20000 } = {}) {
  const selector = `[data-focus-key="${String(key).replace(/"/g, '\\"')}"]`
  let observer = null
  let raf = 0
  let quietTimer = null
  let giveUpTimer = null
  let foundAt = 0
  let finished = false

  function stop() {
    finished = true
    observer?.disconnect()
    cancelAnimationFrame(raf)
    clearTimeout(quietTimer)
    clearTimeout(giveUpTimer)
  }

  function finish() {
    if (finished) return
    stop()
    onDone?.()
  }

  function reveal() {
    const el = document.querySelector(selector)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Untuk halaman, sorot barisnya saja (bukan seluruh daftar anaknya).
      const target = (el.matches('.page-item') && el.querySelector(':scope > .page-row')) || el
      target.classList.remove('admin-focus-flash')
      void target.offsetWidth // restart animasi bila sedang berjalan
      target.classList.add('admin-focus-flash')
      setTimeout(() => target.classList.remove('admin-focus-flash'), 3200)
    }
    finish()
  }

  function check() {
    if (finished || !document.querySelector(selector)) return
    const now = Date.now()
    if (!foundAt) foundAt = now
    clearTimeout(quietTimer)
    quietTimer = setTimeout(reveal, Math.max(0, Math.min(600, 4000 - (now - foundAt))))
  }

  observer = new MutationObserver(() => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      check()
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
  giveUpTimer = setTimeout(finish, timeout)
  check()

  return stop
}
