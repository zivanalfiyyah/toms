<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api'

const props = defineProps({
  token: { type: String, required: true },
})

const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const loadError = ref('')
const invitation = ref(null)

const password = ref('')
const passwordConfirmation = ref('')
const submitting = ref(false)
const submitError = ref('')

onMounted(async () => {
  try {
    const res = await api.get(`/invitations/${props.token}`)
    invitation.value = res.data
  } catch (err) {
    loadError.value = err.response?.data?.message || 'Undangan tidak ditemukan atau sudah tidak berlaku.'
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  submitting.value = true
  submitError.value = ''
  try {
    const res = await api.post(`/invitations/${props.token}/accept`, {
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })

    auth.token = res.data.token
    auth.user = res.data.user
    localStorage.setItem('token', auth.token)
    localStorage.setItem('user', JSON.stringify(auth.user))

    router.push('/')
  } catch (err) {
    submitError.value = err.response?.data?.message || 'Gagal mengaktifkan akun. Coba lagi.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="wrap">
    <h1>Aktifkan Akun</h1>

    <p v-if="loading">Memuat undangan...</p>
    <p v-else-if="loadError" class="error">{{ loadError }}</p>

    <form v-else @submit.prevent="handleSubmit">
      <p class="hint">
        Halo <strong>{{ invitation.name }}</strong> ({{ invitation.email }}) —
        kamu diundang sebagai <strong>{{ invitation.role }}</strong>. Buat password buat aktifin akunmu.
      </p>

      <p v-if="submitError" class="error">{{ submitError }}</p>

      <div class="field">
        <label>Password</label>
        <input type="password" v-model="password" required minlength="8" />
      </div>

      <div class="field">
        <label>Konfirmasi Password</label>
        <input type="password" v-model="passwordConfirmation" required minlength="8" />
      </div>

      <button type="submit" class="btn-submit" :disabled="submitting">
        {{ submitting ? 'Memproses...' : 'Aktifkan Akun & Masuk' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.wrap {
  max-width: 440px; margin: 3rem auto; padding: 2rem;
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
  box-shadow: var(--btn-glow); font-weight: 700; cursor: pointer; transition: transform 0.15s ease, filter 0.15s ease; font-size: 0.88rem; width: 100%;
}
.btn-submit:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
.error {
  color: #ef4444; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: var(--radius); padding: 0.6rem 0.8rem; font-size: 0.82rem; margin-bottom: 1rem;
}
.hint { font-size: 0.88rem; color: var(--color-ink-soft); margin-bottom: 1.2rem; }
</style>