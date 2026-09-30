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
  padding: 3.5rem 1rem 2rem;
  max-width: 760px;
  margin: 0 auto;
}
.pill {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.4rem 0.9rem; border-radius: 999px; margin-bottom: 1.5rem;
  background: var(--color-accent-soft); border: 1px solid var(--color-accent-border);
  color: var(--color-accent); font-size: 0.75rem; font-weight: 600;
}
.pill .dot { width: 8px; height: 8px; border-radius: 50%; background: #0ea5e9; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
.hero h1 {
  font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 800; letter-spacing: -0.035em;
  line-height: 1.15; margin: 0 0 1rem;
}
.gradient {
  background: linear-gradient(90deg, #0284c7, #0ea5e9, #06b6d4);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
[data-theme='dark'] .gradient { background-image: linear-gradient(90deg, #38bdf8, #7dd3fc, #67e8f9); }
.subtitle { color: var(--color-ink-soft); font-size: 0.95rem; max-width: 560px; margin: 0 auto 2rem; }

.cta-group { display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap; }
.cta {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: #0284c7; color: #fff; border: none;
  padding: 0.8rem 1.5rem; border-radius: var(--radius);
  font-size: 0.8rem; font-weight: 700; cursor: pointer;
  box-shadow: 0 8px 20px -6px rgba(2, 132, 199, 0.45);
  transition: background 0.15s ease, transform 0.15s ease;
}
.cta:hover { background: #0369a1; text-decoration: none; transform: translateY(-1px); }
.cta svg { width: 16px; height: 16px; }
.cta-secondary {
  background: var(--glass-bg); color: var(--color-ink);
  border: 1px solid var(--glass-border); box-shadow: none;
}
.cta-secondary:hover { background: var(--color-accent-soft); color: var(--color-accent); }

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 2.5rem auto 0;
  max-width: 1152px;
}
.card {
  display: flex; flex-direction: column; align-items: flex-start; gap: 0.35rem;
  padding: 1.5rem; border-radius: var(--radius-lg);
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--shadow-card);
  transition: border-color 0.2s ease, transform 0.2s ease;
}
.card:hover { text-decoration: none; border-color: var(--color-accent); transform: translateY(-4px); }
.card { box-shadow: var(--shadow-a); }
.tone-1 { box-shadow: var(--shadow-b); }
.tone-2 { box-shadow: var(--shadow-c); }
.tone-1:hover { border-color: #a78bfa; }
.tone-2:hover { border-color: #34d399; }
[data-theme='dark'] .card-eyebrow { box-shadow: 0 0 14px -4px rgba(56, 189, 248, 0.6); }
[data-theme='dark'] .tone-1 .card-eyebrow { box-shadow: 0 0 14px -4px rgba(167, 139, 250, 0.6); }
[data-theme='dark'] .tone-2 .card-eyebrow { box-shadow: 0 0 14px -4px rgba(52, 211, 153, 0.6); }
[data-theme='dark'] .tone-1 .card-eyebrow { color: #c4b5fd; background: rgba(139, 92, 246, 0.14); border-color: rgba(167, 139, 250, 0.35); }
[data-theme='dark'] .tone-2 .card-eyebrow { color: #6ee7b7; background: rgba(16, 185, 129, 0.14); border-color: rgba(52, 211, 153, 0.35); }
[data-theme='dark'] .cta:not(.cta-secondary) {
  background: linear-gradient(90deg, #0284c7, #0ea5e9);
  box-shadow: 0 0 32px -4px rgba(56, 189, 248, 0.6);
}
[data-theme='dark'] .pill { box-shadow: 0 0 20px -6px rgba(56, 189, 248, 0.5); }
.card-eyebrow {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em;
  padding: 0.25rem 0.65rem; border-radius: 8px; margin-bottom: 0.65rem;
  color: #0284c7; background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.2);
}
.tone-1 .card-eyebrow { color: #0369a1; background: rgba(2, 132, 199, 0.1); border-color: rgba(2, 132, 199, 0.2); }
.tone-2 .card-eyebrow { color: #0891b2; background: rgba(6, 182, 212, 0.1); border-color: rgba(6, 182, 212, 0.2); }
[data-theme='dark'] .card-eyebrow { color: #38bdf8; }
[data-theme='dark'] .tone-1 .card-eyebrow { color: #7dd3fc; }
[data-theme='dark'] .tone-2 .card-eyebrow { color: #22d3ee; }
.card-title { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--color-ink); }
.card-desc { font-size: 0.78rem; color: var(--color-ink-soft); line-height: 1.6; }

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
      <div class="pill"><span class="dot"></span>Pusat Informasi &amp; Standard Operational Procedure</div>
      <h1>Panduan <span class="gradient">TOMS</span></h1>
      <p class="subtitle">
        Semua yang perlu kamu tahu untuk menjalankan, mengelola, dan memelihara sistem TOMS —
        disusun dalam satu tempat yang mudah ditelusuri.
      </p>
      <div class="cta-group">
        <button class="cta" @click="goToFirstPage">
          Mulai Membaca
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
        <router-link to="/daftar-isi" class="cta cta-secondary">Daftar Isi</router-link>
      </div>
    </section>

    <div v-if="docsStore.error" class="fetch-error">{{ docsStore.error }}</div>

    <div class="grid">
      <router-link
        v-for="(cat, i) in docsStore.categories"
        :key="cat.id"
        :to="`/docs/${cat.slug}`"
        class="card"
        :class="`tone-${i % 3}`"
      >
        <span class="card-eyebrow">BAB {{ formatIndex(i) }}</span>
        <span class="card-title">{{ cat.name }}</span>
        <span v-if="cat.description" class="card-desc">{{ cat.description }}</span>
      </router-link>
    </div>
  </div>
</template>