<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  copy: { type: String, default: '' },
})
</script>

<template>
  <section class="page-hero">
    <div class="page-hero-inner">
      <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
      <h1>{{ title }}</h1>
      <p v-if="copy">{{ copy }}</p>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.page-hero {
  margin: -1.5rem calc(50% - 50vw) 0;
  padding: 150px 25px 64px;
  color: #fff; border-radius: 0 0 36px 36px;
  background: radial-gradient(circle at 85% 20%, rgba(200, 152, 64, 0.22), transparent 38%), linear-gradient(135deg, #04122e 0%, #0b2a63 100%);
}
.page-hero-inner { width: var(--shell); margin: 0 auto; }
.eyebrow { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--gold-2); }
h1 { margin: 10px 0 10px; font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; letter-spacing: -0.04em; color: #fff; }
p { margin: 0; max-width: 680px; color: #cdd9ee; font-size: 15px; line-height: 1.75; }
</style>
