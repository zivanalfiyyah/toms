<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import { downloadPdf } from '../utils/downloadPdf'

const props = defineProps({ limit: { type: Number, default: 6 }, paginate: { type: Boolean, default: false } })
const router = useRouter()
const rows = ref([])
const loading = ref(true)
const page = ref(1)
const last = ref(1)
const busy = ref(null)
const toast = ref('')

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/documents/latest', { params: { limit: props.limit, paginate: props.paginate ? 1 : 0, page: page.value } })
    rows.value = props.paginate ? data.data : data
    last.value = props.paginate ? data.last_page : 1
  } catch { rows.value = [] } finally { loading.value = false }
}
onMounted(load)
const go = (p) => { page.value = p; load() }

const fmt = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '')
const tone = (t) => ({ SOP: 'sop', KPI: 'kpi', Panduan: 'guide', Formulir: 'form', Kebijakan: 'pol' }[t] || 'doc')
const isNew = (r) => r.action === 'created'

async function dl(r) {
  busy.value = r.id
  const res = await downloadPdf(r.kind, r.subject_id, r.title)
  busy.value = null
  if (!res.ok && res.reason === 'error') { toast.value = res.message; setTimeout(() => { toast.value = '' }, 5000) }
}
const empty = computed(() => !loading.value && !rows.value.length)
</script>

<template>
  <div class="ld">
    <ul v-if="rows.length" class="ld-list">
      <li v-for="r in rows" :key="r.id" class="ld-row">
        <button type="button" class="ld-main" @click="router.push(r.to)">
          <span class="ld-ico" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h8l4 4v16H6z"></path><path d="M14 2v5h5"></path></svg><em>PDF</em></span>
          <span class="ld-body">
            <b>{{ r.title }}</b>
            <small>
              <i class="ld-chip" :class="tone(r.doc_type)">{{ r.doc_type }}</i>
              <span v-if="r.category_name">{{ r.category_name }}</span>
              <span>{{ isNew(r) ? 'Ditambahkan' : 'Diperbarui' }} {{ fmt(r.created_at) }}</span>
            </small>
          </span>
          <span class="ld-rev" :title="isNew(r) ? 'Dokumen baru' : 'Dokumen diperbarui'">{{ r.revision_label }}</span>
        </button>
        <button type="button" class="ld-dl" :disabled="busy === r.id" @click="dl(r)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"></path></svg>{{ busy === r.id ? '…' : 'Unduh' }}
        </button>
      </li>
    </ul>
    <p v-if="loading && !rows.length" class="ld-empty">Memuat dokumen…</p>
    <p v-if="empty" class="ld-empty">Belum ada dokumen yang tercatat.</p>
    <p v-if="toast" class="ld-toast" role="alert">{{ toast }}</p>
    <nav v-if="paginate && last > 1" class="ld-pager" aria-label="Halaman">
      <button type="button" :disabled="page <= 1" @click="go(page - 1)">‹ Sebelumnya</button>
      <span>{{ page }} / {{ last }}</span>
      <button type="button" :disabled="page >= last" @click="go(page + 1)">Berikutnya ›</button>
    </nav>
  </div>
</template>
