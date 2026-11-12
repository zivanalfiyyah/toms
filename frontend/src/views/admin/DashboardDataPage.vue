<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import api from '../../api'

const periods = ref([])
const period = ref('')
const newPeriod = ref('')
const saving = ref(false)
const msg = ref('')
const error = ref('')

const blank = () => ({
  kpis: [
    { label: 'Ketepatan Jadwal', value: '', delta: '', up: true },
    { label: 'Safety Index', value: '', delta: '', up: true },
    { label: 'Kepatuhan SOP', value: '', delta: '', up: true },
    { label: 'Load Factor', value: '', delta: '', up: true },
  ],
  trendTitle: 'Ketepatan jadwal armada', months: 'Jan, Feb, Mar, Apr, Mei, Jun, Jul', actual: '', target: '',
  fleet: { total: 0, ready: 0, maintenance: 0, unfit: 0 },
  safety: { major: 0, minor: 0, near_miss: 0, investigation_pct: 100 },
  actions_open: 0,
})
const f = reactive(blank())

const toList = (s) => s.split(',').map((x) => x.trim()).filter(Boolean)
const toNums = (s) => toList(s).map(Number).filter((n) => !Number.isNaN(n))

function fill(d) {
  const b = blank()
  Object.assign(f, b)
  if (!d) return
  f.kpis = (d.kpis?.length ? d.kpis : b.kpis).map((k) => ({ label: k.label, value: k.value, delta: k.delta || '', up: k.up !== false }))
  f.trendTitle = d.trend?.title || b.trendTitle
  f.months = (d.trend?.months || []).join(', ') || b.months
  f.actual = (d.trend?.actual || []).join(', ')
  f.target = (d.trend?.target || []).join(', ')
  Object.assign(f.fleet, b.fleet, d.fleet || {})
  Object.assign(f.safety, b.safety, d.safety || {})
  f.actions_open = d.actions_open ?? 0
}

async function loadPeriods() {
  periods.value = (await api.get('/dashboard/periods')).data
}
async function select(p) {
  period.value = p
  msg.value = ''
  error.value = ''
  const res = await api.get('/dashboard', { params: { period: p } })
  fill(res.data.data)
}
onMounted(async () => {
  try {
    await loadPeriods()
    if (periods.value.length) await select(periods.value[0])
  } catch (e) { error.value = 'Gagal memuat data dashboard.' }
})

async function createPeriod() {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(newPeriod.value)) { error.value = 'Format periode: YYYY-MM, contoh 2025-07.'; return }
  period.value = newPeriod.value
  fill(null)
  newPeriod.value = ''
  error.value = ''
  msg.value = 'Periode baru: isi data lalu simpan.'
}

const isNew = computed(() => period.value && !periods.value.includes(period.value))

async function save() {
  saving.value = true
  msg.value = ''
  error.value = ''
  const payload = {
    kpis: f.kpis.filter((k) => k.label && k.value).map((k) => ({ label: k.label, value: String(k.value), delta: k.delta || null, up: !!k.up })),
    trend: { title: f.trendTitle, months: toList(f.months), actual: toNums(f.actual), target: toNums(f.target) },
    fleet: { ...f.fleet },
    safety: { ...f.safety },
    actions_open: Number(f.actions_open) || 0,
  }
  try {
    await api.put(`/dashboard/${period.value}`, payload)
    await loadPeriods()
    msg.value = 'Tersimpan.'
  } catch (e) {
    const errs = e.response?.data?.errors
    error.value = errs ? Object.values(errs)[0][0] : (e.response?.data?.message || 'Gagal menyimpan.')
  } finally {
    saving.value = false
  }
}

async function removePeriod() {
  if (!confirm(`Hapus data periode ${period.value}?`)) return
  await api.delete(`/dashboard/${period.value}`)
  await loadPeriods()
  period.value = ''
  fill(null)
  if (periods.value.length) await select(periods.value[0])
}
</script>

<template>
  <div>
    <div class="ap-head"><h2>Dashboard Kinerja</h2></div>
    <p v-if="error" class="ap-err">{{ error }}</p>
    <div class="ap-card ap-form">
      <div class="ap-row">
        <label>Periode
          <select :value="period" @change="select($event.target.value)">
            <option v-if="isNew" :value="period">{{ period }} (baru)</option>
            <option v-for="p in periods" :key="p" :value="p">{{ p }}</option>
            <option v-if="!periods.length && !period" value="">— belum ada —</option>
          </select>
        </label>
        <label>Tambah periode (YYYY-MM)<input v-model="newPeriod" placeholder="2025-07" @keyup.enter="createPeriod" /></label>
        <div style="align-self:end"><button type="button" class="ap-btn ghost" @click="createPeriod">Buat periode</button></div>
      </div>
    </div>

    <form v-if="period" class="ap-form" @submit.prevent="save">
      <div class="ap-card">
        <b>Kartu KPI (maks. 8)</b>
        <div v-for="(k, i) in f.kpis" :key="i" class="ap-row" style="align-items:end">
          <label>Nama<input v-model="k.label" /></label>
          <label>Nilai<input v-model="k.value" placeholder="98.7%" /></label>
          <label>Perubahan<input v-model="k.delta" placeholder="+1.4%" /></label>
          <label class="ap-check"><input v-model="k.up" type="checkbox" /> Naik (baik)</label>
        </div>
        <button v-if="f.kpis.length < 8" type="button" class="ap-link" style="margin-top:.6rem" @click="f.kpis.push({ label: '', value: '', delta: '', up: true })">+ Tambah kartu</button>
      </div>

      <div class="ap-card">
        <b>Grafik tren</b>
        <label>Judul<input v-model="f.trendTitle" /></label>
        <label>Bulan (pisahkan koma)<input v-model="f.months" /></label>
        <div class="ap-row">
          <label>Aktual % (koma, skala 85–100)<input v-model="f.actual" placeholder="95.1, 95.8, 96.4" /></label>
          <label>Target % (koma)<input v-model="f.target" placeholder="96, 96, 96" /></label>
        </div>
      </div>

      <div class="ap-card">
        <b>Status armada</b>
        <div class="ap-row">
          <label>Total<input v-model.number="f.fleet.total" type="number" min="0" /></label>
          <label>Siap operasi<input v-model.number="f.fleet.ready" type="number" min="0" /></label>
          <label>Maintenance<input v-model.number="f.fleet.maintenance" type="number" min="0" /></label>
          <label>Tidak layak<input v-model.number="f.fleet.unfit" type="number" min="0" /></label>
        </div>
      </div>

      <div class="ap-card">
        <b>Keselamatan &amp; tindak lanjut</b>
        <div class="ap-row">
          <label>Major incident<input v-model.number="f.safety.major" type="number" min="0" /></label>
          <label>Minor incident<input v-model.number="f.safety.minor" type="number" min="0" /></label>
          <label>Near miss<input v-model.number="f.safety.near_miss" type="number" min="0" /></label>
          <label>Investigasi selesai (%)<input v-model.number="f.safety.investigation_pct" type="number" min="0" max="100" /></label>
          <label>Tindak lanjut terbuka<input v-model.number="f.actions_open" type="number" min="0" /></label>
        </div>
      </div>

      <p v-if="msg" class="ap-ok">{{ msg }}</p>
      <div class="ap-actions" style="justify-content:flex-start">
        <button type="submit" class="ap-btn" :disabled="saving">{{ saving ? 'Menyimpan…' : 'Simpan periode' }}</button>
        <button v-if="!isNew" type="button" class="ap-btn ghost" @click="removePeriod">Hapus periode</button>
      </div>
    </form>
  </div>
</template>
