<template>
  <aside v-if="props.headings.length" class="toc">
    <p class="toc-title">Pada halaman ini</p>
    <ul class="toc-tree" ref="tocTreeEl">
      <li v-for="h in props.headings" :key="h.id">
        <a :href="`#${h.id}`" :title="h.text" :class="{ active: activeId === h.id }" @click="scrollToHeading(h.id, $event)">{{ h.text }}</a>
        <ul v-if="h.children.length" class="sub">
          <li v-for="c in h.children" :key="c.id">
            <a :href="`#${c.id}`" :title="c.text" :class="{ active: activeId === c.id }" @click="scrollToHeading(c.id, $event)">{{ c.text }}</a>
            <ul v-if="c.children.length" class="sub-sub">
              <li v-for="g in c.children" :key="g.id">
                <a :href="`#${g.id}`" :title="g.text" :class="{ active: activeId === g.id }" @click="scrollToHeading(g.id, $event)">{{ g.text }}</a>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { flattenHeadingIds } from '../utils/headings'

// `headings` datang dari event @headings milik TiptapRenderer, yang
// membangun id-nya dari HTML yang SAMA dengan yang benar-benar dirender
// (lihat src/utils/headings.js). Ini menggantikan pendekatan lama yang
// membaca field JSON `content` terpisah — field itu bisa kosong/basi
// untuk halaman lama, dan hanya membaca heading level teratas.
//
// Tree-nya sendiri (dari extractHeadings) sudah mendukung kedalaman
// berapa pun (H1>H2>H3>H4...), tapi di sini kita sengaja render sampai
// 3 tingkat saja (H1/H2/H3) sesuai kebutuhan tampilan sidebar — heading
// yang lebih dalam dari itu tetap ada di data, cuma tidak digambar lagi
// levelnya (jarang dipakai & bikin sidebar terlalu padat).
const props = defineProps({ headings: { type: Array, default: () => [] } })

const activeId = ref(null)
const tocTreeEl = ref(null)
let ticking = false

function getAllIds() {
  return flattenHeadingIds(props.headings)
}

// Menggeser scroll INTERNAL panel .toc-tree (bukan scroll halaman utama)
// supaya link heading yang sedang aktif selalu kelihatan, mengikuti posisi
// baca user di konten. Dihitung manual pakai getBoundingClientRect (bukan
// activeLink.scrollIntoView) supaya dipastikan cuma container TOC ini yang
// ikut bergeser — tidak ada risiko ikut menggeser scroll halaman utama.
function scrollActiveLinkIntoView() {
  const container = tocTreeEl.value
  if (!container || !activeId.value) return

  const activeLink = container.querySelector('a.active')
  if (!activeLink) return

  const containerRect = container.getBoundingClientRect()
  const linkRect = activeLink.getBoundingClientRect()

  const isAbove = linkRect.top < containerRect.top
  const isBelow = linkRect.bottom > containerRect.bottom
  if (!isAbove && !isBelow) return // sudah terlihat, tidak perlu digeser

  // Posisikan link aktif di tengah-tengah tinggi panel TOC, biar enak
  // dibaca dan ada konteks (link sebelum & sesudahnya tetap kelihatan)
  const delta = (linkRect.top + linkRect.height / 2) - (containerRect.top + containerRect.height / 2)
  container.scrollBy({ top: delta, behavior: 'smooth' })
}

// Navigasi manual lewat JS, TIDAK mengandalkan lompatan native browser
// murni — supaya konsisten berhasil walau elemen tujuannya baru saja
// selesai dirender (v-html) oleh TiptapRenderer. href tetap dipasang di
// <a> (supaya klik-kanan copy link / buka tab baru tetap berfungsi
// normal), tapi klik biasa kita tangani sendiri.
function scrollToHeading(id, event) {
  event.preventDefault()
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.pushState(null, '', `#${id}`)
  activeId.value = id
}

// Kalau halaman dibuka/di-refresh langsung dengan #hash sudah ada di URL
// (mis. dari hasil klik TOC sebelumnya, atau link yang dibagikan orang
// lain), browser mencoba lompat ke situ SEBELUM konten (v-html) selesai
// dirender — elemen targetnya belum ada, jadi lompatan browser gagal
// diam-diam. Di sini kita coba lagi begitu heading benar-benar siap.
function scrollToInitialHashIfAny() {
  if (!window.location.hash) return
  const id = decodeURIComponent(window.location.hash.slice(1))
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ block: 'start' })
    activeId.value = id
  }
}

// Desktop: isi dokumen bergulir di dalam kartunya sendiri (.doc-content / .category-content).
// Mobile: halaman utama yang bergulir, jadi tidak ada scroller khusus (null).
function getScroller() {
  const el = document.querySelector('.doc-content, .category-content')
  if (!el) return null
  const overflowY = getComputedStyle(el).overflowY
  return overflowY === 'auto' || overflowY === 'scroll' ? el : null
}

