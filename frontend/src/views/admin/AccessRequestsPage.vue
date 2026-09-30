<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '../../stores/admin'

const admin = useAdminStore()

const roleModalFor = ref(null)
const selectedRole = ref('editor')
const actionError = ref('')

onMounted(() => {
  admin.fetchAccessRequests()
})

function openRoleModal(requestId) {
  roleModalFor.value = requestId
  selectedRole.value = 'editor'
  actionError.value = ''
}

function closeRoleModal() {
  roleModalFor.value = null
}

async function confirmInvite() {
  actionError.value = ''
  try {
    await admin.inviteFromAccessRequest(roleModalFor.value, selectedRole.value)
    closeRoleModal()
  } catch (err) {
    actionError.value = err.response?.data?.message || 'Gagal membuat undangan.'
  }
}

async function reject(requestId) {
  if (!confirm('Tolak permintaan ini?')) return
  try {
    await admin.rejectAccessRequest(requestId)
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menolak permintaan.')
  }
}

function statusLabel(status) {
  return { pending: 'Menunggu', invited: 'Sudah Diundang', rejected: 'Ditolak' }[status] || status
}
</script>

<template>
  <div class="wrap">
    <h1>Permintaan Akses</h1>

    <p v-if="admin.accessRequestsLoading">Memuat...</p>
    <p v-if="admin.error" class="error">{{ admin.error }}</p>

    <table v-if="!admin.accessRequestsLoading" class="req-table">
      <thead>
        <tr>
          <th>Nama</th>
          <th>Email</th>
          <th>Divisi</th>
          <th>Keperluan</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in admin.accessRequests" :key="r.id">
          <td>{{ r.name }}</td>
          <td>{{ r.email }}</td>
          <td>{{ r.division || '-' }}</td>
          <td>{{ r.reason || '-' }}</td>
          <td><span class="badge" :class="r.status">{{ statusLabel(r.status) }}</span></td>
          <td class="actions">
            <template v-if="r.status === 'pending'">
              <button class="btn-approve" @click="openRoleModal(r.id)">Buat Undangan</button>
              <button class="btn-reject" @click="reject(r.id)">Tolak</button>
            </template>
            <span v-else class="muted">-</span>
          </td>
        </tr>
        <tr v-if="admin.accessRequests.length === 0">
          <td colspan="6" class="empty">Belum ada permintaan akses.</td>
        </tr>
      </tbody>
    </table>

    <div v-if="roleModalFor" class="modal-overlay" @click.self="closeRoleModal">
      <div class="modal">
        <h3>Pilih Role</h3>
        <p class="hint">Role ini nggak bisa diubah sendiri oleh user setelah akunnya aktif.</p>
        <p v-if="actionError" class="error">{{ actionError }}</p>
        <select v-model="selectedRole">
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
        <div class="modal-actions">
          <button class="btn-cancel" @click="closeRoleModal">Batal</button>
          <button class="btn-approve" :disabled="admin.importSubmitting" @click="confirmInvite">
            Kirim Undangan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap { max-width: none; margin: 0; padding: 0; }
.wrap h1 { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 1.25rem; }

/* Tabel jadi kartu: sudut membulat lewat sel pojok (tanpa wrapper baru) */
.req-table {
  width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.87rem;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg); box-shadow: var(--shadow-card);
}
.req-table th, .req-table td {
  text-align: left; padding: 0.8rem 1.1rem; border-bottom: 1px solid var(--color-border); vertical-align: middle;
}
.req-table th {
  color: var(--color-ink-soft); font-weight: 700; font-size: 0.7rem; letter-spacing: 0.06em;
  text-transform: uppercase; background: var(--color-accent-soft);
}
.req-table thead tr:first-child th:first-child { border-top-left-radius: 15px; }
.req-table thead tr:first-child th:last-child { border-top-right-radius: 15px; }
.req-table tbody tr:last-child td { border-bottom: none; }
.req-table tbody tr:last-child td:first-child { border-bottom-left-radius: 15px; }
.req-table tbody tr:last-child td:last-child { border-bottom-right-radius: 15px; }
.req-table tbody tr:hover td { background: var(--color-accent-soft); }

.badge { display: inline-block; white-space: nowrap; padding: 0.2rem 0.7rem; border-radius: 999px; font-size: 0.72rem; font-weight: 700; }
.badge.pending { background: rgba(245, 158, 11, 0.14); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.35); }
.badge.invited { background: rgba(16, 185, 129, 0.13); color: #059669; border: 1px solid rgba(16, 185, 129, 0.35); }
.badge.rejected { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.35); }
[data-theme='dark'] .badge.pending { color: #fbbf24; }
[data-theme='dark'] .badge.invited { color: #34d399; }

/* sebelumnya display:flex pada <td> membuat garis baris terputus */
.actions { white-space: nowrap; }
.actions > * + * { margin-left: 0.5rem; }
.btn-approve {
  padding: 0.45rem 0.9rem; background: linear-gradient(90deg, #0284c7, #0ea5e9); color: #fff; border: none; border-radius: var(--radius);
  box-shadow: var(--btn-glow); font-weight: 700; cursor: pointer; transition: transform 0.15s ease, filter 0.15s ease; font-size: 0.78rem; white-space: nowrap;
}
.btn-approve:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
.btn-approve:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
.btn-reject {
  padding: 0.45rem 0.9rem; border: 1px solid rgba(239, 68, 68, 0.5); border-radius: var(--radius);
  background: transparent; color: #ef4444; cursor: pointer; font-size: 0.78rem; font-weight: 600; white-space: nowrap;
  transition: background 0.15s ease;
}
.btn-reject:hover { background: rgba(239, 68, 68, 0.1); }
.muted { color: var(--color-ink-soft); }
.empty { text-align: center; color: var(--color-ink-soft); padding: 1.5rem; }
.error { color: #ef4444; margin-bottom: 1rem; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(2, 6, 23, 0.55);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem;
}
.modal {
  background: var(--color-surface); border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl); padding: 1.75rem; width: 100%; max-width: 360px;
  box-shadow: 0 24px 60px -20px rgba(15, 23, 42, 0.45), var(--shadow-a);
}
[data-theme='dark'] .modal { border-color: var(--color-accent-border); }
.modal h3 { margin: 0 0 1.1rem; font-size: 1.05rem; font-weight: 800; letter-spacing: -0.02em; }
.modal label { display: block; font-size: 0.78rem; font-weight: 600; color: var(--color-ink-soft); margin: 0 0 0.35rem; }
.modal input, .modal select {
  width: 100%; padding: 0.6rem 0.8rem; margin-bottom: 0.9rem;
  border: 1px solid var(--color-border); border-radius: var(--radius);
  background: var(--input-bg); color: var(--color-ink); font-size: 0.87rem; font-family: inherit;
}
.modal-actions { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.5rem; }

.modal .hint { font-size: 0.8rem; color: var(--color-ink-soft); margin: 0 0 1rem; }
.btn-cancel {
  padding: 0.45rem 1rem; border: 1px solid var(--glass-border); border-radius: var(--radius);
  background: var(--glass-bg); color: var(--color-ink); cursor: pointer; font-size: 0.8rem; font-weight: 600;
}
.btn-cancel:hover { background: var(--color-accent-soft); color: var(--color-accent); }

input:focus, select:focus, textarea:focus {
  outline: none; border-color: var(--color-accent-border); box-shadow: 0 0 0 3px var(--color-accent-soft);
}
</style>