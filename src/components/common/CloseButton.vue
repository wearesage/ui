<template>
  <Button
    :class="{ neon: visualizer.settings?.neon }"
    class="close"
    icon="close"
    :to="to" />
</template>

<script setup lang="ts">
const visualizer = useVisualizer();

withDefaults(
  defineProps<{
    to?: string;
  }>(),
  {
    to: '/visualizer',
  }
);
</script>
<style lang="scss" scoped>
.close {
  background: $pink;
  border: 0;
  z-index: 1000;

  :deep(svg) {
    transition: var(--hover-transition);
  }

  &:hover {
    background-color: $white;

    :deep(svg) {
      fill: $pink;
    }
  }
}
</style>
