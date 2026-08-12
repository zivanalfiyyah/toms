<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { icons } from '../../icons'

const auth = useAuthStore()
const router = useRouter()

const menu = [
  { to: '/admin', label: 'Dashboard', icon: 'rocket', exact: true },
  { to: '/admin/users', label: 'Pengguna', icon: 'hbif' },
  { to: '/admin/categories', label: 'Kategori & Halaman', icon: 'folder' },
  { to: '/admin/import', label: 'Import Word', icon: 'upload' },
  { to: '/admin/access-requests', label: 'Permintaan Akses', icon: 'inbox' },
]

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
          <li v-for="item in menu" :key="item.to">
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
  min-height: 100vh;
  background: var(--color-bg);
}

.admin-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}

.admin-brand {
  padding: 1.25rem 1.5rem;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-ink);
}

.admin-nav {
  list-style: none;
  margin: 0;
  padding: 1rem 0.9rem;
  flex: 1;
}

.admin-nav-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.7rem;
  border-radius: var(--radius);
  color: var(--color-ink-soft);
  font-size: 0.88rem;
  text-decoration: none;
  margin-bottom: 0.15rem;
}
.admin-nav-link:hover { background: var(--color-accent-soft); color: var(--color-accent); }
.admin-nav-link.is-active { background: var(--color-accent-soft); color: var(--color-accent); font-weight: 600; }

.admin-nav-icon { width: 16px; height: 16px; flex-shrink: 0; }
.admin-nav-icon :deep(svg) { width: 100%; height: 100%; }

.admin-back {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
}
.admin-back a { font-size: 0.82rem; color: var(--color-ink-soft); }
.admin-back a:hover { color: var(--color-accent); }

.admin-content { flex: 1; min-width: 0; }

.admin-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}
.admin-topbar h1 { font-size: 1.1rem; margin: 0; font-family: var(--font-display); }
.admin-topbar-right { display: flex; align-items: center; gap: 0.9rem; }
.admin-user { font-size: 0.85rem; color: var(--color-ink-soft); }
.logout-btn {
  padding: 0.4rem 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-bg);
  color: var(--color-ink);
  font-size: 0.82rem;
  cursor: pointer;
}
.logout-btn:hover { background: var(--color-accent-soft); color: var(--color-accent); border-color: var(--color-accent); }

.admin-main { padding: 2rem; }

@media (max-width: 860px) {
  .admin-sidebar { display: none; }
  .admin-main { padding: 1.25rem; }
}
</style>