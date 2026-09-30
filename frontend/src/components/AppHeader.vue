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
import ThemeToggle from './ThemeToggle.vue'
import { icons } from '../icons'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

defineProps({
  showSidebar: { type: Boolean, default: true }
})

defineEmits(['open-search', 'toggle-sidebar'])
</script>

<style scoped>
.header {
  --pill-x: max(1.5rem, calc((100vw - 1440px) / 2 + 1.5rem)); /* sejajar dengan tepi sidebar */
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 calc(var(--pill-x) + 0.7rem);
  background: transparent;
  position: sticky;
  top: 0;
  z-index: 40;
}

/* Navbar melayang berbentuk pil: kaca transparan + garis cahaya tipis */
.header::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 4px var(--pill-x);
  border-radius: 999px;
  background:
    linear-gradient(90deg, rgba(14, 165, 233, 0.08), transparent 35%, transparent 65%, rgba(99, 102, 241, 0.07)),
    var(--nav-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 10px 30px -14px rgba(2, 132, 199, 0.35),
    0 2px 8px rgba(15, 23, 42, 0.06);
}

.header-left { display: flex; align-items: center; gap: 0.9rem; }

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
.brand { display: flex; align-items: center; gap: 0.6rem; }

.brand { transition: transform 0.2s ease; }
.brand:hover { transform: scale(1.03); }
.brand-logo {
  height: 32px;
  width: auto;
  display: block;
  /* Mode terang: logo asli (navy + emas) dengan bayangan biru tipis agar menonjol */
  filter: drop-shadow(0 2px 6px rgba(2, 132, 199, 0.28));
}

.search-btn {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 420px;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  padding: 0 0.5rem 0 1rem;
  color: var(--color-ink-soft);
  cursor: pointer;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 1px 2px rgba(15, 23, 42, 0.05);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.search-btn:hover {
  border-color: var(--color-accent-border);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px var(--color-accent-soft), 0 10px 24px -12px rgba(2, 132, 199, 0.45);
}
.search-btn .icon { width: 16px; height: 16px; flex-shrink: 0; transition: color 0.2s ease; }
.search-btn:hover .icon { color: var(--color-accent); }
.search-btn .icon :deep(svg) { width: 100%; height: 100%; }
.search-btn .label { flex: 1; text-align: left; font-size: 0.8rem; font-weight: 500; }
.search-btn kbd {
  font-family: var(--font-mono);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  border: 1px solid var(--color-accent-border);
  border-radius: 999px; padding: 3px 10px; font-size: 0.65rem; font-weight: 600;
}

.header-right { display: flex; align-items: center; gap: 0.5rem; }

.admin-btn {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 50%;
  cursor: pointer;
  color: var(--color-ink-soft);
}
.admin-btn:hover { color: var(--color-accent); border-color: var(--color-accent); }
.admin-btn { position: relative; }
.admin-btn span { width: 18px; height: 18px; display: block; }
/* Titik hijau = sudah login, tombol menuju Panel Admin */
.admin-btn.is-logged-in::after {
  content: ''; position: absolute; top: 3px; right: 3px;
  width: 9px; height: 9px; border-radius: 50%;
  background: #10b981; border: 2px solid var(--color-surface);
}
.admin-btn :deep(svg) { width: 100%; height: 100%; }

/* Mode gelap: logo dibalik jadi terang (warna emas dijaga) + cahaya biru; navbar bercahaya */
[data-theme='dark'] .brand-logo {
  filter: invert(1) hue-rotate(180deg) saturate(1.35) brightness(1.2) drop-shadow(0 0 12px rgba(56, 189, 248, 0.5));
}
[data-theme='dark'] .header::before {
  border-color: rgba(56, 189, 248, 0.22);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.07),
    0 0 40px -8px rgba(56, 189, 248, 0.45),
    0 0 90px -30px rgba(139, 92, 246, 0.5);
}
[data-theme='dark'] .search-btn {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 24px -10px rgba(56, 189, 248, 0.4);
}
[data-theme='dark'] .search-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12), 0 0 28px -6px rgba(56, 189, 248, 0.5);
}
[data-theme='dark'] .admin-btn:hover { box-shadow: 0 0 18px -4px rgba(56, 189, 248, 0.55); }

@media (max-width: 860px) {
  .header { --pill-x: 0.75rem; } /* di mobile tidak ada sidebar tetap */
  .hamburger { display: flex; }
  .search-btn .label, .search-btn kbd { display: none; }

  .search-btn {
    position: static;
    transform: none;
    max-width: 40px;
    padding: 0;
    justify-content: center;
    margin-left: auto;
  }

  .search-btn.hide-on-mobile-home {
    display: none !important;
  }
}
</style>