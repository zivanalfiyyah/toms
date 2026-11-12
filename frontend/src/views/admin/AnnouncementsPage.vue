<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../../api'

const items = ref([])
const loading = ref(true)
const error = ref('')
const show = ref(false)
const editingId = ref(null)
const saving = ref(false)
const formError = ref('')
const blank = () => ({ tag: 'Pengumuman Resmi', badge: '', title: '', excerpt: '', body: '', image_url: '', is_lead: false, is_published: true, published_at: '' })
const f = reactive(blank())

async function load() {
  loading.value = true
  try {
    items.value = (await api.get('/announcements', { params: { all: 1 } })).data
  } catch (e) {
    error.value = e.response?.data?.message || 'Gagal memuat pengumuman.'
  } finally {
    loading.value = false
  }
}
onMounted(load)

const toLocal = (d) => (d ? new Date(d).toISOString().slice(0, 16) : '')

function openForm(it) {
  Object.assign(f, blank())
  if (it) {
    Object.assign(f, { ...it, badge: it.badge || '', excerpt: it.excerpt || '', body: it.body || '', image_url: it.image_url || '', published_at: toLocal(it.published_at) })
  }
  editingId.value = it?.id || null
  formError.value = ''
  show.value = true
}

async function save() {
  saving.value = true
  formError.value = ''
  const payload = {
    tag: f.tag, badge: f.badge || null, title: f.title, excerpt: f.excerpt || null, body: f.body || null,
    image_url: f.image_url || null, is_lead: !!f.is_lead, is_published: !!f.is_published,
    published_at: f.published_at ? new Date(f.published_at).toISOString() : null,
  }
  try {
    if (editingId.value) await api.put(`/announcements/${editingId.value}`, payload)
    else await api.post('/announcements', payload)
    show.value = false
    await load()
  } catch (e) {
    const errs = e.response?.data?.errors
    formError.value = errs ? Object.values(errs)[0][0] : (e.response?.data?.message || 'Gagal menyimpan.')
  } finally {
    saving.value = false
  }
}

async function remove(it) {
  if (!confirm(`Hapus "${it.title}"?`)) return
  try { await api.delete(`/announcements/${it.id}`); await load() } catch (e) { error.value = 'Gagal menghapus.' }
}
const fmt = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-')
</script>

<template>
  <div>
    <div class="ap-head">
      <h2>Informasi &amp; Pengumuman</h2>
      <button class="ap-btn" @click="openForm(null)">+ Tambah</button>
    </div>
    <p v-if="error" class="ap-err">{{ error }}</p>
    <div class="ap-card" style="padding:0;overflow:auto">
      <table v-if="items.length" class="ap-table">
        <thead><tr><th>Judul</th><th>Kategori</th><th>Tanggal</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr v-for="it in items" :key="it.id">
            <td>{{ it.title }} <span v-if="it.is_lead" class="ap-pill">Utama</span></td>
            <td>{{ it.tag }} <span v-if="it.badge" class="ap-pill">{{ it.badge }}</span></td>
            <td>{{ fmt(it.published_at) }}</td>
            <td><span class="ap-pill" :class="it.is_published ? 'ok' : 'warn'">{{ it.is_published ? 'Terbit' : 'Draf' }}</span></td>
            <td style="white-space:nowrap"><button class="ap-link" @click="openForm(it)">Edit</button><button class="ap-link danger" @click="remove(it)">Hapus</button></td>
          </tr>
        </tbody>
      </table>
      <p v-else-if="loading" class="ap-muted" style="padding:1rem">Memuat…</p>
      <p v-else class="ap-muted" style="padding:1rem">Belum ada pengumuman.</p>
    </div>

    <div v-if="show" class="ap-modal" @click.self="show = false">
      <div>
        <h3>{{ editingId ? 'Edit' : 'Tambah' }} pengumuman</h3>
        <form class="ap-form" @submit.prevent="save">
          <label>Judul<input v-model="f.title" required maxlength="255" /></label>
          <div class="ap-row">
            <label>Kategori<input v-model="f.tag" required maxlength="100" placeholder="mis. Safety Alert" /></label>
            <label>Label (opsional)<input v-model="f.badge" maxlength="40" placeholder="URGENT, BARU…" /></label>
          </div>
          <label>Ringkasan<textarea v-model="f.excerpt" maxlength="1000"></textarea></label>
          <label>Isi lengkap<textarea v-model="f.body" style="min-height:160px"></textarea></label>
          <label>URL gambar (opsional)<input v-model="f.image_url" type="url" placeholder="https://…" /></label>
          <label>Tanggal terbit<input v-model="f.published_at" type="datetime-local" /></label>
          <label class="ap-check"><input v-model="f.is_lead" type="checkbox" /> Jadikan berita utama (hanya satu)</label>
          <label class="ap-check"><input v-model="f.is_published" type="checkbox" /> Terbitkan</label>
          <p v-if="formError" class="ap-err">{{ formError }}</p>
          <div class="ap-actions">
            <button type="button" class="ap-btn ghost" @click="show = false">Batal</button>
            <button type="submit" class="ap-btn" :disabled="saving">{{ saving ? 'Menyimpan…' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