function updateActive() {
  const ids = getAllIds()
  let current = null
  // Ambang dihitung dari tepi atas kartu (desktop) atau layar (mobile).
  const scroller = getScroller()
  const threshold = scroller ? scroller.getBoundingClientRect().top + 48 : 120

  for (const id of ids) {
    const el = document.getElementById(id)
    if (!el) continue
    const top = el.getBoundingClientRect().top
    if (top <= threshold) {
      current = id
    } else {
      break
    }
  }

  const changed = current !== activeId.value
  activeId.value = current
  ticking = false

  if (changed) {
    nextTick(scrollActiveLinkIntoView)
  }
}

function onScroll(event) {
  // Event scroll dari elemen lain (sidebar, daftar TOC) tidak relevan.
  if (event && event.target !== document && event.target !== getScroller()) return
  if (ticking) return
  ticking = true
  requestAnimationFrame(updateActive)
}

onMounted(() => {
  // capture: scroll pada elemen tidak bubble ke window, jadi harus ditangkap di fase capture.
  window.addEventListener('scroll', onScroll, { passive: true, capture: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll, { capture: true })
})

watch(
  () => props.headings,
  async () => {
    activeId.value = null
    await nextTick()
    setTimeout(() => {
      updateActive()
      scrollToInitialHashIfAny()
    }, 50)
  },
  { immediate: true }
)
</script>

<style scoped>
.toc {
  width: 225px;
  flex-shrink: 0;
  padding: 16px 15px;
  position: sticky;
  top: calc(var(--header-h) + 1.5rem);
  align-self: flex-start;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 17px;
  box-shadow: var(--shadow-b);
  font-family: var(--font-body);
  /* Batasi tinggi TOC ke sisa ruang viewport (dikurangi offset sticky-nya
     dan sedikit padding bawah) supaya kalau heading-nya sangat banyak,
     TOC tidak mendorong/melewati batas layar — cukup list-nya sendiri
     yang scroll (lihat .toc-tree di bawah), judul tetap diam di atas. */
  max-height: calc(100vh - var(--header-h) - 3rem);
  display: flex;
  flex-direction: column;
}

/* 1. Judul + Garis Pembatas Atas */
.toc-title {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.15px;
  color: var(--color-ink);
  margin: 0 0 0.5rem 0;
  padding: 3px 0 14px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0; /* Judul tidak boleh ikut mengecil/kepotong saat list di bawahnya scroll */
}

/* 2. Daftar Menu + Garis Vertikal Lurus Sebelah Kiri */
.toc-tree, 
.toc-tree .sub,
.toc-tree .sub-sub {
  list-style: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

.toc-tree {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0; /* Perlu supaya flex child ini benar-benar mau menyusut & scroll, bukan memaksa .toc melebihi max-height-nya */

  /* Scrollbar tipis & halus (Firefox) */
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

/* Scrollbar tipis & halus (Chrome/Edge/Safari) */
.toc-tree::-webkit-scrollbar {
  width: 5px;
}
.toc-tree::-webkit-scrollbar-track {
  background: transparent;
}
.toc-tree::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 3px;
}
.toc-tree::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-ink-soft);
}

.toc-tree li {
  margin: 0 !important;
  padding: 0 !important;
  list-style-type: none !important;
}

/* 3. Link Menu Utama */
.toc-tree a {
  --indent: 0px;
  position: relative;
  display: block;
  padding: 8px 0 8px calc(18px + var(--indent));
  font-size: 11px;
  font-weight: 500;
  color: var(--color-ink-soft);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.15s ease;
  background: transparent;
}

/* Titik penanda di kiri tiap judul; terisi saat judul sedang aktif */
.toc-tree a::before {
  content: '';
  position: absolute;
  left: var(--indent);
  top: 50%;
  width: 10px;
  height: 10px;
  transform: translateY(-50%);
  border: 2px solid #cfdbe5;
  border-radius: 50%;
}
[data-theme='dark'] .toc-tree a::before { border-color: #3a566d; }

.toc-tree a:hover {
  color: var(--color-accent);
}

.toc-tree a.active {
  color: var(--color-accent);
  font-weight: 800;
}
.toc-tree a.active::before {
  border-color: var(--color-accent);
  background: var(--color-accent);
  box-shadow: inset 0 0 0 2px var(--color-surface);
}

/* 4. Sub Menu / Anak Menu (H2 di bawah H1) */
.toc-tree .sub a {
  --indent: 12px; /* menjorok ke dalam */
  font-size: 11px;
  font-weight: 500;
  color: var(--color-ink-soft);
}

.toc-tree .sub a.active {
  color: var(--color-accent);
  font-weight: 700;
}

/* 5. Sub-sub Menu (H3 di bawah H2) — menjorok sedikit lebih dalam lagi,
   TAPI tidak sedrastis sebelumnya (2.35rem) supaya sisa ruang teks di
   sidebar yang sempit tidak terlalu terpotong */
.toc-tree .sub-sub a {
  --indent: 24px;
  font-size: 10.5px;
  font-weight: 400;
  color: var(--color-ink-soft);
}

.toc-tree .sub-sub a.active {
  color: var(--color-accent);
  font-weight: 600;
}

@media (max-width: 1100px) {
  .toc { display: none; }
}
</style>