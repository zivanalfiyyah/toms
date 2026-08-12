<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import SearchModal from './components/SearchModal.vue'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'

const searchOpen = ref(false)
const sidebarOpen = ref(false)
const themeStore = useThemeStore()
const authStore = useAuthStore()
const route = useRoute()

// Halaman login, request-access, accept-invite, & seluruh area admin punya
// layout sendiri (tanpa header/sidebar dokumentasi).
const isBareLayout = computed(() =>
  ['login', 'request-access', 'accept-invite'].includes(route.name) || route.path.startsWith('/admin')
)

// Sidebar dokumentasi disembunyikan di halaman Home ("/") dan di layout bare.
const showSidebar = computed(() => route.name !== 'home' && !isBareLayout.value)

onMounted(() => {
  themeStore.init()
  window.addEventListener('keydown', onGlobalKeydown)

  // Token di localStorage bisa saja sudah expired/invalid di sisi server.
  // Validasi ke backend supaya link Admin Panel dkk tidak salah muncul
  // untuk sesi yang sebenarnya sudah tidak berlaku.
  if (authStore.token) {
    authStore.fetchMe().catch(() => {
      authStore.token = null
      authStore.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    })
  }
})

function onGlobalKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    searchOpen.value = true
  }
}
</script>


<style scoped>
.app-body { display: flex; position: relative; }
.app-main { flex: 1; min-width: 0; padding: 2rem clamp(1.25rem, 4vw, 3rem); }
.app-main.no-sidebar { max-width: 960px; margin: 0 auto; }
</style>


<template>
  <div v-if="isBareLayout" class="app-shell-bare">
    <router-view />
  </div>
  <div v-else class="app-shell">
    <AppHeader 
      :show-sidebar="showSidebar" 
      @open-search="searchOpen = true" 
      @toggle-sidebar="sidebarOpen = !sidebarOpen" 
    />
    <div class="app-body">
      <AppSidebar
        v-if="showSidebar"
        :class="{ 'is-open': sidebarOpen }"
        @navigate="sidebarOpen = false"
      />
      <main class="app-main" :class="{ 'no-sidebar': !showSidebar }">
        <router-view />
      </main>
    </div>
    <SearchModal v-if="searchOpen" @close="searchOpen = false" />
  </div>
</template>