<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useAdminStore } from '../../stores/admin'

const admin = useAdminStore()
const roles = reactive({})
const busy = reactive({})

onMounted(() => { admin.fetchUsers() })

const pending = computed(() => admin.users.filter((u) => u.status === 'pending'))

function fmtDate(v) {
  if (!v) return '-'
  return String(v).slice(0, 10)
}

async function accept(u) {
  busy[u.id] = true
  try { await admin.approveUser(u.id, roles[u.id] || 'viewer') }
  catch (e) { admin.error = e.response?.data?.message || 'Gagal menerima pendaftaran.' }
  finally { busy[u.id] = false }
}
async function reject(u) {
  if (!confirm(`Tolak pendaftaran ${u.email}?`)) return
  busy[u.id] = true
  try { await admin.rejectUser(u.id) }
  catch (e) { admin.error = e.response?.data?.message || 'Gagal menolak pendaftaran.' }
  finally { busy[u.id] = false }
}
</script>

<template>
  <div>
    <p v-if="admin.error" class="error">{{ admin.error }}</p>
    <div class="adm-card">
      <p v-if="admin.usersLoading && !pending.length" class="adm-help">Memuat…</p>
      <p v-else-if="!pending.length" class="adm-help">Tidak ada permintaan akses yang menunggu.</p>
      <div v-for="u in pending" :key="u.id" class="adm-req">
        <div>
          <b>{{ u.name }}</b>
          <small>{{ u.email }} • daftar {{ fmtDate(u.created_at) }}</small>
          <span class="adm-badge pending">Menunggu</span>
        </div>
        <div class="adm-acts">
          <select :value="roles[u.id] || 'viewer'" class="adm-select sm" :aria-label="`Peran untuk ${u.name}`" @change="roles[u.id] = $event.target.value">
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button class="annex-link" :disabled="busy[u.id]" @click="accept(u)">Terima</button>
          <button class="link-btn danger" :disabled="busy[u.id]" @click="reject(u)">Tolak</button>
        </div>
      </div>
    </div>
  </div>
</template>
