<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import SearchModal from './components/SearchModal.vue'
import { useThemeStore } from './stores/theme'

const searchOpen = ref(false)
const sidebarOpen = ref(false)
const themeStore = useThemeStore()
const route = useRoute()

// Sidebar disembunyikan hanya di halaman Home ("/"), tampil di semua halaman dokumentasi lainnya.
const showSidebar = computed(() => route.name !== 'home')

onMounted(() => {
  themeStore.init()
  window.addEventListener('keydown', onGlobalKeydown)
})

function onGlobalKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    searchOpen.value = true
  }
}
</script>


<style scoped>
.app-body { display: flex; position: relative; }
.app-main { flex: 1; min-width: 0; padding: 2rem clamp(1.25rem, 4vw, 3rem); }
.app-main.no-sidebar { max-width: 960px; margin: 0 auto; }
</style>


<template>
  <div class="app-shell">
    <AppHeader 
      :show-sidebar="showSidebar" 
      @open-search="searchOpen = true" 
      @toggle-sidebar="sidebarOpen = !sidebarOpen" 
    />
    <div class="app-body">
      <AppSidebar
        v-if="showSidebar"
        :class="{ 'is-open': sidebarOpen }"
        @navigate="sidebarOpen = false"
      />
      <main class="app-main" :class="{ 'no-sidebar': !showSidebar }">
        <router-view />
      </main>
    </div>
    <SearchModal v-if="searchOpen" @close="searchOpen = false" />
  </div>
</template>
