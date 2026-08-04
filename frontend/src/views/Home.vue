<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocsStore } from '../stores/docs'

const docsStore = useDocsStore()
const router = useRouter()

onMounted(() => {
  if (!docsStore.categories.length) docsStore.fetchCategories()
})

function goToFirstPage() {
  const first = docsStore.categories[0]
  if (first) router.push(`/docs/${first.slug}`)
}

function formatIndex(i) {
  return String(i + 1).padStart(2, '0')
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
  grid-template-columns: repeat(3, 1fr);
  gap: 2.75rem 2rem;
  margin-top: 3rem;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  text-align: center;
  padding: 1.5rem 1rem;
  border-radius: var(--radius);
  transition: background 0.2s ease, transform 0.2s ease;
}
.card:hover {
  text-decoration: none;
  background: var(--color-accent-soft);
  transform: translateY(-2px);
}
.card-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  color: var(--color-accent);
  opacity: 0.7;
}
.card-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-ink);
  position: relative;
  padding-bottom: 0.5rem;
}
.card-title::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 28px;
  height: 2px;
  background: var(--color-accent);
  transform: translateX(-50%) scaleX(0);
  transition: transform 0.2s ease;
}
.card:hover .card-title::after { transform: translateX(-50%) scaleX(1); }
.card-desc {
  font-size: 0.88rem;
  color: var(--color-ink-soft);
  line-height: 1.6;
}

@media (max-width: 860px) {
  .grid { grid-template-columns: 1fr; }
}

.fetch-error {
  max-width: 620px;
  margin: 0 auto 1.5rem;
  padding: 1rem 1.2rem;
  border: 1px solid #d33;
  border-radius: var(--radius);
  color: #d33;
  background: rgba(211, 51, 51, 0.06);
}
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

    <div v-if="docsStore.error" class="fetch-error">{{ docsStore.error }}</div>

    <div class="grid">
      <router-link
        v-for="(cat, i) in docsStore.categories"
        :key="cat.id"
        :to="`/docs/${cat.slug}`"
        class="card"
      >
        <span class="card-eyebrow">BAB {{ formatIndex(i) }}</span>
        <span class="card-title">{{ cat.name }}</span>
        <span v-if="cat.description" class="card-desc">{{ cat.description }}</span>
      </router-link>
    </div>
  </div>
</template>