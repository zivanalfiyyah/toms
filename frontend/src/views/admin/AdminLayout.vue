<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { icons } from '../../icons'

const auth = useAuthStore()
const router = useRouter()

const menu = [
  { to: '/admin', label: 'Dashboard', icon: 'rocket', exact: true },
  { to: '/admin/users', label: 'Pengguna', icon: 'hbif', adminOnly: true },
  { to: '/admin/categories', label: 'Kategori & Halaman', icon: 'folder' },
  { to: '/admin/import', label: 'Import Word', icon: 'upload' },
  { to: '/admin/access-requests', label: 'Permintaan Akses', icon: 'inbox', adminOnly: true },
]

const visibleMenu = menu.filter((item) => !item.adminOnly || auth.roleNames.includes('admin'))

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="admin-brand">
        <span>Admin Panel</span>
      </div>
      <nav>
        <ul class="admin-nav">
          <li v-for="item in visibleMenu" :key="item.to">
            <router-link :to="item.to" class="admin-nav-link" :exact-active-class="'is-active'" :active-class="item.exact ? '' : 'is-active'">
              <span v-if="icons[item.icon]" v-html="icons[item.icon]" class="admin-nav-icon"></span>
              {{ item.label }}
            </router-link>
          </li>
        </ul>
      </nav>
      <div class="admin-back">
        <router-link to="/">&larr; Kembali ke Dokumentasi</router-link>
      </div>
    </aside>

    <div class="admin-content">
      <header class="admin-topbar">
        <h1>Panel Admin</h1>
        <div class="admin-topbar-right">
          <span class="admin-user">{{ auth.user?.name || auth.user?.email }}</span>
          <button type="button" class="logout-btn" @click="handleLogout">Logout</button>
        </div>
      </header>
      <main class="admin-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  display: flex;
  gap: 1.25rem;
  padding: 1rem;
  min-height: 100vh;
  background: transparent; /* glow latar dari main.css tampil */
}

.admin-sidebar {
  width: 248px;
  flex-shrink: 0;
  background: var(--color-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-a);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 1rem;
  align-self: flex-start;
  height: calc(100vh - 2rem);
  overflow: hidden;
}

.admin-brand {
  padding: 1.35rem 1.5rem;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: -0.02em;
  border-bottom: 1px solid var(--glass-border);
}
.admin-brand span {
  background: linear-gradient(90deg, #0284c7, #0ea5e9, #06b6d4);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
[data-theme='dark'] .admin-brand span { background-image: linear-gradient(90deg, #38bdf8, #7dd3fc, #67e8f9); }

.admin-nav { list-style: none; margin: 0; padding: 1rem 0.85rem; flex: 1; overflow-y: auto; }

.admin-nav-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius);
  border: 1px solid transparent;
  color: var(--color-ink-soft);
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  margin-bottom: 0.2rem;
  transition: background 0.15s ease, color 0.15s ease;
}
.admin-nav-link:hover { background: var(--color-accent-soft); color: var(--color-ink); text-decoration: none; }
.admin-nav-link.is-active {
  background: var(--color-accent-soft); color: var(--color-accent); font-weight: 700;
  border-color: var(--color-accent-border); box-shadow: var(--glow-active);
}

.admin-nav-icon { width: 16px; height: 16px; flex-shrink: 0; }
.admin-nav-icon :deep(svg) { width: 100%; height: 100%; }

.admin-back { padding: 1rem 1.5rem; border-top: 1px solid var(--glass-border); }
.admin-back a { font-size: 0.8rem; font-weight: 500; color: var(--color-ink-soft); }
.admin-back a:hover { color: var(--color-accent); text-decoration: none; }

.admin-content { flex: 1; min-width: 0; }

/* Topbar melayang, kaca transparan seperti navbar dokumentasi */
.admin-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0.8rem 0.7rem 1.5rem;
  background:
    linear-gradient(90deg, rgba(14, 165, 233, 0.08), transparent 35%, transparent 65%, rgba(99, 102, 241, 0.07)),
    var(--nav-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  box-shadow: var(--shadow-card);
  position: sticky;
  top: 1rem;
  z-index: 10;
  margin-bottom: 1.5rem;
}
.admin-topbar h1 { font-size: 1.05rem; font-weight: 800; letter-spacing: -0.02em; margin: 0; font-family: var(--font-display); }
.admin-topbar-right { display: flex; align-items: center; gap: 0.9rem; }
.admin-user { font-size: 0.82rem; font-weight: 500; color: var(--color-ink-soft); }
.logout-btn {
  padding: 0.5rem 1.1rem;
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: var(--glass-bg);
  color: var(--color-ink);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.logout-btn:hover { background: var(--color-accent-soft); color: var(--color-accent); border-color: var(--color-accent-border); box-shadow: var(--glow-active); }

.admin-main { padding: 0 0.25rem 2rem; }

@media (max-width: 860px) {
  .admin-shell { padding: 0.75rem; }
  .admin-sidebar { display: none; }
  .admin-topbar { top: 0.75rem; }
}
</style>