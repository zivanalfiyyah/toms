<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'

const route = useRoute()
const router = useRouter()
const item = ref(null)
const all = ref([])
const loading = ref(true)
const notFound = ref(false)
const copied = ref(false)

async function load() {
  loading.value = true
  notFound.value = false
  try {
    item.value = (await api.get(`/announcements/${route.params.id}`)).data
  } catch (e) {
    notFound.value = true
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  load()
  api.get('/announcements').then((r) => { all.value = Array.isArray(r.data) ? r.data : (r.data?.data || []) }).catch(() => {})
})
watch(() => route.params.id, load)

const fmt = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '')

// Teks isi dipecah menjadi blok: daftar bernomor (didahului kalimat berakhiran ":"), dan paragraf.
const blocks = computed(() => {
  const body = (item.value?.body || '').trim()
  if (!body) return []
  const out = []
  for (const para of body.split(/\n\s*\n/)) {
    const lines = para.split('\n').map((l) => l.trim()).filter(Boolean)
    const numbered = lines.filter((l) => /^\d+[.)]\s+/.test(l))
    if (numbered.length >= 2) {
      const head = lines.filter((l) => !/^\d+[.)]\s+/.test(l)).join(' ')
      out.push({ type: 'list', title: head.replace(/:$/, ''), items: numbered.map((l) => l.replace(/^\d+[.)]\s+/, '')) })
    } else {
      out.push({ type: 'p', text: lines.join(' ') })
    }
  }
  // paragraf: pertama = pembuka, tengah = kotak info, terakhir = catatan penutup
  const ps = out.map((b, i) => (b.type === 'p' ? i : -1)).filter((i) => i >= 0)
  ps.forEach((idx, n) => {
    out[idx].role = n === 0 ? 'intro' : n === ps.length - 1 && ps.length > 1 ? 'closing' : 'callout'
  })
  return out
})
const listBlock = computed(() => blocks.value.find((b) => b.type === 'list'))
const readMin = computed(() => Math.max(1, Math.round(((item.value?.body || '').split(/\s+/).length || 0) / 180)))

const ICONS = {
  'Safety Alert': 'M12 3 2 21h20L12 3zm0 6v5m0 3v.01',
  'Update Kebijakan': 'M6 2h8l4 4v16H6zM14 2v5h5M9 13h6M9 17h6',
  'Pelatihan SDM': 'M3 9l9-5 9 5-9 5-9-5zm4 3v5c0 1 2.5 3 5 3s5-2 5-3v-5',
  'Agenda Audit': 'M4 5h16v16H4zM4 10h16M9 3v4M15 3v4',
}
const iconPath = computed(() => ICONS[item.value?.tag] || 'M3 11l18-7v16L3 13zM7 14v6')

const others = computed(() => all.value.filter((a) => String(a.id) !== String(route.params.id)).slice(0, 3))

async function copyLink() {
  try { await navigator.clipboard.writeText(location.href); copied.value = true; setTimeout(() => (copied.value = false), 1800) } catch (e) { /* abaikan */ }
}
</script>

<template>
  <div class="dz">
    <section class="page-hero">
      <div class="shell">
        <div>
          <span class="eyebrow light">{{ item?.tag || 'INFORMASI' }}</span>
          <h1>{{ item?.title || 'Informasi' }}</h1>
          <p v-if="item">{{ fmt(item.published_at) }}</p>
        </div>
      </div>
    </section>

    <section class="section shell info-detail">
      <button type="button" class="outline-btn" @click="router.push('/informasi')">← Kembali ke Informasi</button>
      <p v-if="loading" class="info-state">Memuat…</p>
      <p v-else-if="notFound" class="info-state">Informasi tidak ditemukan.</p>

      <article v-else class="idx-card">
        <div class="idx-meta">
          <span class="idx-chip">{{ item.tag }}</span>
          <span v-if="item.badge" class="idx-chip gold">{{ item.badge }}</span>
          <span class="idx-dot">{{ fmt(item.published_at) }}</span>
          <span class="idx-dot">± {{ readMin }} menit baca</span>
          <button type="button" class="idx-copy" @click="copyLink">{{ copied ? 'Tautan disalin ✓' : 'Salin tautan' }}</button>
        </div>

        <img v-if="item.image_url" class="idx-img" :src="item.image_url" :alt="item.title" />
        <p v-if="item.excerpt" class="idx-lead">{{ item.excerpt }}</p>

        <template v-for="(b, i) in blocks" :key="i">
          <div v-if="b.type === 'list'" class="idx-section">
            <header>
              <span class="idx-ico"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="iconPath"></path></svg></span>
              <h3>{{ b.title || 'Poin penting' }}</h3>
              <button type="button" class="idx-guide" @click="router.push('/daftar-isi')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2h8l4 4v16H6z"></path><path d="M14 2v5h5"></path></svg>
                Panduan Lengkap <em>›</em>
              </button>
            </header>
            <ol class="idx-steps"><li v-for="(it, k) in b.items" :key="k"><i>{{ k + 1 }}</i><span>{{ it }}</span></li></ol>
          </div>
          <p v-else-if="b.role === 'intro'" class="idx-p">{{ b.text }}</p>
          <div v-else-if="b.role === 'closing'" class="idx-closing">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.2 8 11 4.6-1.8 8-6 8-11V5z"></path><path d="m9 12 2 2 4-4"></path></svg>
            <p>{{ b.text }}</p>
          </div>
          <div v-else class="idx-callout">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 8v.01"></path></svg>
            <p>{{ b.text }}</p>
          </div>
        </template>
        <p v-if="!blocks.length && !item.excerpt" class="idx-p">Isi informasi belum tersedia.</p>
      </article>

      <div v-if="!loading && !notFound && others.length" class="idx-more">
        <h3>Informasi lainnya</h3>
        <div class="idx-more-grid">
          <button v-for="o in others" :key="o.id" type="button" @click="router.push(`/informasi/${o.id}`)">
            <small>{{ o.tag }} · {{ fmt(o.published_at) }}</small>
            <b>{{ o.title }}</b>
            <span>Baca selengkapnya →</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.dz .info-detail { padding-top: 32px; padding-bottom: 72px; }
