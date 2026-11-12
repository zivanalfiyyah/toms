<script setup>
import HeroSearch from '../components/HeroSearch.vue'
import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import api from '../api'
import { usePortalStore } from '../stores/portal'

const portal = usePortalStore()
portal.load()
const { contact } = storeToRefs(portal)
const sending = ref(false)
const error = ref('')
const ticketNo = ref('')

const kinds = ['Akses akun', 'Dokumen', 'Dashboard', 'Kendala teknis lain']
const f = reactive({ name: '', email: '', kind: '', text: '' })
const file = ref(null)
const preview = ref('')
const fileError = ref('')
const sent = ref(false)

function openSearch() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
}

function onFile(e) {
  fileError.value = ''
  const picked = e.target.files?.[0]
  if (!picked) return
  if (picked.size > 5 * 1024 * 1024) {
    fileError.value = 'Ukuran lampiran maksimal 5 MB.'
    e.target.value = ''
    return
  }
  setFile(picked)
}
function setFile(picked) {
  if (preview.value) URL.revokeObjectURL(preview.value)
  file.value = picked
  preview.value = picked.type.startsWith('image/') ? URL.createObjectURL(picked) : ''
}
function clearFile() {
  if (preview.value) URL.revokeObjectURL(preview.value)
  file.value = null
  preview.value = ''
  fileError.value = ''
}
function onDrop(e) {
  const picked = e.dataTransfer?.files?.[0]
  if (!picked) return
  if (picked.size > 5 * 1024 * 1024) { fileError.value = 'Ukuran lampiran maksimal 5 MB.'; return }
  fileError.value = ''
  setFile(picked)
}
const sizeLabel = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)

