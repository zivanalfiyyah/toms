<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { prinsipPenggunaan, faqTagline } from '../data/faq'
import { usePortalStore } from '../stores/portal'

const portal = usePortalStore()
portal.load()
const { faqTopics } = storeToRefs(portal)

const topic = ref(0)
const query = ref('')
const openKey = ref(null)
const searching = computed(() => query.value.trim().length > 0)
const text = (a) => (typeof a === 'string' ? a : a.map((r) => r.join(' ')).join(' '))

const items = computed(() => {
  if (!searching.value) return faqTopics.value[topic.value].items.map((x, i) => ({ ...x, key: `${topic.value}-${i}` }))
  const q = query.value.trim().toLowerCase()
  return faqTopics.value.flatMap((t, ti) =>
    t.items.map((x, i) => ({ ...x, key: `${ti}-${i}` })).filter((x) => (x.q + ' ' + text(x.a)).toLowerCase().includes(q))
  )
})
function pick(i) { topic.value = i; query.value = ''; openKey.value = null }
</script>

<template>
  <div class="dz">
<div class="shell"><nav class="faq-crumb" aria-label="Breadcrumb"><button @click="$router.push('/')">Beranda</button><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg><span>FAQ</span></nav><div class="faq-head"><h1>FAQ</h1><p>Pertanyaan yang sering diajukan seputar penggunaan TOMS, SOP, keselamatan, pelayanan, dan kinerja.</p><div class="faq-search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg><input v-model="query" placeholder="Cari pertanyaan..." aria-label="Cari pertanyaan" type="search"></div></div><div class="faq-grid"><aside class="faq-topics" aria-label="Topik FAQ"><small>TOPIK</small><button v-for="(t, i) in faqTopics" :key="t.title" class="faq-topic" :class="{ active: !searching && topic === i }" @click="pick(i)">{{ t.title }}</button></aside><section class="faq-list"><h2>{{ searching ? `Hasil pencarian (${items.length})` : faqTopics[topic].title }}</h2><template v-if="items.length"><div v-for="it in items" :key="it.key" class="faq-item" :class="{ open: openKey === it.key }"><button class="faq-q" :aria-expanded="openKey === it.key" @click="openKey = openKey === it.key ? null : it.key"><span>{{ it.q }}</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg></button><div v-if="openKey === it.key" class="faq-a"><p v-if="typeof it.a === 'string'">{{ it.a }}</p><ul v-else><li v-for="(r, k) in it.a" :key="k"><b>{{ r[0] }}: </b>{{ r[1] }}</li></ul></div></div></template><p v-else class="faq-none">Tidak ada pertanyaan yang cocok. Coba kata kunci lain atau hubungi kanal bantuan.</p></section></div><section class="faq-principles"><h2>Prinsip Penggunaan TOMS</h2><ol><li v-for="(p, i) in prinsipPenggunaan" :key="i"><i>{{ i + 1 }}</i>{{ p }}</li></ol><p class="faq-tagline">{{ faqTagline }}</p></section><section class="faq-cta"><div><b>Belum menemukan jawaban?</b><p>Ajukan pertanyaan atau laporkan kendala melalui kanal bantuan resmi.</p></div><button @click="$router.push('/bantuan')">Buka Pusat Bantuan</button></section><p class="faq-note">Catatan pengelolaan: FAQ ini merupakan materi panduan umum. Ketentuan operasional yang mengikat tetap mengacu pada SOP, kebijakan, peraturan, dan instruksi resmi yang berlaku. Target waktu penyelesaian, nama PIC, kanal pelaporan, dan mekanisme eskalasi harus disesuaikan dengan ketentuan perusahaan yang telah disahkan oleh masing-masing operator.</p></div>
  </div>
</template>
