<template>
  <header>
    <div class="row">
      <h1 v-if="title">{{  title  }}</h1>
      <CloseButton :to="closeButtonLink" />
    </div>

    <slot></slot>
  </header>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    closeButtonLink?: string;
    title?: string;
  }>(),
  {
    closeButtonLink: '/visualizer',
  }
);
</script>

<style lang="scss" scoped>
header {
  @include flex-column(center, start);
  @include gap;
  width: var(--menu-content-width);
  margin: 0 auto;
}

.row {
  @include flex-row(space-between, start);
  width: 100%;
}

h1 {
  display: inline;
  color: $white;

  &::first-letter {
    color: $pink;
    
  }
  @include mobile {
    font-size: 2rem;
  }
}
</style>