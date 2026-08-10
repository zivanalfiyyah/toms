import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CategoryPage from '../views/CategoryPage.vue'
import DocPage from '../views/DocPage.vue'
import LoginPage from '../views/LoginPage.vue'
import EditPage from '../views/EditPage.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/login', name: 'login', component: LoginPage },
  { path: '/docs/:category', name: 'category-page', component: CategoryPage, props: true },

  {
    path: '/docs/:category/:slugs+/edit',
    name: 'edit-page',
    component: EditPage,
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router