<script setup>
defineProps({ segments: { type: Array, required: true } })
</script>

<style scoped>
.breadcrumb { font-family: var(--font-body); font-size: 11px; color: var(--color-ink-soft); margin: 0 0 1.5rem; }
.breadcrumb a { color: var(--color-ink-soft); }
.breadcrumb a:hover { color: var(--color-accent); }
.breadcrumb .sep { margin: 0 0.5rem; color: var(--color-ink-soft); opacity: 0.6; }
.breadcrumb .current { color: var(--color-accent); font-weight: 700; }
</style>

<template>
    <p class="breadcrumb">
        <router-link to="/">docs</router-link>
        <span v-for="(seg, i) in segments" :key="i">
            <span class="sep">/</span>
            <span :class="{ current:i === segments.length - 1 }">{{ seg }}</span>
        </span>
    </p>
</template>