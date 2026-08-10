<script setup>
import { onMounted } from 'vue'
import { useAdminStore } from '../../stores/admin'

const admin = useAdminStore()

onMounted(() => {
  admin.fetchStats()
})

const cards = [
  { key: 'users_count', label: 'Total Pengguna' },
  { key: 'categories_count', label: 'Total Kategori' },
  { key: 'pages_count', label: 'Total Halaman' },
  { key: 'children_count', label: 'Total Sub-Halaman' },
]
</script>

<template>
  <div class="dashboard">
    <p v-if="admin.error" class="error">{{ admin.error }}</p>

    <div class="stat-grid">
      <div v-for="c in cards" :key="c.key" class="stat-card">
        <p class="stat-label">{{ c.label }}</p>
        <p class="stat-value">
          <template v-if="admin.statsLoading">&hellip;</template>
          <template v-else>{{ admin.stats?.[c.key] ?? '-' }}</template>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.25rem;
}
.stat-label { font-size: 0.8rem; color: var(--color-ink-soft); margin: 0 0 0.4rem; }
.stat-value { font-size: 1.6rem; font-weight: 700; margin: 0; font-family: var(--font-display); }

.recent {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem;
}
.recent h2 { font-size: 1rem; margin: 0 0 1rem; }

.log-list { list-style: none; margin: 0; padding: 0; }
.log-list li {
  display: flex; gap: 0.75rem; align-items: baseline;
  padding: 0.5rem 0; border-bottom: 1px dashed var(--color-border);
  font-size: 0.85rem;
}
.log-list li:last-child { border-bottom: none; }
.log-user { font-weight: 600; color: var(--color-ink); }
.log-action { color: var(--color-ink-soft); flex: 1; }
.log-time { color: var(--color-ink-soft); font-size: 0.75rem; }

.empty { color: var(--color-ink-soft); font-size: 0.85rem; }
.view-all { display: inline-block; margin-top: 0.75rem; font-size: 0.82rem; }
.error {
  color: #d33; background: rgba(211,51,51,0.06); border: 1px solid #d33;
  border-radius: var(--radius); padding: 0.7rem 0.9rem; font-size: 0.85rem; margin-bottom: 1rem;
}
</style>
