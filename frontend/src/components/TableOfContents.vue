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

function updateActive() {
  const ids = getAllIds()
  let current = null

  for (const id of ids) {
    const el = document.getElementById(id)
    if (!el) continue
    const top = el.getBoundingClientRect().top
    if (top <= 120) {
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

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(updateActive)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
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
  width: 210px;
  flex-shrink: 0;
  padding: 1.5rem 0.5rem;
  position: sticky;
  top: 4.5rem;
  align-self: flex-start;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  /* Batasi tinggi TOC ke sisa ruang viewport (dikurangi offset sticky-nya
     dan sedikit padding bawah) supaya kalau heading-nya sangat banyak,
     TOC tidak mendorong/melewati batas layar — cukup list-nya sendiri
     yang scroll (lihat .toc-tree di bawah), judul tetap diam di atas. */
  max-height: calc(100vh - 4.5rem - 1.5rem);
  display: flex;
  flex-direction: column;
}

/* 1. Judul + Garis Pembatas Atas */
.toc-title {
  font-size: 0.725rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #374151;
  margin: 0 0 0.85rem 0;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb; /* Garis horizontal atas */
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
  border-left: 1px solid #e5e7eb; /* Garis vertikal abu-abu lurus */
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0; /* Perlu supaya flex child ini benar-benar mau menyusut & scroll, bukan memaksa .toc melebihi max-height-nya */

  /* Scrollbar tipis & halus (Firefox) */
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

/* Scrollbar tipis & halus (Chrome/Edge/Safari) */
.toc-tree::-webkit-scrollbar {
  width: 5px;
}
.toc-tree::-webkit-scrollbar-track {
  background: transparent;
}
.toc-tree::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}
.toc-tree::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}

.toc-tree li {
  margin: 0 !important;
  padding: 0 !important;
  list-style-type: none !important;
}

/* 3. Link Menu Utama */
.toc-tree a {
  display: block;
  padding: 0.3rem 0 0.3rem 0.85rem;
  font-size: 0.725rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #6b7280;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.15s ease;
  background: transparent;
}

.toc-tree a:hover {
  color: #0d9488;
}

.toc-tree a.active {
  color: #0d9488;
  font-weight: 700;
}

/* 4. Sub Menu / Anak Menu (H2 di bawah H1) */
.toc-tree .sub a {
  padding-left: 1.15rem; /* Menjorok ke dalam (dikurangi dari 1.6rem → 1.35rem → 1.15rem) */
  font-size: 0.68rem;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
}

.toc-tree .sub a.active {
  color: #0d9488;
  font-weight: 600;
}

/* 5. Sub-sub Menu (H3 di bawah H2) — menjorok sedikit lebih dalam lagi,
   TAPI tidak sedrastis sebelumnya (2.35rem) supaya sisa ruang teks di
   sidebar yang sempit tidak terlalu terpotong */
.toc-tree .sub-sub a {
  padding-left: 1.5rem; /* dikurangi dari 2.35rem → 1.8rem → 1.5rem */
  font-size: 0.64rem;
  font-weight: 400;
  color: #b0b6c0;
}

.toc-tree .sub-sub a.active {
  color: #0d9488;
  font-weight: 600;
}

@media (max-width: 1100px) {
  .toc { display: none; }
}
</style>