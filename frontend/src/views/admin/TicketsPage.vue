<script setup>
import { onMounted, ref } from 'vue'
import api from '../../api'

const items = ref([])
const loading = ref(true)
const error = ref('')
const filter = ref('')

async function load() {
  loading.value = true
  try {
    items.value = (await api.get('/help-tickets', { params: filter.value ? { status: filter.value } : {} })).data
  } catch (e) {
    error.value = e.response?.data?.message || 'Gagal memuat laporan.'
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function setStatus(t, status) {
  try { const r = await api.put(`/help-tickets/${t.id}`, { status }); t.status = r.data.status } catch (e) { error.value = 'Gagal mengubah status.' }
}
async function remove(t) {
  if (!confirm('Hapus laporan ini?')) return
  try { await api.delete(`/help-tickets/${t.id}`); items.value = items.value.filter((x) => x.id !== t.id) } catch (e) { error.value = 'Gagal menghapus.' }
}
const no = (t) => `TKT-${String(t.id).padStart(5, '0')}`
const fmt = (d) => new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <div>
    <div class="ap-head">
      <h2>Laporan Bantuan</h2>
      <select v-model="filter" class="ap-form" style="padding:.45rem .7rem;border-radius:10px" @change="load">
        <option value="">Semua status</option><option value="baru">Baru</option><option value="diproses">Diproses</option><option value="selesai">Selesai</option>
      </select>
    </div>
    <p v-if="error" class="ap-err">{{ error }}</p>
    <p v-if="loading" class="ap-muted">Memuat…</p>
    <p v-else-if="!items.length" class="ap-muted">Belum ada laporan.</p>
    <div v-for="t in items" :key="t.id" class="ap-card">
      <div style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap">
        <b>{{ no(t) }} · {{ t.subject }}</b>
        <span class="ap-pill" :class="t.status === 'selesai' ? 'ok' : t.status === 'baru' ? 'warn' : ''">{{ t.status }}</span>
      </div>
      <p class="ap-muted" style="margin:.3rem 0">{{ t.name }} · <a :href="`mailto:${t.email}`">{{ t.email }}</a> · {{ fmt(t.created_at) }}<template v-if="t.category"> · {{ t.category }}</template></p>
      <p style="white-space:pre-wrap;margin:.5rem 0">{{ t.message }}</p>
      <button v-if="t.status !== 'diproses'" class="ap-link" @click="setStatus(t, 'diproses')">Tandai diproses</button>
      <button v-if="t.status !== 'selesai'" class="ap-link" style="margin-left:.85rem" @click="setStatus(t, 'selesai')">Tandai selesai</button>
      <button class="ap-link danger" @click="remove(t)">Hapus</button>
    </div>
  </div>
</template>
