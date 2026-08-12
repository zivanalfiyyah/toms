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
.wrap { max-width: 420px; margin: 3rem auto; padding: 0 1.5rem; }
.hint { font-size: 0.9rem; color: var(--color-ink-soft); margin-bottom: 1.2rem; }
.field { margin-bottom: 1rem; }
label { display: block; font-size: 0.85rem; margin-bottom: 0.3rem; color: var(--color-ink-soft); }
input {
  width: 100%; padding: 0.5rem 0.7rem; border: 1px solid var(--color-border);
  border-radius: var(--radius); background: var(--color-bg); color: var(--color-ink);
  font-family: inherit;
}
.btn-submit {
  padding: 0.6rem 1.2rem; border: none; border-radius: var(--radius);
  background: var(--color-accent); color: #fff; font-weight: 600; cursor: pointer; width: 100%;
}
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.error { color: #d33; margin-bottom: 1rem; }
</style>