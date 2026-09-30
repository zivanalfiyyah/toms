<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useAdminStore } from '../../stores/admin'

const admin = useAdminStore()

const ROLE_OPTIONS = ['admin', 'editor', 'viewer']

const showForm = ref(false)
const editingId = ref(null)
const saving = ref(false)
const formError = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'viewer',
})

onMounted(() => {
  admin.fetchUsers()
})

function openCreate() {
  editingId.value = null
  form.name = ''
  form.email = ''
  form.password = ''
  form.role = 'viewer'
  formError.value = ''
  showForm.value = true
}

function openEdit(user) {
  editingId.value = user.id
  form.name = user.name || ''
  form.email = user.email || ''
  form.password = ''
  form.role = (user.roles || []).map((r) => r.name ?? r)[0] || 'viewer'
  formError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

async function submitForm() {
  saving.value = true
  formError.value = ''
  try {
    const payload = { name: form.name, email: form.email, role: form.role }
    if (form.password) payload.password = form.password

    if (editingId.value) {
      await admin.updateUser(editingId.value, payload)
    } else {
      await admin.createUser(payload)
    }
    showForm.value = false
  } catch (err) {
    formError.value = err.response?.data?.message || 'Gagal menyimpan user.'
  } finally {
    saving.value = false
  }
}

async function removeUser(user) {
  if (!confirm(`Hapus user "${user.name || user.email}"?`)) return
  try {
    await admin.deleteUser(user.id)
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus user.')
  }
}

function roleLabel(user) {
  return (user.roles || []).map((r) => r.name ?? r).join(', ') || '-'
}
</script>

<template>
  <div class="users-page">
    <div class="page-head">
      <h2>Manajemen Pengguna</h2>
      <button class="btn-primary" @click="openCreate">+ Tambah Pengguna</button>
    </div>

    <p v-if="admin.error" class="error">{{ admin.error }}</p>

    <div class="table-wrap">
      <table v-if="admin.users.length">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in admin.users" :key="u.id">
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td><span class="badge">{{ roleLabel(u) }}</span></td>
            <td class="actions">
              <button class="btn-link" @click="openEdit(u)">Edit</button>
              <button class="btn-link danger" @click="removeUser(u)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else-if="admin.usersLoading">Memuat...</p>
      <p v-else class="empty">Belum ada pengguna.</p>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <h3>{{ editingId ? 'Edit Pengguna' : 'Tambah Pengguna' }}</h3>
        <form @submit.prevent="submitForm">
          <label>Nama</label>
          <input v-model="form.name" type="text" required />

          <label>Email</label>
          <input v-model="form.email" type="email" required />

          <label>Password {{ editingId ? '(kosongkan jika tidak diubah)' : '' }}</label>
          <input v-model="form.password" type="password" :required="!editingId" />

          <label>Role</label>
          <select v-model="form.role">
            <option v-for="r in ROLE_OPTIONS" :key="r" :value="r">{{ r }}</option>
          </select>

          <p v-if="formError" class="error">{{ formError }}</p>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeForm">Batal</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
.page-head h2 { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.03em; margin: 0; }

.btn-primary {
  background: linear-gradient(90deg, #0284c7, #0ea5e9); color: #fff; border: none; border-radius: var(--radius);
  box-shadow: var(--btn-glow); font-weight: 700; cursor: pointer; transition: transform 0.15s ease, filter 0.15s ease;
  padding: 0.6rem 1.15rem; font-size: 0.82rem;
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
.btn-secondary {
  background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius);
  padding: 0.6rem 1.1rem; font-size: 0.82rem; font-weight: 600; cursor: pointer; color: var(--color-ink);
  transition: background 0.15s ease, color 0.15s ease;
}
.btn-secondary:hover { background: var(--color-accent-soft); color: var(--color-accent); }
.btn-link { background: none; border: none; color: var(--color-accent); cursor: pointer; font-size: 0.8rem; font-weight: 600; padding: 0; }
.btn-link:hover:not(:disabled) { text-decoration: underline; }
.btn-link:disabled { opacity: 0.35; cursor: not-allowed; }
.btn-link.danger { color: #ef4444; }

.btn-link.danger { margin-left: 0.85rem; }

.table-wrap {
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-lg); box-shadow: var(--shadow-card); overflow: hidden;
}
table { width: 100%; border-collapse: collapse; font-size: 0.87rem; }
th, td { text-align: left; padding: 0.8rem 1.1rem; border-bottom: 1px solid var(--color-border); }
th {
  color: var(--color-ink-soft); font-weight: 700; font-size: 0.7rem; letter-spacing: 0.06em;
  text-transform: uppercase; background: var(--color-accent-soft);
}
tbody tr { transition: background 0.15s ease; }
tbody tr:hover { background: var(--color-accent-soft); }
tr:last-child td { border-bottom: none; }
.actions { white-space: nowrap; }

.badge {
  background: var(--color-accent-soft); color: var(--color-accent); border: 1px solid var(--color-accent-border);
  padding: 0.15rem 0.65rem; border-radius: 999px; font-size: 0.72rem; font-weight: 700;
}

.empty { padding: 1.5rem; color: var(--color-ink-soft); font-size: 0.85rem; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(2, 6, 23, 0.55);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem;
}
.modal {
  background: var(--color-surface); border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl); padding: 1.75rem; width: 100%; max-width: 400px;
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

input:focus, select:focus, textarea:focus {
  outline: none; border-color: var(--color-accent-border); box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.error {
  color: #ef4444; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: var(--radius); padding: 0.65rem 0.85rem; font-size: 0.82rem; margin-bottom: 0.9rem;
}
</style>
