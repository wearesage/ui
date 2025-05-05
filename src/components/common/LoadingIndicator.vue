<template>
  <section
    class="loading"
    :class="{ visible }">
    <Spinner />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
}>();
</script>

<style lang="scss" scoped>
.loading {
  @include position(absolute, 0 0 0 0, 50);
  @include size(100%);
  @include flex;
  transition: var(--base-transition);
  opacity: 0;
  background: $black;
  pointer-events: none;
  &.visible {
    opacity: 1;
    pointer-events: all;
  }
}
</style>
