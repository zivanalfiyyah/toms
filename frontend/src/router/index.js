import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CategoryPage from '../views/CategoryPage.vue'
import DocPage from '../views/DocPage.vue'
import LoginPage from '../views/LoginPage.vue'
import EditPage from '../views/EditPage.vue'
import CategoryEditPage from '../views/CategoryEditPage.vue'
import PageIndexPage from '../views/PageIndexPage.vue'
import TocPage from '../views/TocPage.vue'
import FaqPage from '../views/FaqPage.vue'
import HelpPage from '../views/HelpPage.vue'
import UserGuidePage from '../views/UserGuidePage.vue'
import InfoPage from '../views/InfoPage.vue'
import DashboardKinerjaPage from '../views/DashboardKinerjaPage.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'
import AdminDashboard from '../views/admin/DashboardPage.vue'
import AdminUsers from '../views/admin/UsersPage.vue'
import AdminCategories from '../views/admin/CategoriesPage.vue'
import AdminImport from '../views/admin/ImportPage.vue'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/login', name: 'login', component: LoginPage },
  { path: '/daftar', name: 'register', component: () => import('../views/RegisterPage.vue') },
  { path: '/akun', name: 'account', component: () => import('../views/AccountPage.vue'), meta: { requiresAuth: true } },
  { path: '/akun/disukai', name: 'account-likes', component: () => import('../views/AccountPage.vue'), meta: { requiresAuth: true } },
  { path: '/informasi/:id', name: 'info-detail', component: () => import('../views/InfoDetailPage.vue') },
  { path: '/daftar-isi', name: 'toc', component: TocPage },
  { path: '/faq', name: 'faq', component: FaqPage },
  { path: '/dokumen-terbaru', name: 'latest-docs', component: () => import('../views/LatestDocsPage.vue'), meta: { loginPopup: true } },
  { path: '/bantuan', name: 'bantuan', component: HelpPage },
  { path: '/panduan-penggunaan', name: 'panduan', component: UserGuidePage },
  { path: '/informasi', name: 'info', component: InfoPage },
  { path: '/dashboard', name: 'dashboard', component: DashboardKinerjaPage, meta: { loginPopup: true } },
  { path: '/docs/:category', name: 'category-page', component: CategoryPage, props: true, meta: { loginPopup: true } },


  {
    path: '/docs/:category/edit',
    name: 'edit-category',
    component: CategoryEditPage,
    meta: { requiresAdmin: true },
    props: (route) => ({
      category: route.params.category,
      slugs: []
    })
  },
  {
    path: '/docs/:category/:slugs+/edit',
    name: 'edit-page',
    component: EditPage,
    meta: { requiresAdmin: true },
    props: (route) => ({
      category: route.params.category,
      slugs: Array.isArray(route.params.slugs) ? route.params.slugs : [route.params.slugs]
    })
  },
  {
    path: '/docs/:category/:slugs+',
    name: 'doc-page',
    component: DocPage,
    meta: { loginPopup: true },
    props: (route) => ({
      category: route.params.category,
      slugs: Array.isArray(route.params.slugs) ? route.params.slugs : [route.params.slugs]
    })
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      { path: '', name: 'admin-dashboard', component: AdminDashboard },
      { path: 'audit', name: 'admin-audit', component: () => import('../views/admin/AuditPage.vue'), meta: { requiresAdmin: true, adminOnly: true } },
      { path: 'akses', name: 'admin-access', component: () => import('../views/admin/AccessPage.vue'), meta: { requiresAdmin: true, adminOnly: true } },
      { path: 'users', name: 'admin-users', component: AdminUsers, meta: { requiresAdmin: true, adminOnly: true } },
      { path: 'categories', name: 'admin-categories', component: AdminCategories },
      { path: 'import', name: 'admin-import', component: AdminImport },
      { path: 'informasi', name: 'admin-info', component: () => import('../views/admin/AnnouncementsPage.vue') },
      { path: 'dashboard-kinerja', name: 'admin-kpi', component: () => import('../views/admin/DashboardDataPage.vue') },
      { path: 'konten', name: 'admin-content', component: () => import('../views/admin/SettingsPage.vue') },
      { path: 'laporan', name: 'admin-tickets', component: () => import('../views/admin/TicketsPage.vue'), meta: { requiresAdmin: true, adminOnly: true } },
      { path: 'logs', redirect: '/admin' },
      { path: 'settings', redirect: '/admin' }
    ]
  },

  { path: '/admin/login', name: 'admin-login', component: LoginPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from) => {
  const auth = useAuthStore()

  if (to.meta.loginPopup && !auth.isLoggedIn) {
    useUiStore().promptLogin(to.fullPath)
    return from.matched.length ? false : { name: 'home' }
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath, reason: 'login-required' } }
  }

  if (!to.meta.requiresAdmin) return true

  if (!auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath, reason: 'login-required' } }
  }

  if (!auth.canEdit) {
    return { name: 'home' }
  }

  if (to.meta.adminOnly && !auth.roleNames.includes('admin')) {
    return { name: 'admin-dashboard' }
  }

  return true
})

export default router