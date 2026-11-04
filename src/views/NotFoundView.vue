<template>
  <div class="page">
    <div class="not-found panel panel--padded">
      <span class="not-found__code">404</span>
      <h1>页面不存在</h1>
      <p class="muted">链接可能已失效，或者地址输错了。</p>
      <RouterLink class="not-found__link" to="/">返回总览</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 72px 24px;
  text-align: center;
}

.not-found__code {
  font-size: 64px;
  font-weight: 800;
  letter-spacing: -0.06em;
  color: var(--brand);
}

.not-found__link {
  margin-top: 8px;
  padding: 8px 18px;
  border-radius: 999px;
  background: var(--brand-soft);
  color: var(--brand-strong);
  font-size: 14px;
  font-weight: 600;
}
</style>
