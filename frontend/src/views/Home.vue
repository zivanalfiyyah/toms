<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocsStore } from '../stores/docs'
import { icons } from '../icons'

const docsStore = useDocsStore()
const router = useRouter()

onMounted(() => {
  if (!docsStore.categories.length) docsStore.fetchCategories()
})

function goToFirstPage() {
  const first = docsStore.categories[0]
  if (first) router.push(`/docs/${first.slug}`)
}
</script>


<style scoped>
.hero {
  text-align: center;
  padding: 3.5rem 1rem 2.5rem;
  max-width: 620px;
  margin: 0 auto;
}
.hero h1 { font-size: 2.6rem; margin: 0 0 0.75rem; }
.subtitle { color: var(--color-ink-soft); font-size: 1.05rem; margin: 0 0 1.75rem; }
.cta {
  background: var(--color-accent);
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: var(--radius);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}
.cta:hover { opacity: 0.9; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.4rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}
.card:hover { border-color: var(--color-accent); text-decoration: none; }
.card-icon {
  width: 30px; height: 30px;
  color: var(--color-accent);
  background: var(--color-accent-soft);
  border-radius: 8px;
  padding: 6px;
}
.card-icon :deep(svg) { width: 100%; height: 100%; }
.card-title { font-family: var(--font-display); font-weight: 600; color: var(--color-ink); }
.card-desc { font-size: 0.85rem; color: var(--color-ink-soft); }
</style>

<template>
  <div class="home">
    <section class="hero">
      <h1>Panduan TOMS</h1>
      <p class="subtitle">
        Semua yang perlu kamu tahu untuk menjalankan, mengelola, dan memelihara sistem TOMS —
        disusun dalam satu tempat yang mudah ditelusuri.
      </p>
      <button class="cta" @click="goToFirstPage">Mulai Membaca</button>
    </section>

    <div class="grid">
      <router-link
        v-for="cat in docsStore.categories"
        :key="cat.id"
        :to="`/docs/${cat.slug}`"
        class="card"
      >
        <span v-html="icons[cat.icon]" class="card-icon"></span>
        <span class="card-title">{{ cat.title }}</span>
        <span class="card-desc">{{ cat.description }}</span>
      </router-link>
    </div>
  </div>
</template>