async function submit() {
  error.value = ''
  sending.value = true
  try {
    const fd = new FormData()
    fd.append('name', f.name)
    fd.append('email', f.email)
    if (f.kind) fd.append('category', f.kind)
    fd.append('subject', f.kind || 'Kendala teknis')
    fd.append('message', f.text)
    if (file.value) fd.append('attachment', file.value)
    const res = await api.post('/help-tickets', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    ticketNo.value = res.data.ticket
    sent.value = true
  } catch (e) {
    const errs = e.response?.data?.errors
    error.value = errs ? Object.values(errs)[0][0] : (e.response?.data?.message || 'Laporan belum terkirim. Coba lagi.')
  } finally {
    sending.value = false
  }
}
function reset() {
  Object.assign(f, { name: '', email: '', kind: '', text: '' })
  clearFile()
  sent.value = false
  ticketNo.value = ''
}
</script>

<template>
  <div class="dz">
<section class="page-hero"><div class="shell"><div><span class="eyebrow light">SUPPORT CENTER</span><h1>Pusat Bantuan</h1><p>Temukan jawaban atau sampaikan kendala kepada tim dukungan TOMS.</p></div><div class="search-wrap"><HeroSearch compact /></div></div></section><section class="section shell help-grid help-two"><div class="report-panel"><div class="section-head"><div><span class="eyebrow">TECHNICAL SUPPORT</span><h2>Laporkan Kendala Teknis</h2><p>Tim support akan merespons secepatnya setelah laporan diterima.</p></div></div><template v-if="sent"><div class="success"><span><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6l1 3h3v16H5V6h3z"></path><path d="m8 13 2 2 5-5M9 3v3h6V3"></path></svg></span><h3>Laporan terkirim</h3><p>Nomor laporan <b>{{ ticketNo }}</b>. Tim support akan menghubungi Anda melalui <b>{{ f.email }}</b>.</p><button type="button" @click="reset">Buat laporan lain</button></div></template><template v-else><form @submit.prevent="submit"><label>Nama lengkap<input v-model="f.name" required="" placeholder="Masukkan nama Anda"></label><label>Email perusahaan<input v-model="f.email" required="" placeholder="nama@company.co.id" type="email"></label><label>Kategori kendala<select v-model="f.kind"><option value="">Pilih kategori</option><option v-for="k in kinds" :key="k">{{ k }}</option></select></label><label>Deskripsi kendala<textarea v-model="f.text" required="" placeholder="Jelaskan kendala yang Anda alami..."></textarea></label><label class="file-field">Lampiran (screenshot atau file kendala) <em>opsional</em><span class="dropzone" :class="{ has: file }" @dragover.prevent @drop.prevent="onDrop"><input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" @change="onFile"><template v-if="!file"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5"></path><path d="M4 16v4h16v-4"></path></svg><b>Klik atau seret file ke sini</b><small>Gambar, PDF, Word, Excel · maks. 5 MB</small></template><template v-else><img v-if="preview" :src="preview" alt="Pratinjau lampiran"><svg v-else width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2h8l4 4v16H6z"></path><path d="M14 2v5h5"></path></svg><b>{{ file.name }}</b><small>{{ sizeLabel(file.size) }}</small><button type="button" class="file-x" @click.prevent.stop="clearFile">Hapus</button></template></span><span v-if="fileError" class="help-error">{{ fileError }}</span></label><p v-if="error" class="help-error">{{ error }}</p><button class="primary-btn" type="submit" :disabled="sending">{{ sending ? 'Mengirim…' : 'Kirim laporan' }} <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"></path></svg></button></form></template></div><aside class="help-side">
<div class="hs-hero"><span class="hs-ico"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14v-2a8 8 0 0 1 16 0v2"></path><rect x="3" y="14" width="4" height="6" rx="1.5"></rect><rect x="17" y="14" width="4" height="6" rx="1.5"></rect><path d="M19 20c0 1.5-2 2-5 2"></path></svg></span><div><b>Tim support siap membantu</b><small><i class="hs-live"></i>{{ contact.hours }}</small></div><span class="hs-blob" aria-hidden="true"></span></div>
<div class="hs-tiles">
<a class="hs-tile" :href="`mailto:${contact.email}`"><span class="hs-t-ico t-blue"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"></rect><path d="m3 8 9 6 9-6"></path></svg></span><small>EMAIL SUPPORT</small><b>{{ contact.email }}</b></a>
<a class="hs-tile" :href="`tel:${String(contact.phone).replace(/[^+\d]/g, '')}`"><span class="hs-t-ico t-gold"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"></path></svg></span><small>COMMAND CENTER</small><b>{{ contact.phone }}</b></a>
</div>
<div class="side-card"><span class="eyebrow">CARA MELAPORKAN</span><ol class="hs-steps">
<li><span class="hs-s-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"></rect><rect x="13" y="4" width="7" height="7" rx="1.5"></rect><rect x="4" y="13" width="7" height="7" rx="1.5"></rect><rect x="13" y="13" width="7" height="7" rx="1.5"></rect></svg></span><div><b>Pilih kategori</b><small>Akses akun, dokumen, dashboard, atau kendala lain.</small></div></li>
<li><span class="hs-s-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"></path><path d="m13.5 6.5 4 4"></path></svg></span><div><b>Jelaskan kendalanya</b><small>Tulis langkah yang dilakukan dan pesan error yang muncul.</small></div></li>
<li><span class="hs-s-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"></rect><circle cx="9" cy="11" r="1.8"></circle><path d="m21 16-5-4-8 7"></path></svg></span><div><b>Lampirkan screenshot</b><small>Bagian layar yang bermasalah mempercepat perbaikan.</small></div></li>
<li><span class="hs-s-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3 3 10l7 3 3 7z"></path><path d="m10 13 4-4"></path></svg></span><div><b>Kirim &amp; pantau</b><small>Simpan nomor tiket untuk menanyakan perkembangan.</small></div></li>
</ol></div>
<div class="side-card side-links"><span class="eyebrow">SUDAH COBA INI?</span>
<router-link to="/faq"><span class="hs-l-ico t-blue"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17v.01"></path></svg></span><b>Pertanyaan yang sering diajukan</b><em>→</em></router-link>
<router-link to="/panduan-penggunaan"><span class="hs-l-ico t-gold"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 5c3-1.5 6-1.5 10 1v14c-4-2.5-7-2.5-10-1z"></path><path d="M22 5c-3-1.5-6-1.5-10 1v14c4-2.5 7-2.5 10-1z"></path></svg></span><b>Panduan penggunaan TOMS</b><em>→</em></router-link>
<router-link to="/daftar-isi"><span class="hs-l-ico t-blue"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path></svg></span><b>Daftar isi dokumentasi</b><em>→</em></router-link>
</div>
</aside></section><section class="contact-section"><div class="shell"><div><span class="eyebrow light">KONTAK ADMIN &amp; ESKALASI</span><h2>Butuh penanganan segera?</h2><p>Untuk gangguan operasional kritis, hubungi command center yang tersedia 24 jam.</p></div><div class="contact-options"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 13a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-3"></path><path d="M4 13v4H2v-4h2Zm16 0v4h2v-4h-2Z"></path></svg><i><small>COMMAND CENTER</small><b>{{ contact.phone }}</b></i></span><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2h8l4 4v16H6z"></path><path d="M14 2v5h5M9 12h6M9 16h6"></path></svg><i><small>EMAIL SUPPORT</small><b>{{ contact.email }}</b></i></span></div></div></section>
  </div>
</template>

<style>
.dz .help-error { margin: 0; color: #dc2626; font-size: 13px; }
.dz .help-grid.help-two { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 28px; align-items: start; }
.dz .help-grid.help-two .report-panel { max-width: none; margin: 0; }
.dz .help-side { display: grid; gap: 18px; position: sticky; top: 96px; }
.dz .side-card { padding: 24px 26px; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; box-shadow: var(--shadow); }
.dz .side-card .eyebrow { display: inline-block; margin-bottom: 12px; }
.dz .side-steps { margin: 0; padding: 0; list-style: none; counter-reset: st; display: grid; gap: 14px; }
.dz .side-steps li { counter-increment: st; position: relative; padding-left: 40px; display: grid; gap: 3px; }
.dz .side-steps li::before { content: counter(st); position: absolute; left: 0; top: 0; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: var(--gold-soft); color: var(--gold-ink); font-weight: 800; font-size: 13px; }
.dz .side-steps b { color: var(--ink); font-size: 14px; }
.dz .side-steps small { color: var(--muted); font-size: 12.5px; line-height: 1.6; }
.dz .side-meta { display: grid; gap: 12px; }
.dz .side-meta i { display: grid; gap: 2px; font-style: normal; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.dz .side-meta i:last-child { border: 0; padding-bottom: 0; }
.dz .side-meta small { font-size: 10px; letter-spacing: 0.1em; font-weight: 800; color: var(--gold-ink); }
.dz .side-meta b { color: var(--ink); font-size: 14px; overflow-wrap: anywhere; }
.dz .side-links { display: grid; gap: 4px; }
.dz .side-links a { display: flex; justify-content: space-between; gap: 10px; padding: 11px 0; border-bottom: 1px solid var(--border); color: var(--ink); font-weight: 700; font-size: 14px; text-decoration: none; }
.dz .side-links a:last-child { border: 0; }
.dz .side-links em { color: var(--gold-ink); font-style: normal; }
.dz .report-panel .file-field { font-size: 11px; }
.dz .report-panel .file-field em { font-style: normal; font-weight: 500; color: var(--muted); margin-left: 4px; }
.dz .dropzone { position: relative; display: grid; justify-items: center; gap: 4px; padding: 20px 16px; text-align: center; border: 1.5px dashed var(--border); border-radius: 14px; background: var(--bg); color: var(--muted); cursor: pointer; transition: border-color 0.15s, background 0.15s; }
.dz .dropzone:hover { border-color: var(--gold); background: var(--gold-soft); }
.dz .dropzone input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; padding: 0; }
.dz .dropzone b { color: var(--ink); font-size: 13px; overflow-wrap: anywhere; }
.dz .dropzone small { font-size: 11.5px; font-weight: 500; }
.dz .dropzone img { max-width: 100%; max-height: 150px; border-radius: 10px; border: 1px solid var(--border); }
.dz .dropzone .file-x { position: relative; z-index: 2; margin-top: 6px; border: 0; background: none; color: #c0392b; font-weight: 800; font-size: 12px; cursor: pointer; }
@media (width <= 980px) { .dz .help-grid.help-two { grid-template-columns: 1fr; } .dz .help-side { position: static; } }
.dz .hs-hero { position: relative; overflow: hidden; display: flex; align-items: center; gap: 16px; padding: 22px 24px; border-radius: 22px; color: #fff; background: linear-gradient(135deg, #0a1f4d 0%, #14336f 60%, #1d4a96 100%); box-shadow: var(--shadow); }
.dz .hs-hero b { display: block; font-size: 17px; margin-bottom: 4px; }
.dz .hs-hero small { display: flex; align-items: center; gap: 8px; color: rgba(255, 255, 255, 0.8); font-size: 13px; }
.dz .hs-ico { flex: 0 0 auto; width: 62px; height: 62px; border-radius: 18px; display: grid; place-items: center; background: rgba(255, 255, 255, 0.14); color: var(--gold); border: 1px solid rgba(255, 255, 255, 0.2); }
.dz .hs-live { width: 8px; height: 8px; border-radius: 50%; background: #29d17d; box-shadow: 0 0 0 4px rgba(41, 209, 125, 0.25); }
.dz .hs-blob { position: absolute; right: -40px; top: -50px; width: 170px; height: 170px; border-radius: 50%; background: radial-gradient(circle, rgba(240, 180, 70, 0.35), transparent 70%); }
.dz .hs-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.dz .hs-tile { display: grid; gap: 4px; padding: 18px; border-radius: 20px; background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow); text-decoration: none; color: var(--ink); transition: transform 0.2s, border-color 0.2s; }
.dz .hs-tile:hover { transform: translateY(-2px); border-color: var(--gold); }
.dz .hs-tile small { font-size: 9.5px; letter-spacing: 0.1em; font-weight: 800; color: var(--muted); margin-top: 8px; }
.dz .hs-tile b { font-size: 13px; overflow-wrap: anywhere; line-height: 1.4; }
.dz .hs-t-ico, .dz .hs-l-ico, .dz .hs-s-ico { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; flex: 0 0 auto; }
.dz .t-blue { background: rgba(42, 91, 215, 0.13); color: #2a5bd7; }
.dz .t-gold { background: rgba(240, 160, 64, 0.2); color: #d98320; }
.dz .hs-steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 0; }
.dz .hs-steps li { position: relative; display: flex; gap: 14px; padding-bottom: 18px; }
.dz .hs-steps li:last-child { padding-bottom: 0; }
.dz .hs-steps li:not(:last-child)::before { content: ""; position: absolute; left: 21px; top: 46px; bottom: 2px; border-left: 2px dashed var(--border); }
.dz .hs-s-ico { background: var(--gold-soft); color: var(--gold-ink); }
.dz .hs-steps b { display: block; color: var(--ink); font-size: 14px; margin-bottom: 2px; }
.dz .hs-steps small { color: var(--muted); font-size: 12.5px; line-height: 1.55; }
.dz .side-links a { align-items: center; gap: 12px; justify-content: flex-start; }
.dz .side-links a b { flex: 1; font-size: 14px; }
.dz .hs-l-ico { width: 38px; height: 38px; border-radius: 12px; }
.dz .hs-l-ico svg { width: 18px; height: 18px; }
</style>