.dz .idx-card { margin-top: 24px; padding: clamp(22px, 3.2vw, 44px); background: var(--surface); border: 1px solid var(--border); border-radius: 26px; box-shadow: var(--shadow); display: grid; gap: 22px; }
.dz .idx-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.dz .idx-chip { padding: 6px 12px; border-radius: 999px; background: var(--soft); color: var(--ink); font-size: 12px; font-weight: 800; }
.dz .idx-chip.gold { background: var(--gold-soft); color: var(--gold-ink); }
.dz .idx-dot { color: var(--muted); font-size: 13px; }
.dz .idx-dot::before { content: "•"; margin-right: 10px; color: var(--gold); }
.dz .idx-copy { margin-left: auto; border: 1px solid var(--border); background: var(--surface); color: var(--ink); border-radius: 999px; padding: 7px 14px; font-size: 12px; font-weight: 800; cursor: pointer; }
.dz .idx-copy:hover { border-color: var(--gold); }
.dz .idx-img { width: 100%; max-height: 360px; object-fit: cover; border-radius: 18px; }
.dz .idx-lead { margin: 0; font-size: clamp(17px, 1.6vw, 20px); line-height: 1.7; color: var(--ink); font-weight: 600; }
.dz .idx-p { margin: 0; font-size: 16px; line-height: 1.85; color: var(--text); max-width: 78ch; }
.dz .idx-section { padding: clamp(18px, 2.4vw, 28px); border: 1px solid var(--border); border-radius: 22px; background: var(--bg); }
.dz .idx-section header { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }
.dz .idx-ico { width: 54px; height: 54px; border-radius: 16px; display: grid; place-items: center; background: var(--gold-soft); color: var(--gold-ink); flex: 0 0 auto; }
.dz .idx-section h3 { margin: 0; flex: 1; font-size: clamp(18px, 1.8vw, 22px); color: var(--ink); position: relative; padding-bottom: 8px; }
.dz .idx-section h3::after { content: ""; position: absolute; left: 0; bottom: 0; width: 34px; height: 3px; border-radius: 3px; background: var(--gold); }
.dz .idx-guide { display: inline-flex; align-items: center; gap: 8px; border: 0; border-radius: 999px; padding: 10px 16px; background: var(--soft); color: var(--ink); font-weight: 800; font-size: 13px; cursor: pointer; white-space: nowrap; }
.dz .idx-guide em { font-style: normal; }
.dz .idx-guide:hover { background: var(--gold-soft); }
.dz .idx-steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px 40px; grid-template-columns: 1fr 1fr; }
.dz .idx-steps li { display: flex; align-items: flex-start; gap: 14px; font-size: 15.5px; line-height: 1.6; color: var(--ink); }
.dz .idx-steps i { flex: 0 0 auto; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: var(--gold-soft); color: var(--gold-ink); font-style: normal; font-weight: 800; font-size: 13px; }
.dz .idx-callout { display: flex; gap: 14px; align-items: flex-start; padding: 18px 22px; border-radius: 18px; background: var(--soft); border: 1px solid var(--border); color: var(--ink); }
.dz .idx-callout svg { flex: 0 0 auto; color: var(--blue, #2a5bd7); margin-top: 2px; }
.dz .idx-callout p, .dz .idx-closing p { margin: 0; line-height: 1.75; font-size: 15.5px; }
.dz .idx-closing { display: flex; align-items: center; gap: 18px; padding: 6px 4px; color: var(--ink); }
.dz .idx-closing svg { flex: 0 0 auto; color: var(--gold-ink); }
.dz .idx-more { margin-top: 36px; }
.dz .idx-more h3 { margin: 0 0 14px; color: var(--ink); }
.dz .idx-more-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.dz .idx-more-grid button { text-align: left; display: grid; gap: 8px; padding: 20px; border-radius: 20px; border: 1px solid var(--border); background: var(--surface); box-shadow: var(--shadow); cursor: pointer; font: inherit; color: var(--ink); }
.dz .idx-more-grid button:hover { border-color: var(--gold); transform: translateY(-2px); }
.dz .idx-more-grid small { color: var(--gold-ink); font-weight: 800; font-size: 11px; letter-spacing: 0.04em; }
.dz .idx-more-grid b { font-size: 15px; line-height: 1.45; }
.dz .idx-more-grid span { color: var(--muted); font-size: 13px; font-weight: 700; }
@media (width <= 900px) { .dz .idx-steps { grid-template-columns: 1fr; } .dz .idx-more-grid { grid-template-columns: 1fr; } .dz .idx-section header { flex-wrap: wrap; } }
</style>
