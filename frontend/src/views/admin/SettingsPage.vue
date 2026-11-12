<script setup>
import { onMounted, reactive, ref } from 'vue'
import { usePortalStore } from '../../stores/portal'

const portal = usePortalStore()
const tab = ref('contact')
const msg = ref('')
const error = ref('')
const saving = ref(false)

const contact = reactive({ email: '', phone: '', hours: '' })
const faq = ref([])
const bab = ref([])

const clone = (x) => JSON.parse(JSON.stringify(x))

function fromStore() {
  Object.assign(contact, portal.contact)
  faq.value = clone(portal.faqTopics)
  bab.value = clone(portal.babTopics).map((b) => ({ ...b, topicsText: (b.topics || []).map((t) => (typeof t === 'string' ? t : t.to ? `${t.t} | ${t.to}` : t.t)).join('\n') }))
}
onMounted(async () => {
  await portal.load(true)
  fromStore()
})

async function run(fn) {
  saving.value = true
  msg.value = ''
  error.value = ''
  try {
    await fn()
    msg.value = 'Tersimpan. Perubahan langsung tampil di portal.'
  } catch (e) {
    const errs = e.response?.data?.errors
    error.value = errs ? Object.values(errs)[0][0] : (e.response?.data?.message || 'Gagal menyimpan.')
  } finally {
    saving.value = false
  }
}

const saveContact = () => run(() => portal.save('contact', { ...contact }))
const saveFaq = () => run(() => portal.save('faq', faq.value.map((g) => ({ title: g.title, items: g.items.map((i) => ({ q: i.q, a: i.a })) }))))
const saveBab = () => run(() => portal.save('bab_topics', bab.value.map((b) => ({
  title: b.title, goal: b.goal || '', topics: b.topicsText.split('\n').map((t) => t.trim()).filter(Boolean).map((line) => {
      const [t, to] = line.split('|').map((x) => x.trim())
      return to ? { t, to } : { t }
    }),
}))))

async function resetKey(key) {
  if (!confirm('Kembalikan ke isi bawaan?')) return
  await run(() => portal.reset(key))
  fromStore()
}

const isText = (a) => typeof a === 'string'
const addGroup = () => faq.value.push({ title: 'Topik baru', items: [{ q: '', a: '' }] })
const addBab = () => bab.value.push({ title: 'Bab baru', goal: '', topics: [], topicsText: '' })
</script>

<template>
  <div>
    <div class="ap-head">
      <h2>Konten Portal</h2>
      <div>
        <button v-for="t in [['contact', 'Kontak'], ['faq', 'FAQ'], ['bab', 'Topik Beranda']]" :key="t[0]" class="ap-btn" :class="{ ghost: tab !== t[0] }" style="margin-left:.4rem" @click="tab = t[0]; msg = ''; error = ''">{{ t[1] }}</button>
      </div>
    </div>
    <p v-if="error" class="ap-err">{{ error }}</p>
    <p v-if="msg" class="ap-ok">{{ msg }}</p>

    <form v-if="tab === 'contact'" class="ap-card ap-form" @submit.prevent="saveContact">
      <p class="ap-muted">Tampil di footer, Pusat Bantuan, dan halaman lain.</p>
      <label>Email support<input v-model="contact.email" type="email" required /></label>
      <label>Telepon / command center<input v-model="contact.phone" /></label>
      <label>Jam layanan<input v-model="contact.hours" /></label>
      <div class="ap-actions" style="justify-content:flex-start">
        <button class="ap-btn" :disabled="saving">Simpan</button>
        <button type="button" class="ap-btn ghost" @click="resetKey('contact')">Kembalikan bawaan</button>
      </div>
    </form>

    <form v-else-if="tab === 'faq'" class="ap-form" @submit.prevent="saveFaq">
      <div v-for="(g, gi) in faq" :key="gi" class="ap-card">
        <label>Nama topik<input v-model="g.title" required /></label>
        <div v-for="(it, ii) in g.items" :key="ii" style="border-top:1px solid var(--color-border);margin-top:.8rem;padding-top:.4rem">
          <label>Pertanyaan<input v-model="it.q" required /></label>
          <label v-if="isText(it.a)">Jawaban<textarea v-model="it.a" required></textarea></label>
          <p v-else class="ap-muted">Jawaban berformat daftar (tidak dapat diubah di sini; tetap tersimpan apa adanya).</p>
          <button type="button" class="ap-link danger" style="margin-left:0" @click="g.items.splice(ii, 1)">Hapus pertanyaan</button>
        </div>
        <div style="margin-top:.8rem">
          <button type="button" class="ap-link" @click="g.items.push({ q: '', a: '' })">+ Pertanyaan</button>
          <button type="button" class="ap-link danger" @click="faq.splice(gi, 1)">Hapus topik</button>
        </div>
      </div>
      <div class="ap-actions" style="justify-content:flex-start">
        <button type="button" class="ap-btn ghost" @click="addGroup">+ Topik</button>
        <button class="ap-btn" :disabled="saving">Simpan FAQ</button>
        <button type="button" class="ap-btn ghost" @click="resetKey('faq')">Kembalikan bawaan</button>
      </div>
    </form>

    <form v-else class="ap-form" @submit.prevent="saveBab">
      <p class="ap-muted">Akordeon "Topik Dokumentasi" di Beranda. Satu topik per baris.</p>
      <div v-for="(b, i) in bab" :key="i" class="ap-card">
        <label>Judul bab<input v-model="b.title" required /></label>
        <label>Tujuan singkat<input v-model="b.goal" /></label>
        <label>Topik (satu per baris; tautan opsional: <code>Teks | /docs/kategori/halaman</code>)<textarea v-model="b.topicsText" style="min-height:120px" required></textarea></label>
        <button type="button" class="ap-link danger" style="margin-left:0" @click="bab.splice(i, 1)">Hapus bab</button>
      </div>
      <div class="ap-actions" style="justify-content:flex-start">
        <button type="button" class="ap-btn ghost" @click="addBab">+ Bab</button>
        <button class="ap-btn" :disabled="saving">Simpan topik</button>
        <button type="button" class="ap-btn ghost" @click="resetKey('bab_topics')">Kembalikan bawaan</button>
      </div>
    </form>
  </div>
</template>
