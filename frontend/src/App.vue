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

const currentYear = new Date().getFullYear()

function onGlobalKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    searchOpen.value = true
  }
}
</script>


<style scoped>
/* Susunan halaman: navbar, isi (sidebar + konten), lalu footer di dasar */
.app-shell { display: flex; flex-direction: column; min-height: 100vh; }
.app-body { display: flex; flex: 1; position: relative; max-width: 1340px; margin: 0 auto; width: 100%; }
.app-main { flex: 1; min-width: 0; padding: 1.5rem clamp(1rem, 2.5vw, 1.5rem) 3rem; }
.app-main.no-sidebar { max-width: 1152px; margin: 0 auto; }

/* Footer */
.toms-footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 0 30px;
}
.footer-inner {
  max-width: 1340px;
  min-height: 92px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
}
.footer-brand { display: flex; align-items: center; gap: 10px; }
.footer-mark {
  width: 31px; height: 31px;
  display: grid; place-items: center;
  border-radius: 8px;
  background: var(--color-accent-soft);
  border: 1px solid var(--color-accent-border);
  color: var(--color-accent);
  font-size: 13px; font-weight: 900;
}
.footer-name { color: var(--color-ink); font-size: 12px; font-weight: 800; }
.footer-desc { color: var(--color-ink-soft); font-size: 10px; margin-top: 2px; }
.footer-links { display: flex; align-items: center; gap: 20px; }
.footer-links a { color: var(--color-ink-soft); font-size: 10px; font-weight: 650; }
.footer-links a:hover { color: var(--color-accent); text-decoration: none; }
.footer-copy { color: var(--color-ink-soft); font-size: 10px; text-align: right; }

@media (max-width: 860px) {
  .toms-footer { padding: 0 18px; }
  .footer-inner {
    padding: 22px 0;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .footer-links { gap: 15px; flex-wrap: wrap; }
  .footer-copy { text-align: left; }
}
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

    <footer class="toms-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-mark">T</div>
          <div>
            <div class="footer-name">TOMS Documentation</div>
            <div class="footer-desc">Pusat informasi dan dokumentasi operasional</div>
          </div>
        </div>

        <nav class="footer-links" aria-label="Navigasi footer">
          <router-link to="/">Beranda</router-link>
          <router-link to="/daftar-isi">Dokumentasi</router-link>
        </nav>

        <div class="footer-copy">© {{ currentYear }} TOMS. All rights reserved.</div>
      </div>
    </footer>

    <SearchModal v-if="searchOpen" @close="searchOpen = false" />
  </div>
</template>