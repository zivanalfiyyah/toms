<template>
  <header class="header">
    <div class="header-left">
      <button
        v-if="showSidebar"
        class="hamburger"
        @click="$emit('toggle-sidebar')"
        aria-label="Buka menu"
      >
        <span></span><span></span><span></span>
      </button>

      <router-link to="/" class="brand">
        <img src="/toms-logo-header.png" alt="TOMS Docs" class="brand-logo" />
      </router-link>
    </div>

    <nav class="top-nav" aria-label="Navigasi utama">
      <router-link to="/" class="nav-link" :class="{ active: route.name === 'home' }">Beranda</router-link>
      <router-link to="/daftar-isi" class="nav-link" :class="{ active: isDocsArea }">Dokumentasi</router-link>
    </nav>

    <button
      class="search-btn"
      :class="{ 'hide-on-mobile-home': !showSidebar }"
      @click="$emit('open-search')"
    >
      <span v-html="icons.search" class="icon"></span>
      <span class="label">Cari dokumentasi&hellip;</span>
      <kbd>Ctrl K</kbd>
    </button>

    <div class="header-right">
      <router-link
        :to="auth.canEdit ? '/admin' : '/admin/login'"
        class="admin-btn"
        :class="{ 'is-logged-in': auth.canEdit }"
        :aria-label="auth.canEdit ? 'Panel Admin' : 'Login Admin'"
        :title="auth.canEdit ? 'Panel Admin' : 'Login Admin'"
      >
        <span v-html="icons.hbif"></span>
      </router-link>
      <ThemeToggle />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'
import { icons } from '../icons'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const route = useRoute()

// Menu "Dokumentasi" menyala di Daftar Isi dan semua halaman /docs/...
const isDocsArea = computed(() => route.name === 'toc' || route.path.startsWith('/docs'))

defineProps({
  showSidebar: { type: Boolean, default: true }
})

defineEmits(['open-search', 'toggle-sidebar'])
</script>

<style scoped>
/* Navbar penuh selebar layar, putih solid, garis bawah + bayangan halus (gaya aplikasi dokumentasi) */
.header {
  display: flex;
  align-items: center;
  gap: 22px;
  height: var(--header-h);
  padding: 0 30px;
  background: var(--nav-bg);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: 0 3px 16px rgba(28, 58, 84, 0.075);
  position: sticky;
  top: 0;
  z-index: 40;
}

.header-left { display: flex; align-items: center; gap: 0.9rem; width: 190px; flex: 0 0 190px; }

.hamburger {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.hamburger span { width: 20px; height: 2px; background: var(--color-ink-soft); border-radius: 2px; }
.brand { display: flex; align-items: center; gap: 0.6rem; transition: transform 0.2s ease; }
.brand:hover { transform: scale(1.02); }
.brand-logo {
  height: 34px;
  width: auto;
  display: block;
}

/* Menu utama */
.top-nav { display: flex; align-items: center; gap: 2px; height: 100%; }
.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  color: var(--color-ink-soft);
  font-size: 12px;
  font-weight: 700;
  transition: 0.18s ease;
}
.nav-link:hover { color: var(--color-accent); background: var(--color-bg); text-decoration: none; }
.nav-link.active { color: var(--color-accent); background: var(--color-accent-soft); }
.nav-link.active::after {
  content: '';
  position: absolute;
  left: 12px; right: 12px; bottom: 2px;
  height: 2px;
  border-radius: 5px;
  background: var(--color-accent-strong);
}

/* Kotak pencarian (tetap tombol yang membuka SearchModal) */
.search-btn {
  margin-left: auto;
  width: min(365px, 31vw);
  height: 40px;
  display: flex;
  align-items: center;
  gap: 9px;
  background: var(--input-bg);
  border: 1px solid var(--color-border);
  border-radius: 11px;
  padding: 0 10px 0 14px;
  color: var(--color-ink-soft);
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.search-btn:hover {
  border-color: #92cdec;
  background: var(--color-surface);
  box-shadow: 0 0 0 3px rgba(8, 127, 201, 0.07);
}
.search-btn .icon { width: 16px; height: 16px; flex-shrink: 0; transition: color 0.2s ease; }
.search-btn:hover .icon { color: var(--color-accent); }
.search-btn .icon :deep(svg) { width: 100%; height: 100%; }
.search-btn .label { flex: 1; text-align: left; font-size: 12px; font-weight: 500; }
.search-btn kbd {
  font-family: var(--font-body);
  background: var(--color-bg);
  color: var(--color-ink-soft);
  border: 1px solid var(--color-border);
  border-radius: 6px; padding: 3px 7px; font-size: 9px; font-weight: 800; white-space: nowrap;
}

.header-right { display: flex; align-items: center; gap: 8px; }

.admin-btn {
  display: flex; align-items: center; justify-content: center;
  width: 38px; height: 38px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 50%;
  cursor: pointer;
  color: var(--color-ink-soft);
  transition: 0.18s ease;
}
.admin-btn:hover { color: var(--color-accent); border-color: #a8d7f3; background: var(--color-bg); }
.admin-btn { position: relative; }
.admin-btn span { width: 18px; height: 18px; display: block; }
/* Titik hijau = sudah login, tombol menuju Panel Admin */
.admin-btn.is-logged-in::after {
  content: ''; position: absolute; top: 3px; right: 3px;
  width: 9px; height: 9px; border-radius: 50%;
  background: #10b981; border: 2px solid var(--color-surface);
}
.admin-btn :deep(svg) { width: 100%; height: 100%; }

/* Mode gelap: logo dibalik jadi terang (warna emas dijaga) */
[data-theme='dark'] .brand-logo {
  filter: invert(1) hue-rotate(180deg) saturate(1.35) brightness(1.2);
}
[data-theme='dark'] .header { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.22); }
[data-theme='dark'] .search-btn:hover { background: rgba(255, 255, 255, 0.06); box-shadow: 0 0 0 3px rgba(85, 181, 235, 0.12); }
[data-theme='dark'] .nav-link:hover { background: #1a3044; }
[data-theme='dark'] .admin-btn:hover { background: #1a3044; }

@media (max-width: 1120px) {
  .top-nav { display: none; }
}

@media (max-width: 860px) {
  .header { padding: 0 15px; gap: 12px; }
  .header-left { width: auto; flex: 1; }
  .hamburger { display: flex; }
  .search-btn .label, .search-btn kbd { display: none; }

  .search-btn {
    width: 40px;
    padding: 0;
    justify-content: center;
    margin-left: auto;
  }

  .search-btn.hide-on-mobile-home {
    display: none !important;
  }
}
</style>