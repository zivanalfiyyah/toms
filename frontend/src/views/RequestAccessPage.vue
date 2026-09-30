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
.wrap {
  max-width: 480px; margin: 3rem auto; padding: 2rem;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-xl); box-shadow: var(--shadow-card);
}
[data-theme='dark'] .wrap { border-color: var(--color-accent-border); }
h1 { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 1.4rem; }
.field { margin-bottom: 1rem; }
label { display: block; font-size: 0.78rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--color-ink-soft); }
input, textarea {
  width: 100%; padding: 0.65rem 0.85rem; border: 1px solid var(--color-border);
  border-radius: var(--radius); background: var(--input-bg); color: var(--color-ink);
  font-family: inherit; font-size: 0.9rem;
}
input:focus, textarea:focus { outline: none; border-color: var(--color-accent-border); box-shadow: 0 0 0 3px var(--color-accent-soft); }
.btn-submit {
  padding: 0.7rem 1.3rem; background: linear-gradient(90deg, #0284c7, #0ea5e9); color: #fff; border: none; border-radius: var(--radius);
  box-shadow: var(--btn-glow); font-weight: 700; cursor: pointer; transition: transform 0.15s ease, filter 0.15s ease; font-size: 0.88rem;
}
.btn-submit:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
.error {
  color: #ef4444; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: var(--radius); padding: 0.6rem 0.8rem; font-size: 0.82rem; margin-bottom: 1rem;
}
textarea { resize: vertical; }
.btn-secondary {
  padding: 0.65rem 1.2rem; border: 1px solid var(--glass-border); border-radius: var(--radius);
  background: var(--glass-bg); color: var(--color-ink); font-weight: 600; cursor: pointer; margin-top: 1rem;
}
.btn-secondary:hover { background: var(--color-accent-soft); color: var(--color-accent); }
.success { text-align: center; }
</style>