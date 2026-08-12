<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()

const name = ref('')
const email = ref('')
const division = ref('')
const reason = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const success = ref(false)

async function handleSubmit() {
  submitting.value = true
  errorMessage.value = ''
  try {
    await api.post('/access-requests', {
      name: name.value,
      email: email.value,
      division: division.value,
      reason: reason.value,
    })
    success.value = true
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Gagal mengirim permintaan. Coba lagi.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="wrap">
    <h1>Minta Akses Edit</h1>

    <div v-if="success" class="success">
      <p>Permintaan kamu udah terkirim. Admin akan meninjau dan mengirim undangan lewat email kalau disetujui.</p>
      <button class="btn-secondary" @click="router.push('/')">Kembali ke Beranda</button>
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <div class="field">
        <label>Nama Lengkap</label>
        <input type="text" v-model="name" required />
      </div>

      <div class="field">
        <label>Email</label>
        <input type="email" v-model="email" required />
      </div>

      <div class="field">
        <label>Divisi</label>
        <input type="text" v-model="division" placeholder="mis. Operasional, Marketing, dll" />
      </div>

      <div class="field">
        <label>Keperluan (opsional)</label>
        <textarea v-model="reason" rows="3" placeholder="Jelasin singkat mau ngedit/nambahin apa"></textarea>
      </div>

      <button type="submit" class="btn-submit" :disabled="submitting">
        {{ submitting ? 'Mengirim...' : 'Kirim Permintaan' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.wrap { max-width: 480px; margin: 3rem auto; padding: 0 1.5rem; }
.field { margin-bottom: 1rem; }
label { display: block; font-size: 0.85rem; margin-bottom: 0.3rem; color: var(--color-ink-soft); }
input, textarea {
  width: 100%; padding: 0.5rem 0.7rem; border: 1px solid var(--color-border);
  border-radius: var(--radius); background: var(--color-bg); color: var(--color-ink);
  font-family: inherit;
}
textarea { resize: vertical; }
.btn-submit {
  padding: 0.6rem 1.2rem; border: none; border-radius: var(--radius);
  background: var(--color-accent); color: #fff; font-weight: 600; cursor: pointer;
}
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary {
  padding: 0.6rem 1.2rem; border: 1px solid var(--color-border); border-radius: var(--radius);
  background: transparent; cursor: pointer; margin-top: 1rem;
}
.error { color: #d33; margin-bottom: 1rem; }
.success { text-align: center; }
</style>