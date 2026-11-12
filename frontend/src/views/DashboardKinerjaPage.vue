<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../api'

const areas = ['Ringkasan Eksekutif', 'Operasional & Ketepatan Jadwal', 'Keselamatan & Manajemen Risiko', 'Kinerja SDM & Pelatihan', 'Pelayanan & Keluhan Pelanggan', 'Kepatuhan SOP & Hasil Audit', 'Armada, Maintenance & Kelayakan', 'Keuangan, Load Factor & BCR']
const tab = ref(0)
const period = ref('')
const periods = ref([])
const data = ref(null)
const loading = ref(true)
const failed = ref(false)

const kpiIcons = [
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V10m6 10V4m6 16v-7m5 7H2"></path></svg>`,
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"></path><path d="m9 12 2 2 4-5"></path></svg>`,
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6l1 3h3v16H5V6h3z"></path><path d="m8 13 2 2 5-5M9 3v3h6V3"></path></svg>`,
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 20v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"></path></svg>`
]

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const label = (p) => {
  const [y, m] = p.split('-')
  return `${MONTHS[Number(m) - 1]} ${y}`
}

async function load() {
  try {
    const res = await api.get('/dashboard', { params: period.value ? { period: period.value } : {} })
    data.value = res.data.data
    if (res.data.period) period.value = res.data.period
  } catch (e) {
    failed.value = true
  }
}

onMounted(async () => {
  try {
    periods.value = (await api.get('/dashboard/periods')).data
    await load()
  } catch (e) {
    failed.value = true
  } finally {
    loading.value = false
  }
})

// Garis tren (viewBox 700x220, skala 85%–100%)
const trend = computed(() => data.value?.trend || null)
function y(v) {
  const lo = 85, hi = 100
  return Math.round(220 - ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * 220)
}
const points = computed(() => {
  const a = trend.value?.actual || []
  if (a.length < 2) return []
  return a.map((v, i) => [Math.round((i / (a.length - 1)) * 700), y(v)])
})
const linePath = computed(() => points.value.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' '))
const fillPath = computed(() => (linePath.value ? `${linePath.value} L700 220 L0 220Z` : ''))
const targetPath = computed(() => {
  const t = trend.value?.target || []
  if (t.length < 2) return ''
  return t.map((v, i) => `${i ? 'L' : 'M'}${Math.round((i / (t.length - 1)) * 700)} ${y(v)}`).join(' ')
})

const fleet = computed(() => data.value?.fleet || null)
const donut = computed(() => {
  const f = fleet.value
  if (!f) return ''
  const total = f.total || (f.ready || 0) + (f.maintenance || 0) + (f.unfit || 0)
  if (!total) return ''
  const r = (((f.ready || 0) / total) * 100).toFixed(1)
  const m = ((((f.ready || 0) + (f.maintenance || 0)) / total) * 100).toFixed(1)
  return `conic-gradient(var(--line) 0 ${r}%, var(--gold) ${r}% ${m}%, #c8475a ${m}%)`
})
const safety = computed(() => data.value?.safety || null)
</script>

<template>
  <div class="dz">
<section class="page-hero"><div class="shell"><div><span class="eyebrow light">PERFORMANCE CONTROL</span><h1>Dashboard Operasional</h1><p>Pemantauan indikator utama untuk mendukung keputusan operasional berbasis data.</p></div><div class="period"><span>Periode laporan</span><select v-model="period" @change="load"><option v-for="p in periods" :key="p" :value="p">{{ label(p) }}</option></select></div></div></section><section class="section shell dashboard">
<p v-if="loading" class="dz-sample">Memuat data dashboard…</p>
<p v-else-if="failed" class="dz-sample">Data dashboard belum dapat dimuat.</p>
<p v-else-if="!data" class="dz-sample">Belum ada data dashboard. Admin dapat mengisinya di Panel Admin → Dashboard Kinerja.</p>
<div class="area-tabs"><button v-for="(a, i) in areas" :key="a" :class="{ active: tab === i }" @click="tab = i"><i>{{ String(i + 1).padStart(2, '0') }}</i><span>{{ a }}</span></button></div>
<template v-if="data">
<div class="kpi-grid"><article v-for="(k, i) in data.kpis" :key="k.label"><span v-html="kpiIcons[i % kpiIcons.length]"></span><small>{{ k.label }}</small><h2>{{ k.value }}</h2><p v-if="k.delta" :class="{ down: !k.up }">{{ k.delta }} <em>dari bulan lalu</em></p></article></div>
<div class="charts-grid"><article v-if="trend && points.length" class="chart large"><div class="chart-head"><div><small>TREN KINERJA</small><h3>{{ trend.title || 'Ketepatan jadwal armada' }}</h3></div><span><i></i> Aktual <i></i> Target</span></div><div class="line-chart"><div class="y-labels"><span>100%</span><span>95%</span><span>90%</span><span>85%</span></div><svg viewBox="0 0 700 220" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1765C5" stop-opacity=".25"></stop><stop offset="1" stop-color="#1765C5" stop-opacity="0"></stop></linearGradient></defs><path class="fill" :d="fillPath"></path><path class="line" :d="linePath"></path><path v-if="targetPath" class="target" :d="targetPath"></path></svg><div class="x-labels"><span v-for="m in trend.months" :key="m">{{ m }}</span></div></div></article><article v-if="fleet" class="chart"><div class="chart-head"><div><small>DISTRIBUSI</small><h3>Status armada</h3></div></div><div class="donut-wrap"><div class="donut" :style="{ background: donut }"><div><b>{{ fleet.total }}</b><small>Total armada</small></div></div><ul><li><i class="green"></i>Siap operasi <b>{{ fleet.ready }}</b></li><li><i class="yellow"></i>Maintenance <b>{{ fleet.maintenance }}</b></li><li><i class="red"></i>Tidak layak <b>{{ fleet.unfit }}</b></li></ul></div></article></div>
<div class="dashboard-bottom"><article v-if="safety"><small>INSIDEN &amp; RISIKO</small><h3>Ringkasan keselamatan</h3><div class="metric-row"><span><b>{{ safety.major }}</b><small>Major incident</small></span><span><b>{{ safety.minor }}</b><small>Minor incident</small></span><span><b>{{ safety.near_miss }}</b><small>Near miss</small></span><span><b>{{ safety.investigation_pct }}%</b><small>Investigasi selesai</small></span></div></article><article v-if="data.actions_open !== undefined && data.actions_open !== null"><small>PERHATIAN MANAJEMEN</small><h3>{{ data.actions_open }} tindak lanjut memerlukan aksi</h3><button>Lihat action register <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"></path></svg></button></article></div>
</template>
</section>
  </div>
</template>
