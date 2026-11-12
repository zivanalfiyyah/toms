<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/admin'
import { useAuthStore } from '../../stores/auth'

const admin = useAdminStore()
const auth = useAuthStore()
const router = useRouter()

onMounted(() => {
  admin.fetchStats()
  if (auth.roleNames.includes('admin')) admin.fetchUsers()
})

const cards = [
  { key: 'users_count', label: 'Total Pengguna' },
  { key: 'categories_count', label: 'Total Kategori' },
  { key: 'pages_count', label: 'Total Halaman' },
  { key: 'children_count', label: 'Total Sub-Halaman' },
]
const pending = computed(() => admin.users.filter((u) => u.status === 'pending').length)
const isAdmin = computed(() => auth.roleNames.includes('admin'))
</script>

<template>
  <div>
    <p v-if="admin.error" class="error">{{ admin.error }}</p>

    <div class="adm-stats">
      <div v-for="c in cards" :key="c.key" class="adm-stat">
        <small>{{ c.label }}</small>
        <b>{{ admin.stats ? admin.stats[c.key] : '…' }}</b>
      </div>
    </div>

    <div v-if="isAdmin && pending > 0" class="adm-card adm-note">
      <div>
        <b>{{ pending }} permintaan akses menunggu</b>
        <p>Tinjau pendaftaran baru dan tentukan perannya.</p>
      </div>
      <button class="annex-link" @click="router.push('/admin/akses')">Buka Akses Pengguna</button>
    </div>

    <div class="adm-card adm-note">
      <div>
        <b>Kelola isi dokumentasi</b>
        <p>Edit isi halaman atau impor naskah dari file Word (.docx).</p>
      </div>
      <div class="acct-btns">
        <button class="annex-link" @click="router.push('/admin/categories')">Kategori &amp; Halaman</button>
        <button class="annex-link" @click="router.push('/admin/import')">Import Word</button>
      </div>
    </div>
  </div>
</template>
