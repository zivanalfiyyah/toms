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
.wrap { max-width: 960px; margin: 2rem auto; padding: 0 1.5rem; }
.req-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.req-table th, .req-table td {
  text-align: left; padding: 0.6rem 0.8rem; border-bottom: 1px solid var(--color-border);
}
.badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.78rem; }
.badge.pending { background: rgba(230, 160, 20, 0.15); color: #b3790f; }
.badge.invited { background: rgba(30, 160, 90, 0.15); color: #178a54; }
.badge.rejected { background: rgba(211, 51, 51, 0.1); color: #d33; }
.actions { display: flex; gap: 0.5rem; }
.btn-approve {
  padding: 0.35rem 0.7rem; border: none; border-radius: var(--radius);
  background: var(--color-accent); color: #fff; cursor: pointer; font-size: 0.82rem;
}
.btn-reject {
  padding: 0.35rem 0.7rem; border: 1px solid #d33; border-radius: var(--radius);
  background: transparent; color: #d33; cursor: pointer; font-size: 0.82rem;
}
.muted { color: var(--color-ink-soft); }
.empty { text-align: center; color: var(--color-ink-soft); padding: 1.5rem; }
.error { color: #d33; margin-bottom: 1rem; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 50;
}
.modal {
  background: var(--color-surface); border-radius: var(--radius);
  padding: 1.5rem; width: 320px;
}
.modal .hint { font-size: 0.82rem; color: var(--color-ink-soft); margin-bottom: 1rem; }
.modal select {
  width: 100%; padding: 0.5rem; border: 1px solid var(--color-border);
  border-radius: var(--radius); margin-bottom: 1rem;
}
.modal-actions { display: flex; justify-content: flex-end; gap: 0.6rem; }
.btn-cancel {
  padding: 0.4rem 0.9rem; border: 1px solid var(--color-border); border-radius: var(--radius);
  background: transparent; cursor: pointer;
}
</style>