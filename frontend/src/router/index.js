import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CategoryPage from '../views/CategoryPage.vue'
import DocPage from '../views/DocPage.vue'
import LoginPage from '../views/LoginPage.vue'
import EditPage from '../views/EditPage.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/docs/:category', name: 'category-page', component: CategoryPage, props: true },
  { path: '/docs/:category/:slug', name: 'doc-page', component: DocPage, props: true },
  { path: '/docs/:category/:slug/edit', name: 'edit-page', component: EditPage, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router