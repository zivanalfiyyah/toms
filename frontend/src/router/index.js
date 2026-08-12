import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CategoryPage from '../views/CategoryPage.vue'
import DocPage from '../views/DocPage.vue'
import LoginPage from '../views/LoginPage.vue'
import EditPage from '../views/EditPage.vue'
import CategoryEditPage from '../views/CategoryEditPage.vue'
import PageIndexPage from '../views/PageIndexPage.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'
import AdminDashboard from '../views/admin/DashboardPage.vue'
import AdminUsers from '../views/admin/UsersPage.vue'
import AdminCategories from '../views/admin/CategoriesPage.vue'
import AdminImport from '../views/admin/ImportPage.vue'
import AdminAccessRequests from '../views/admin/AccessRequestsPage.vue'
import RequestAccessPage from '../views/RequestAccessPage.vue'
import AcceptInvitePage from '../views/AcceptInvitePage.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/login', name: 'login', component: LoginPage },
  { path: '/request-access', name: 'request-access', component: RequestAccessPage },
  { path: '/accept-invite/:token', name: 'accept-invite', component: AcceptInvitePage, props: true },
  { path: '/docs/:category', name: 'category-page', component: CategoryPage, props: true },


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
      { path: 'users', name: 'admin-users', component: AdminUsers, meta: { requiresAdmin: true, adminOnly: true } },
      { path: 'categories', name: 'admin-categories', component: AdminCategories },
      { path: 'import', name: 'admin-import', component: AdminImport },
      { path: 'access-requests', name: 'admin-access-requests', component: AdminAccessRequests, meta: { requiresAdmin: true, adminOnly: true } },
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

router.beforeEach((to) => {
  if (!to.meta.requiresAdmin) return true

  const auth = useAuthStore()

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