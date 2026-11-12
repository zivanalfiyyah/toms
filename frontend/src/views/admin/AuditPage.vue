<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '../../api'

const tab = ref('log')
const loading = ref(true)
const error = ref('')
const rows = ref([])
const meta = ref({ current_page: 1, last_page: 1, total: 0 })

const f = ref({ q: '', group: '', from: '', to: '' })
const vf = ref({ q: '', action: '' })

const groups = [
  ['', 'Semua aktivitas'], ['auth', 'Login / Logout'], ['document', 'Dokumen (kategori & halaman)'],
  ['user', 'Pengguna'], ['announcement', 'Informasi'], ['ticket', 'Laporan bantuan'], ['setting', 'Konten portal'], ['dashboard', 'Dashboard kinerja'],
]

async function load(page = 1) {
  loading.value = true
  error.value = ''
  try {
    const url = tab.value === 'log' ? '/audit-logs' : '/document-versions'
    const params = { page, per_page: 25, ...(tab.value === 'log' ? clean(f.value) : clean(vf.value)) }
    const { data } = await api.get(url, { params })
    rows.value = data.data
    meta.value = { current_page: data.current_page, last_page: data.last_page, total: data.total }
  } catch (e) {
    error.value = e.response?.data?.message || 'Gagal memuat data.'
    rows.value = []
  } finally { loading.value = false }
}
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v))
onMounted(() => load())
watch(tab, () => { rows.value = []; load() })

let t
function typing() { clearTimeout(t); t = setTimeout(() => load(1), 350) }

const fmt = (d) => (d ? new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '')
const grp = (a) => (a || '').split('.')[0]
const label = (a) => ({
  'auth.login': 'Login', 'auth.logout': 'Logout', 'auth.login_failed': 'Login gagal',
  'document.created': 'Dokumen baru', 'document.updated': 'Dokumen diperbarui', 'document.deleted': 'Dokumen dihapus',
  'document.download': 'Unduh PDF', 'document.like': 'Suka', 'document.unlike': 'Batal suka',
  'user.approved': 'Akun disetujui', 'user.rejected': 'Akun ditolak',
}[a] || a.replace('.', ' · '))
const tone = (a) => (/deleted|rejected|failed/.test(a) ? 'bad' : /created|approved|login$/.test(a) ? 'ok' : /updated/.test(a) ? 'warn' : '')
</script>

<template>
  <div class="audit">
    <div class="ap-head"><h2>Log Audit</h2><span class="ap-muted">{{ meta.total }} catatan</span></div>

    <div class="au-tabs" role="tablist">
      <button type="button" role="tab" :aria-selected="tab === 'log'" :class="{ on: tab === 'log' }" @click="tab = 'log'">Log Aktivitas</button>
      <button type="button" role="tab" :aria-selected="tab === 'ver'" :class="{ on: tab === 'ver' }" @click="tab = 'ver'">Versi Dokumen</button>
    </div>

    <form v-if="tab === 'log'" class="au-filters" @submit.prevent="load(1)">
      <input v-model="f.q" type="search" placeholder="Cari pengguna, aktivitas, atau dokumen…" @input="typing" />
      <select v-model="f.group" @change="load(1)"><option v-for="g in groups" :key="g[0]" :value="g[0]">{{ g[1] }}</option></select>
      <label>Dari <input v-model="f.from" type="date" @change="load(1)" /></label>
      <label>Sampai <input v-model="f.to" type="date" @change="load(1)" /></label>
    </form>
    <form v-else class="au-filters" @submit.prevent="load(1)">
      <input v-model="vf.q" type="search" placeholder="Cari judul dokumen…" @input="typing" />
      <select v-model="vf.action" @change="load(1)"><option value="">Semua</option><option value="created">Baru</option><option value="updated">Diperbarui</option></select>
    </form>

    <p v-if="error" class="ap-err">{{ error }}</p>
    <p v-if="loading" class="ap-muted">Memuat…</p>
    <p v-else-if="!rows.length" class="ap-muted">Belum ada catatan.</p>

    <div v-if="rows.length && tab === 'log'" class="au-table">
      <table>
        <thead><tr><th>Waktu</th><th>Pengguna</th><th>Aktivitas</th><th>Keterangan</th><th>IP</th></tr></thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id">
            <td class="nw">{{ fmt(r.created_at) }}</td>
            <td><b>{{ r.user_name }}</b><small v-if="r.user_email">{{ r.user_email }}</small></td>
            <td><span class="ap-pill" :class="tone(r.action)">{{ label(r.action) }}</span></td>
            <td>{{ r.description }}<small v-if="r.meta?.bagian_berubah">Bagian: {{ r.meta.bagian_berubah.join(', ') }}</small></td>
            <td class="nw">{{ r.ip || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="rows.length && tab === 'ver'" class="au-table">
      <table>
        <thead><tr><th>Waktu</th><th>Dokumen</th><th>Jenis</th><th>Revisi</th><th>Status</th><th>Oleh</th></tr></thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id">
            <td class="nw">{{ fmt(r.created_at) }}</td>
            <td><b>{{ r.title }}</b><small>{{ r.kind === 'category' ? 'Kategori' : 'Halaman' }}<template v-if="r.category_name"> · {{ r.category_name }}</template></small></td>
            <td>{{ r.doc_type }}</td>
            <td><span class="ap-pill">{{ r.revision_label }}</span></td>
            <td><span class="ap-pill" :class="r.action === 'created' ? 'ok' : 'warn'">{{ r.action === 'created' ? 'Baru' : 'Diperbarui' }}</span></td>
            <td>{{ r.user_name || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="meta.last_page > 1" class="au-pager">
      <button type="button" :disabled="meta.current_page <= 1" @click="load(meta.current_page - 1)">‹ Sebelumnya</button>
      <span>{{ meta.current_page }} / {{ meta.last_page }}</span>
      <button type="button" :disabled="meta.current_page >= meta.last_page" @click="load(meta.current_page + 1)">Berikutnya ›</button>
    </div>
  </div>
</template>

<style>
.audit .au-tabs { display: flex; gap: 6px; margin: 4px 0 16px; border-bottom: 1px solid var(--border); }
.audit .au-tabs button { padding: 10px 18px; border: 0; background: none; font: inherit; font-weight: 700; color: var(--muted); cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -1px; }
.audit .au-tabs button.on { color: var(--ink); border-bottom-color: var(--gold); }
.audit .au-filters { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 16px; }
.audit .au-filters input, .audit .au-filters select { padding: 9px 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); color: var(--text); font: inherit; font-size: 13px; }
.audit .au-filters input[type=search] { flex: 1; min-width: 220px; }
.audit .au-filters label { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
.audit .au-table { overflow-x: auto; border: 1px solid var(--border); border-radius: 14px; background: var(--surface); }
.audit table { width: 100%; border-collapse: collapse; font-size: 13px; }
.audit th { text-align: left; padding: 11px 14px; background: var(--soft); color: var(--muted); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; }
.audit td { padding: 11px 14px; border-top: 1px solid var(--border); vertical-align: top; color: var(--text); }
.audit td small { display: block; margin-top: 2px; color: var(--muted); font-size: 11.5px; }
.audit td.nw { white-space: nowrap; color: var(--muted); font-size: 12px; }
.audit .ap-pill.bad { background: #fdecea; color: #b3261e; }
.audit .au-pager { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 18px; color: var(--muted); font-size: 13px; }
.audit .au-pager button { padding: 8px 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); color: var(--ink); font: inherit; font-weight: 700; cursor: pointer; }
.audit .au-pager button:disabled { opacity: .45; cursor: default; }
</style>
