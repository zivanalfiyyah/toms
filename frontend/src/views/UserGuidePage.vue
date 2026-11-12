<script setup>
import { ref } from 'vue'
import { guide } from '../data/guide'

// Setiap kartu dibuka/ditutup sendiri-sendiri, jadi beberapa kartu bisa terbuka bersamaan.
const opened = ref(new Set())
const isOpen = (i) => opened.value.has(i)
const toggle = (i) => {
  const next = new Set(opened.value)
  next.has(i) ? next.delete(i) : next.add(i)
  opened.value = next
}
// Dua kolom yang tersusun mandiri: kartu panjang (02) berpasangan dengan kartu pendek agar tinggi kolom seimbang.
const columns = [[0, 1], [2, 3]]
const tones = ['blue', 'gold', 'gold', 'blue']
const meta = [
  { title: '01. Tujuan', sub: 'Fungsi dan tujuan penggunaan sistem TOMS.', paths: ['M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z'] },
  { title: '02. Penggunaan', sub: 'Cara mengakses dan menggunakan fitur-fitur utama TOMS.', paths: ['M2 5c3-1.5 6-1.5 10 1v14c-4-2.5-7-2.5-10-1z', 'M22 5c-3-1.5-6-1.5-10 1v14c4-2.5 7-2.5 10-1z'] },
  { title: '03. Ketentuan', sub: 'Aturan dan ketentuan dalam penggunaan sistem.', paths: ['M12 2 4 5v6c0 5 3.4 9.2 8 11 4.6-1.8 8-6 8-11V5z', 'm9 12 2 2 4-4'] },
  { title: '04. Prinsip Utama', sub: 'Standar operasional dan prinsip utama TOMS.', paths: ['M12 21a9 9 0 1 1 9-9', 'M12 16a4 4 0 1 1 4-4', 'M12 12l9-9M17 3h4v4'] },
]
</script>

<template>
  <div class="dz">
    <section class="page-hero">
      <div class="shell">
        <div>
          <span class="eyebrow light">PANDUAN</span>
          <h1>{{ guide.title }}</h1>
          <p>{{ guide.subtitle }}</p>
        </div>
      </div>
    </section>
    <section class="section shell guide-cards">
      <div class="gc-grid">
        <div v-for="(col, c) in columns" :key="c" class="gc-col">
          <article v-for="i in col" :key="guide.sections[i].title" class="gc" :class="[`tone-${tones[i]}`, { open: isOpen(i), dense: !!guide.sections[i].terms }]">
            <button type="button" class="gc-head" :aria-expanded="isOpen(i)" :aria-controls="`gc-${i}`" @click="toggle(i)">
              <span class="gc-ico"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path v-for="d in meta[i].paths" :key="d" :d="d"></path></svg></span>
              <span class="gc-title"><b>{{ meta[i].title }}</b><small>{{ meta[i].sub }}</small></span>
              <span class="gc-go" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"></path></svg></span>
            </button>
            <div :id="`gc-${i}`" class="gc-panel"><div class="gc-inner">
              <p v-for="p in guide.sections[i].paragraphs" :key="p">{{ p }}</p>
              <dl v-if="guide.sections[i].terms"><div v-for="t in guide.sections[i].terms" :key="t[0]"><dt>{{ t[0] }}</dt><dd>{{ t[1] }}</dd></div></dl>
              <ul v-if="guide.sections[i].bullets"><li v-for="b in guide.sections[i].bullets" :key="b">{{ b }}</li></ul>
            </div></div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.dz .guide-wrap { display: grid; gap: 18px; }
