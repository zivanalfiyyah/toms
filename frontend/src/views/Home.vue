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

function formatIndex(i) {
  return String(i + 1).padStart(2, '0')
}
</script>

<style scoped>
/* Hero selebar layar (full-bleed) di bawah navbar */
.hero {
  margin: -1.5rem calc(50% - 50vw) 0;
  min-height: 440px;
  display: flex; align-items: center; justify-content: center;
  text-align: center;
  padding: 60px 25px 35px;
  background:
    radial-gradient(circle at 15% 38%, rgba(62, 181, 244, 0.14), transparent 28%),
    radial-gradient(circle at 85% 25%, rgba(62, 181, 244, 0.10), transparent 30%),
    linear-gradient(180deg, #e7f6fd 0%, #f4faff 70%, #f8fbfd 100%);
  border-bottom: 1px solid #e2edf4;
}
.hero-inner { max-width: 850px; }
.pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 15px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.7); border: 1px solid #9bd5f5;
  color: var(--color-accent); font-size: 11px; font-weight: 800;
}
.pill .dot { width: 7px; height: 7px; border-radius: 50%; background: #51b8ed; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
.hero h1 {
  font-size: clamp(2.5rem, 5vw, 3.5rem); font-weight: 800; letter-spacing: -0.055em;
  line-height: 1; margin: 25px 0 12px; color: var(--color-ink);
}
.gradient { color: var(--color-accent-strong); }
.subtitle { color: #70849a; font-size: 15px; line-height: 1.75; max-width: 670px; margin: 0 auto; }

.cta-group { display: flex; justify-content: center; gap: 11px; flex-wrap: wrap; margin-top: 29px; }
.cta {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  height: 48px; padding: 0 23px; border-radius: 12px;
  background: linear-gradient(135deg, #078bdc, #0879c2); color: #fff;
  border: 1px solid #087fc7;
  font-size: 13px; font-weight: 800; cursor: pointer;
  box-shadow: var(--btn-glow);
  transition: transform 0.15s ease, background 0.15s ease;
}
.cta:hover { transform: translateY(-1px); text-decoration: none; }
.cta svg { width: 16px; height: 16px; }
.cta-secondary {
  background: var(--color-surface); color: #263a53;
  border: 1px solid #d8e4ed; box-shadow: none;
}
.cta-secondary:hover { background: #f8fbfd; color: #263a53; }

/* Daftar bab */
.topics { max-width: 1110px; margin: 0 auto; padding: 48px 20px 30px; }
.topic-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; margin-bottom: 25px; }
.kicker { margin: 0 0 5px; color: var(--color-accent-strong); font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
.topic-heading h2 { margin: 0; color: var(--color-ink); font-size: 29px; letter-spacing: -1px; }
.topic-heading p { margin: 7px 0 0; color: var(--color-ink-soft); font-size: 13px; }
.outline-btn {
  border: 1px solid #d5e2eb; background: var(--color-surface); color: #177fbe;
  padding: 10px 15px; border-radius: 10px; font-size: 11px; font-weight: 800; white-space: nowrap;
}
.outline-btn:hover { background: var(--color-bg); text-decoration: none; }

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 0 auto;
  max-width: 1110px;
  padding: 0 20px;
}
.card {
  display: flex; flex-direction: column; align-items: stretch;
  min-height: 190px; padding: 21px; border-radius: 14px;
  background: var(--color-surface); border: 1px solid var(--color-border);
  box-shadow: 0 6px 18px rgba(30, 73, 106, 0.045);
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover { text-decoration: none; border-color: #a8d8f3; transform: translateY(-2px); box-shadow: 0 13px 28px rgba(30, 73, 106, 0.09); }
.card-top { display: flex; justify-content: space-between; align-items: center; }
.card-eyebrow {
  font-family: var(--font-body); font-size: 9px; font-weight: 900; letter-spacing: 1px;
  padding: 5px 10px; border-radius: 7px;
  color: #0582ce; background: #ebf7ff; border: 1px solid #bfe2f7;
}
.card-icon {
  width: 34px; height: 34px; display: grid; place-items: center;
  border-radius: 10px; background: #edf7ff; color: #087fc8;
}
.card-icon :deep(svg) { width: 17px; height: 17px; }
.card-title { margin: 19px 0 7px; font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--color-ink); }
.card-desc { font-size: 12px; color: var(--color-ink-soft); line-height: 1.7; }
.card-footer {
  display: flex; justify-content: flex-end; align-items: center;
  margin-top: auto; padding-top: 13px; border-top: 1px solid #edf1f5;
  font-size: 10px;
}
.card-desc + .card-footer, .card-title + .card-footer { margin-top: 18px; }
.open-link { color: #087fc8; font-weight: 900; }

/* Mode gelap */
[data-theme='dark'] .hero {
  background:
    radial-gradient(circle at 20% 35%, rgba(0, 126, 210, 0.18), transparent 28%),
    linear-gradient(180deg, #12283b, #0e1926);
  border-bottom-color: #2a4054;
}
[data-theme='dark'] .pill { background: rgba(20, 37, 54, 0.7); border-color: #28536d; }
[data-theme='dark'] .subtitle { color: #94a9bd; }
[data-theme='dark'] .cta-secondary { background: #142536; border-color: #2b4054; color: #e9f3fd; }
[data-theme='dark'] .cta-secondary:hover { background: #1a3044; color: #e9f3fd; }
[data-theme='dark'] .outline-btn { background: #142536; border-color: #2b4054; color: #55b5eb; }
[data-theme='dark'] .outline-btn:hover { background: #1a3044; }
[data-theme='dark'] .card { box-shadow: none; }
[data-theme='dark'] .card:hover { border-color: #3a6783; box-shadow: 0 13px 28px rgba(0, 0, 0, 0.3); }
[data-theme='dark'] .card-eyebrow { color: #55b5eb; background: #17374f; border-color: #28536d; }
[data-theme='dark'] .card-icon { background: #17374f; color: #55b5eb; }
[data-theme='dark'] .card-footer { border-top-color: #2a4054; }
[data-theme='dark'] .open-link { color: #55b5eb; }

@media (max-width: 860px) {
  .grid { grid-template-columns: 1fr; padding: 0 4px; }
  .topics { padding: 36px 4px 24px; }
  .topic-heading { display: block; }
  .outline-btn { display: inline-block; margin-top: 13px; }
}

.fetch-error {
  max-width: 620px;
  margin: 1.5rem auto;
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
      <div class="hero-inner">
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
      </div>
    </section>

    <div class="topics">
      <div class="topic-heading">
        <div>
          <p class="kicker">Daftar Bab</p>
          <h2>Topik Dokumentasi</h2>
          <p>Pilih bab yang ingin kamu pelajari. Setiap bab berisi panduan lengkap.</p>
        </div>
        <router-link to="/daftar-isi" class="outline-btn">Lihat Semua Bab &rarr;</router-link>
      </div>
    </div>

    <div v-if="docsStore.error" class="fetch-error">{{ docsStore.error }}</div>

    <div class="grid">
      <router-link
        v-for="(cat, i) in docsStore.categories"
        :key="cat.id"
        :to="`/docs/${cat.slug}`"
        class="card"
        :class="`tone-${i % 3}`"
      >
        <div class="card-top">
          <span class="card-eyebrow">BAB {{ formatIndex(i) }}</span>
          <span v-if="icons[cat.icon]" class="card-icon" v-html="icons[cat.icon]"></span>
        </div>
        <span class="card-title">{{ cat.name }}</span>
        <span v-if="cat.description" class="card-desc">{{ cat.description }}</span>
        <div class="card-footer"><span class="open-link">Buka Bab &rarr;</span></div>
      </router-link>
    </div>
  </div>
</template>