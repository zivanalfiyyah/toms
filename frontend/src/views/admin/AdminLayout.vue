<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useAdminStore } from '../../stores/admin'
import AdminSearchModal from '../../components/admin/AdminSearchModal.vue'

const auth = useAuthStore()
const admin = useAdminStore()
const router = useRouter()

const menu = [
  { to: '/admin', label: 'Dashboard', icon: 'rocket', exact: true },
  { to: '/admin/users', label: 'Pengguna', icon: 'hbif', adminOnly: true },
  { to: '/admin/akses', label: 'Akses Pengguna', icon: 'hbif', adminOnly: true, badge: true },
  { to: '/admin/categories', label: 'Kategori & Halaman', icon: 'folder' },
  { to: '/admin/import', label: 'Import Word', icon: 'upload' },
  { to: '/admin/informasi', label: 'Informasi', icon: 'bell' },
  { to: '/admin/dashboard-kinerja', label: 'Dashboard Kinerja', icon: 'rocket' },
  { to: '/admin/konten', label: 'Konten Portal', icon: 'dictionary' },
  { to: '/admin/audit', label: 'Log Audit', icon: 'dictionary', adminOnly: true },
  { to: '/admin/laporan', label: 'Laporan Bantuan', icon: 'inbox', adminOnly: true },
]

const visibleMenu = menu.filter((item) => !item.adminOnly || auth.roleNames.includes('admin'))

// Pencarian panel admin (Ctrl/Cmd + K). Ditangkap di fase capture supaya handler
// global App.vue (pencarian dokumentasi) tidak ikut aktif dan menandai modalnya
// terbuka sebelum Anda kembali ke halaman dokumentasi.
const searchOpen = ref(false)

function onSearchShortcut(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    e.stopImmediatePropagation()
    searchOpen.value = true
  }
}
const isAdmin = computed(() => auth.roleNames.includes('admin'))
const pendingCount = computed(() => admin.users.filter((u) => u.status === 'pending').length)
const roleLabel = computed(() => {
  const r = auth.roleNames[0] || ''
  return r ? r.charAt(0).toUpperCase() + r.slice(1) : ''
})

onMounted(() => {
  window.addEventListener('keydown', onSearchShortcut, true)
  if (isAdmin.value) admin.fetchUsers()
})
onBeforeUnmount(() => window.removeEventListener('keydown', onSearchShortcut, true))

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="adm">
    <aside class="adm-side">
      <b class="adm-brand">Admin Panel</b>
      <nav>
        <router-link v-for="item in visibleMenu" :key="item.to" :to="item.to" custom v-slot="{ href, navigate, isActive, isExactActive }">
          <a :href="href" class="adm-nav" :class="{ on: item.exact ? isExactActive : isActive }" @click="navigate">
            {{ item.label }}<em v-if="item.badge && pendingCount">{{ pendingCount }}</em>
          </a>
        </router-link>
      </nav>
      <router-link to="/" class="adm-back">&larr; Kembali ke Dokumentasi</router-link>
    </aside>

    <div class="adm-main">
      <header class="adm-top">
        <h1>Panel Admin</h1>
        <div class="adm-search">
          <input readonly placeholder="Cari halaman dokumentasi..." aria-label="Cari di panel admin" @click="searchOpen = true" @focus="searchOpen = true" />
          <kbd>Ctrl K</kbd>
        </div>
        <div class="adm-user">
          <span>{{ auth.user?.name || auth.user?.email }}<template v-if="roleLabel"> • {{ roleLabel }}</template></span>
          <button type="button" class="outline-btn" @click="handleLogout">Logout</button>
        </div>
      </header>
      <main class="adm-body">
        <router-view />
      </main>
    </div>
    <AdminSearchModal v-if="searchOpen" :menu="visibleMenu" @close="searchOpen = false" />
  </div>
</template>
