<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import SearchModal from './components/SearchModal.vue'
import { useUiStore } from './stores/ui'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'
import { storeToRefs } from 'pinia'
import { usePortalStore } from './stores/portal'

const portal = usePortalStore()
portal.load()
const { contact } = storeToRefs(portal)
const searchOpen = ref(false)
const themeStore = useThemeStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const ui = useUiStore()
function goLogin() {
  const redirect = ui.redirect
  ui.close()
  router.push({ name: 'login', query: redirect ? { redirect } : {} })
}

// Halaman login & seluruh area admin punya
// layout sendiri (tanpa header/sidebar dokumentasi).
const isBareLayout = computed(() =>
  route.path.startsWith('/admin') && route.name !== 'admin-login'
)

// Sidebar dokumentasi disembunyikan di halaman Home ("/") dan di layout bare.
// Halaman ber-desain portal (hero/section sendiri) tampil selebar layar tanpa padding bawaan
const isWide = computed(() => ['home', 'info', 'faq', 'bantuan', 'panduan', 'dashboard', 'toc', 'login', 'admin-login', 'register', 'account', 'account-likes', 'info-detail'].includes(route.name) || (route.path.startsWith('/docs') && !route.path.endsWith('/edit')))


// Header transparan di atas hero berubah solid setelah di-scroll
function updateScrolled() {
  document.documentElement.classList.toggle('is-scrolled', window.scrollY > 60)
}

onMounted(() => {
  themeStore.init()
  window.addEventListener('scroll', updateScrolled, { passive: true })
  updateScrolled()
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
.app-body:has(.app-main.is-wide) { max-width: none; }
.app-main.is-wide { max-width: none; padding: 0; }

/* Footer gelap */
.toms-footer { background: #020a1c; color: #c4d4e8; padding: 56px max(24px, calc((100vw - 1240px) / 2)) 0; }
.footer-grid { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1.2fr; gap: 55px; padding-bottom: 42px; }
.footer-logo { height: 44px; width: auto; filter: brightness(0) invert(1); }
.toms-footer p { margin: 4px 0 0; max-width: 300px; font-size: 12px; line-height: 1.9; color: #91a6c1; }
.toms-footer h4 { margin: 3px 0 16px; font-size: 13px; font-weight: 400; color: var(--gold-2); }
.toms-footer a { display: block; margin-bottom: 11px; font-size: 12px; color: #91a6c1; }
.toms-footer a:hover { color: #fff; text-decoration: none; }
.system-ok { display: inline-flex; align-items: center; gap: 8px; margin-top: 14px; padding: 9px 12px; border-radius: 999px; background: rgba(255, 255, 255, 0.07); font-size: 11px; }
.system-ok i { width: 7px; height: 7px; border-radius: 50%; background: #2bd47d; }
.footer-copy { padding: 20px 0 24px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 11px; color: #7c90ab; }

@media (max-width: 860px) {
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
}
@media (max-width: 520px) {
  .footer-grid { grid-template-columns: 1fr; }
}
</style>


<template>
  <div v-if="isBareLayout" class="app-shell-bare">
    <router-view />
  </div>
  <div v-else class="app-shell">
    <AppHeader @open-search="searchOpen = true" />
    <div class="app-body">
      <main class="app-main" :class="{ 'no-sidebar': true, 'is-wide': isWide }">
        <router-view />
      </main>
    </div>

    <footer class="toms-footer">
      <div class="footer-grid">
        <div>
          <img src="/toms-logo-header.png" alt="TOMS" class="footer-logo" />
          <p>Pusat informasi, dokumentasi, dan pemantauan operasional transportasi perusahaan.</p>
          <span class="system-ok"><i></i> Seluruh sistem beroperasi normal</span>
        </div>
        <div>
          <h4>Navigasi</h4>
          <router-link to="/daftar-isi">Pusat Dokumentasi</router-link>
          <router-link to="/dashboard">Dashboard Kinerja</router-link>
          <router-link to="/informasi">Informasi &amp; Pengumuman</router-link>
        </div>
        <div>
          <h4>Dukungan</h4>
          <router-link to="/faq">FAQ</router-link>
          <router-link to="/bantuan">Pusat Bantuan</router-link>
          <router-link to="/bantuan">Laporkan Kendala</router-link>
          <router-link to="/panduan-penggunaan">Panduan Penggunaan</router-link>
        </div>
        <div>
          <h4>Kontak Operasional</h4>
          <p>{{ contact.email }}<br />{{ contact.phone }}<br />{{ contact.hours }}</p>
        </div>
      </div>
      <div class="footer-copy"><span>© {{ currentYear }} TOMS. Internal Operational Portal.</span></div>
    </footer>

    <SearchModal v-if="searchOpen" @close="searchOpen = false" />

    <Teleport to="body">
      <div v-if="ui.loginPrompt" class="lp-overlay" @click.self="ui.close()">
        <div class="lp-box" role="alertdialog" aria-labelledby="lp-title">
          <div class="lp-ico">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>
          </div>
          <h3 id="lp-title">Anda harus login terlebih dahulu</h3>
          <p>Halaman ini hanya bisa dibuka setelah Anda masuk ke akun TOMS.</p>
          <div class="lp-btns">
            <button type="button" class="lp-cancel" @click="ui.close()">Nanti saja</button>
            <button type="button" class="lp-ok" @click="goLogin">Login</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>