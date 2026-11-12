<template>
  <header class="header">
    <div class="shell nav-wrap">
      <router-link to="/" class="logo-btn" aria-label="TOMS Docs">
        <img src="/toms-logo-header.png" alt="TOMS Docs" class="logo-img" />
      </router-link>

      <nav class="nav" :class="{ open: mobileOpen }" aria-label="Navigasi utama" ref="navEl">
        <button :class="{ active: route.name === 'home' }" @click="go('/')">Beranda</button>

        <div class="nav-drop nav-mega">
          <button :class="{ active: isDocsArea, open: menu === 'docs' }" aria-haspopup="menu" :aria-expanded="menu === 'docs'" @click="toggle('docs')">
            Dokumentasi<em class="caret"></em>
          </button>
          <div v-if="menu === 'docs'" class="mega-menu" role="menu">
            <div class="mega-groups">
              <div v-for="(g, i) in megaGroups" :key="g.title" class="mega-group" :class="{ on: current === i }">
                <button class="mega-gbtn" @mouseenter="current = i" @focus="current = i" @click="current = i">
                  <i>{{ String(i + 1).padStart(2, '0') }}</i>
                  <span><b>{{ g.title }}</b><small>{{ g.desc }}</small></span>
                </button>
                <div class="mega-inline">
                  <button v-for="it in g.items" :key="it.to" class="mega-item" role="menuitem" @click="goTopic(it)">{{ it.label }}</button>
                </div>
              </div>
              <button class="mega-all" @click="go('/daftar-isi')">Buka Daftar Isi lengkap →</button>
            </div>
            <div class="mega-items">
              <div class="mega-head">
                <b>{{ megaGroups[current].title }}</b>
                <small>{{ megaGroups[current].items.length }} halaman</small>
              </div>
              <button v-for="it in megaGroups[current].items" :key="it.to" class="mega-item" role="menuitem" @click="goTopic(it)">{{ it.label }}</button>
            </div>
          </div>
        </div>

        <button :class="{ active: route.name === 'info' }" @click="go('/informasi')">Informasi</button>

        <div class="nav-drop">
          <button :class="{ active: isHelpArea, open: menu === 'help' }" aria-haspopup="menu" :aria-expanded="menu === 'help'" @click="toggle('help')">
            Bantuan<em class="caret"></em>
          </button>
          <div v-if="menu === 'help'" class="nav-menu" role="menu">
            <button v-for="h in helpLinks" :key="h.to" role="menuitem" @click="go(h.to)">
              <b>{{ h.label }}</b><small>{{ h.desc }}</small>
            </button>
          </div>
        </div>
        <template v-if="auth.isLoggedIn">
          <button v-if="auth.canEdit" class="m-only" @click="go('/admin')">Panel Admin</button>
          <button class="m-only" @click="go('/akun')">Akun Saya</button>
          <button class="m-only" @click="go('/akun/disukai')">Disukai ({{ likes.count }})</button>
          <button class="m-only danger" @click="logout">Keluar</button>
        </template>
      </nav>

      <div class="nav-actions">
        <button v-if="showSidebar" class="icon-btn sb-toggle" aria-label="Buka daftar bab" @click="$emit('toggle-sidebar')">
          <span v-html="icons.menu"></span>
        </button>
        <button class="icon-btn" aria-label="Cari dokumentasi (Ctrl K)" title="Cari dokumentasi (Ctrl K)" @click="$emit('open-search')">
          <span v-html="icons.search"></span>
        </button>
        <!-- Notifikasi hanya untuk pengguna yang sudah login -->
        <button v-if="auth.isLoggedIn" class="icon-btn" aria-label="Notifikasi" title="Notifikasi: Informasi & Pengumuman" @click="go('/informasi')">
          <span v-html="icons.bell"></span>
        </button>
        <button class="theme-btn" :aria-label="themeStore.dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'" @click="themeStore.toggle()">
          <span class="ic" v-html="themeStore.dark ? icons.sun : icons.moon"></span>
          <span>{{ themeStore.dark ? 'Light' : 'Dark' }}</span>
        </button>
        <div v-if="auth.isLoggedIn" ref="userEl" class="user-menu">
          <button class="profile" aria-haspopup="menu" :aria-expanded="menu === 'user'" @click="toggle('user')">
            <span>{{ initials }}</span>
            <i><b>{{ shortName }}</b><small>{{ roleLabel }}</small></i>
            <em class="caret"></em>
          </button>
          <div v-if="menu === 'user'" class="user-dropdown" role="menu">
            <div class="ud-head"><b>{{ auth.user?.name }}</b><small>{{ auth.user?.email }} • {{ roleLabel }}</small></div>
            <button v-if="auth.canEdit" role="menuitem" @click="go('/admin')">Panel Admin</button>
            <button role="menuitem" @click="go('/akun')">Akun Saya</button>
            <button role="menuitem" @click="go('/akun/disukai')">Disukai ({{ likes.count }})</button>
            <button role="menuitem" class="danger" @click="logout">Keluar</button>
          </div>
        </div>
        <button v-else class="login-btn" @click="go('/login')">Login</button>
        <button class="mobile-menu" :aria-expanded="mobileOpen" aria-label="Buka menu navigasi" @click="mobileOpen = !mobileOpen">
          <span v-html="mobileOpen ? icons.close : icons.menu"></span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { megaGroups } from '../data/megaMenu'
