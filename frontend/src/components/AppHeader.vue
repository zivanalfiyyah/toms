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
        v-if="!auth.isLoggedIn"
        to="/admin/login"
        class="admin-btn"
        aria-label="Login Admin"
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.75rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 40;
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

.hamburger span { width: 20px; height: 2px; background: var(--color-ink); }
.brand { display: flex; align-items: center; gap: 0.6rem; }

.brand-logo {
  height: 28px;
  width: auto;
  display: block;
}

.search-btn {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 380px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 0.5rem 0.8rem;
  color: var(--color-ink-soft);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.search-btn:hover { border-color: var(--color-accent); }
.search-btn .icon { width: 15px; height: 15px; flex-shrink: 0; }
.search-btn .icon :deep(svg) { width: 100%; height: 100%; }
.search-btn .label { flex: 1; text-align: left; font-size: 0.875rem; }
.search-btn kbd {
  font-family: var(--font-mono);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px; padding: 1px 6px; font-size: 0.72rem;
}

.header-right { display: flex; align-items: center; gap: 0.6rem; }

.admin-btn {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-ink-soft);
}
.admin-btn:hover { color: var(--color-accent); border-color: var(--color-accent); }
.admin-btn span { width: 18px; height: 18px; display: block; }
.admin-btn :deep(svg) { width: 100%; height: 100%; }

@media (max-width: 860px) {
  .hamburger { display: flex; }
  .search-btn .label, .search-btn kbd { display: none; }

  .search-btn {
    position: static;
    transform: none;
    max-width: 40px;
    padding: 0.5rem;
    justify-content: center;
    margin-left: auto;
  }

  .search-btn.hide-on-mobile-home {
    display: none !important;
  }
}
</style>