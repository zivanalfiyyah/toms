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
.page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.page-head h2 { font-size: 1.1rem; margin: 0; }

.btn-primary {
  background: var(--color-accent); color: #fff; border: none; border-radius: var(--radius);
  padding: 0.5rem 1rem; font-weight: 600; font-size: 0.85rem; cursor: pointer;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary {
  background: none; border: 1px solid var(--color-border); border-radius: var(--radius);
  padding: 0.5rem 1rem; font-size: 0.85rem; cursor: pointer; color: var(--color-ink);
}
.btn-link { background: none; border: none; color: var(--color-accent); cursor: pointer; font-size: 0.82rem; padding: 0; }
.btn-link.danger { color: #d33; margin-left: 0.75rem; }

.table-wrap {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius); overflow: hidden;
}
table { width: 100%; border-collapse: collapse; font-size: 0.87rem; }
th, td { text-align: left; padding: 0.7rem 1rem; border-bottom: 1px solid var(--color-border); }
th { color: var(--color-ink-soft); font-weight: 600; font-size: 0.78rem; text-transform: uppercase; }
tr:last-child td { border-bottom: none; }
.actions { white-space: nowrap; }

.badge {
  background: var(--color-accent-soft); color: var(--color-accent);
  padding: 0.15rem 0.55rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;
}

.empty { padding: 1.5rem; color: var(--color-ink-soft); font-size: 0.85rem; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: var(--color-surface); border-radius: var(--radius);
  padding: 1.5rem; width: 100%; max-width: 380px; border: 1px solid var(--color-border);
}
.modal h3 { margin: 0 0 1rem; font-size: 1rem; }
.modal label { display: block; font-size: 0.82rem; color: var(--color-ink-soft); margin: 0 0 0.3rem; }
.modal input, .modal select {
  width: 100%; padding: 0.5rem 0.65rem; margin-bottom: 0.9rem;
  border: 1px solid var(--color-border); border-radius: var(--radius);
  background: var(--color-bg); color: var(--color-ink); font-size: 0.87rem;
}
.modal-actions { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.5rem; }

.error {
  color: #d33; background: rgba(211,51,51,0.06); border: 1px solid #d33;
  border-radius: var(--radius); padding: 0.6rem 0.8rem; font-size: 0.82rem; margin-bottom: 0.9rem;
}
</style>
