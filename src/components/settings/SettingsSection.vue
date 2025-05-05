<template>
  <section class="settings-section">
    <header v-if="title">
      <h2>{{  title  }}</h2>
    </header>

    <div class="content">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
}>()
</script>

<style lang="scss" scoped>
section {
  @include flex;
  @include box(1 0, 1);
  @include vertical-rhythm;
  @include mobile {
    width: 100%;
  }
}

header {
  width: var(--menu-content-width);
  margin: 0 auto;
}

.content {
  @include vertical-rhythm;
  @include mobile-portrait {
    width: 100%;
  }
}

:deep(fieldset) {
  @include flex-row(space-between, center);
  @include box(0 1, 0);
  min-height: var(--element-size);
  margin: 0 auto;
  transition: var(--base-transition);
  width: var(--menu-content-width);
  background: lighten($black, 10%) !important;
  border: 0;
  border-radius: 2rem;
  flex-wrap: wrap;

  div {
    @include flex-row(end, center);
    @include gap;
  }

  svg {
    @include size(1.5rem);
  }
}
</style>