.dz .guide-card { padding: 28px 32px; border: 1px solid var(--border); border-radius: 20px; background: var(--surface); box-shadow: var(--shadow); }
.dz .guide-card h2 { margin: 0 0 12px; font-size: 20px; letter-spacing: -0.02em; color: var(--ink); }
.dz .guide-card p { margin: 0 0 10px; color: var(--muted); line-height: 1.85; }
.dz .guide-card dl { display: grid; gap: 10px; margin: 0; }
.dz .guide-card dl div { padding: 12px 16px; border-radius: 12px; background: var(--soft); }
.dz .guide-card dt { font-size: 13px; font-weight: 800; color: var(--gold-ink); }
.dz .guide-card dd { margin: 3px 0 0; color: var(--text); line-height: 1.7; }
.dz .guide-card ul { margin: 0; padding-left: 20px; color: var(--text); line-height: 1.9; }
.dz .gc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
.dz .gc-col { display: grid; gap: 20px; align-content: start; min-width: 0; }
.dz .gc { position: relative; overflow: hidden; border-radius: 24px; border: 1px solid var(--border); box-shadow: var(--shadow); transition: box-shadow 0.25s, transform 0.25s, border-color 0.25s; background: var(--surface); }
.dz .gc.tone-blue { background: linear-gradient(135deg, var(--surface) 0%, rgba(29, 74, 154, 0.09) 100%); }
.dz .gc.tone-gold { background: linear-gradient(135deg, var(--surface) 0%, var(--gold-soft) 100%); }
.dz .gc::after { content: ""; position: absolute; right: -60px; top: -60px; width: 200px; height: 200px; border-radius: 50%; background: rgba(29, 74, 154, 0.07); pointer-events: none; }
.dz .gc.tone-gold::after { background: rgba(200, 152, 64, 0.16); }
.dz .gc:hover { transform: translateY(-2px); }
.dz .gc.open { box-shadow: 0 18px 50px rgba(15, 30, 70, 0.14); }
.dz .gc.tone-blue.open { border-color: rgba(29, 74, 154, 0.35); }
.dz .gc.tone-gold.open { border-color: rgba(200, 152, 64, 0.55); }
.dz .gc-head { position: relative; z-index: 1; width: 100%; display: flex; align-items: center; gap: 18px; padding: 24px 26px; border: 0; background: none; font: inherit; text-align: left; cursor: pointer; color: var(--ink); }
.dz .gc-ico { flex: 0 0 auto; width: 64px; height: 64px; border-radius: 18px; display: grid; place-items: center; background: rgba(29, 74, 154, 0.12); color: var(--sky); }
.dz .gc.tone-gold .gc-ico { background: rgba(200, 152, 64, 0.22); color: var(--gold-ink); }
.dz .gc-title { flex: 1; display: grid; gap: 5px; min-width: 0; }
.dz .gc-title b { font-size: clamp(18px, 1.8vw, 23px); }
.dz .gc-title small { font-size: 14px; line-height: 1.5; color: var(--muted); }
.dz .gc-go { flex: 0 0 auto; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: var(--surface); color: var(--ink); box-shadow: 0 4px 14px rgba(15, 30, 70, 0.12); transition: transform 0.3s, background 0.3s, color 0.3s; }
.dz .gc.open .gc-go { transform: rotate(90deg); background: var(--gold); color: #04122e; }
.dz .gc-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.35s ease; position: relative; z-index: 1; }
.dz .gc.open .gc-panel { grid-template-rows: 1fr; }
.dz .gc-inner { overflow: hidden; min-height: 0; padding: 0 26px; }
.dz .gc.open .gc-inner { padding-bottom: 24px; padding-top: 2px; }
.dz .gc-inner p { margin: 0 0 12px; line-height: 1.8; color: var(--text); font-size: 15px; }
.dz .gc-inner p:last-child { margin-bottom: 0; }
.dz .gc-inner dl { display: grid; grid-template-columns: 1fr; gap: 10px; margin: 0; }
.dz .gc.dense .gc-inner dl { grid-template-columns: 1fr 1fr; gap: 8px; }
.dz .gc-inner dl > div { padding: 12px 15px; border-radius: 14px; background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--gold); }
.dz .gc.dense .gc-inner dl > div { padding: 9px 12px; }
.dz .gc-inner dt { color: var(--sky); font-weight: 800; font-size: 13px; margin-bottom: 3px; }
.dz .gc.tone-gold .gc-inner dt { color: var(--gold-ink); }
.dz .gc-inner dd { margin: 0; line-height: 1.55; color: var(--text); font-size: 13px; }
.dz .gc-inner ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; }
.dz .gc-inner li { position: relative; padding-left: 22px; line-height: 1.7; color: var(--text); font-size: 14.5px; }
.dz .gc-inner li::before { content: ""; position: absolute; left: 0; top: 0.65em; width: 8px; height: 8px; border-radius: 50%; background: var(--gold); }
@media (width <= 860px) { .dz .gc-grid { grid-template-columns: 1fr; } .dz .gc.dense .gc-inner dl { grid-template-columns: 1fr; } .dz .gc-head { padding: 18px; gap: 14px; } .dz .gc-ico { width: 52px; height: 52px; } }
</style>