import { useDocsStore } from '../stores/docs'
import { useTocStore } from '../stores/toc'
import { buildIndex } from '../utils/searchIndex'
import { resolveTopic } from '../utils/resolveTopic'
import { helpLinks } from '../data/helpLinks'
import { icons } from '../icons'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { useLikesStore } from '../stores/likes'

defineProps({ showSidebar: { type: Boolean, default: false } })
defineEmits(['open-search', 'toggle-sidebar'])

const auth = useAuthStore()
const themeStore = useThemeStore()
const likes = useLikesStore()
const userEl = ref(null)
const route = useRoute()
const router = useRouter()
const mobileOpen = ref(false)
const menu = ref('')
const current = ref(0)
const navEl = ref(null)

const isDocsArea = computed(() => route.name === 'toc' || route.path.startsWith('/docs'))
const isHelpArea = computed(() => helpLinks.some((h) => h.to === route.path))

function toggle(name) { menu.value = menu.value === name ? '' : name; if (name === 'docs' && menu.value === 'docs') ensureTree() }
const docsStore = useDocsStore()
const tocStore = useTocStore()
const topicIndex = computed(() => buildIndex(tocStore.tree))
// Menu Dokumentasi dicocokkan ke halaman asli berdasarkan judul (bukan alamat tebakan).
function topicTo(it) {
  const hit = resolveTopic(topicIndex.value, it.label)
  return hit ? `/docs/${hit.path}` : null
}
function goTopic(it) {
  const to = topicTo(it)
  go(to || `/daftar-isi?cari=${encodeURIComponent(it.label)}`)
}
async function ensureTree() {
  if (!docsStore.categories.length) await docsStore.fetchCategories()
  tocStore.load(docsStore.categories, { ttl: 5 * 60 * 1000 })
}
function go(to) { menu.value = ''; mobileOpen.value = false; router.push(to) }

function onDown(e) {
  const inNav = navEl.value && navEl.value.contains(e.target)
  const inUser = userEl.value && userEl.value.contains(e.target)
  if (!inNav && !inUser) menu.value = ''
}
const initials = computed(() => (auth.user?.name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase())
const shortName = computed(() => (auth.user?.name || '').split(/\s+/).slice(0, 2).join(' '))
const roleLabel = computed(() => ({ admin: 'Admin', editor: 'Editor', viewer: 'Viewer' }[auth.roleNames[0]] || 'Viewer'))
async function logout() {
  menu.value = ''
  mobileOpen.value = false
  await auth.logout()
  likes.reset()
  router.push('/')
}
watch(() => auth.isLoggedIn, (v) => { if (v) likes.fetch().catch(() => {}) }, { immediate: true })
function onKey(e) { if (e.key === 'Escape') menu.value = '' }
onMounted(() => { document.addEventListener('mousedown', onDown); document.addEventListener('keydown', onKey) })
onBeforeUnmount(() => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) })
watch(() => route.fullPath, () => { menu.value = ''; mobileOpen.value = false })
</script>

<style>
.header .icon-btn svg, .header .theme-btn svg { width: 18px; height: 18px; }
.header .mobile-menu svg { width: 24px; height: 24px; }
.header .sb-toggle { display: none; }
@media (max-width: 1000px) { .header .sb-toggle { display: flex; } }
@media (max-width: 760px) { .header .sb-toggle { display: none; } }
.header .mobile-menu { color: var(--ink); cursor: pointer; }
.header .icon-btn, .header .theme-btn { color: var(--ink); }
</style>
