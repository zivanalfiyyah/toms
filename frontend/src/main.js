import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import './assets/portal.css'
import './assets/portal-header.css'
import './assets/portal-docs.css'
import './assets/portal-account.css'
import './assets/portal-pages.css'
import './assets/portal-home.css'
import './assets/portal-toc.css'
import './assets/omnibox.css'
import './assets/latest-docs.css'
import './assets/admin-pages.css'
import './assets/admin-design.css'

createApp(App).use(createPinia()).use(router).mount('#app')

