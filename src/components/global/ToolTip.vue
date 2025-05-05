<template>
  <aside
    :class="{ visible: tooltip?.visible }"
    :style="style"
    id="tooltip"
    ref="container">
    <button
      v-for="(item, i) in tooltip?.actions"
      @click="item?.action?.()">
      {{ item.text }}
    </button>
  </aside>
</template>

<script setup lang="ts">
const viewport = useViewport();
const tooltip = useTooltip();
const mounted = ref(false);
const container = ref();
const style = computed(() => {
  if (!container.value || !mounted.value) return { transform: 'none' };
  const width = parseFloat(window.getComputedStyle(container.value).width);
  const offset = 2
  const x = Math.min(viewport.width - width - offset - 10, tooltip?.position?.[0] || 0)
  const y = (tooltip?.position?.[1] || 0) + offset
  return {
    transform: `translateX(${x}px) translateY(${y}px) ${tooltip?.visible ? `scale(1)` : `scale(.95)`}`,
  };
});

function onClick(e) {
  if (!e.target.contains(container.value)) {
    tooltip.hide();
  }
}

watch(
  () => [tooltip.visible, mounted.value],
  ([_, m]) => {
    if (_ && m) {
      window.addEventListener('click', onClick);
    } else {
      window.removeEventListener('click', onClick);
    }
  }
);

onMounted(() => {
  mounted.value = true;
});

onUnmounted(() => {
  window.removeEventListener('click', onClick);
});
</script>

<style lang="scss" scoped>
aside {
  @include blur;
  padding: 0.5rem;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  opacity: 0;
  transform-origin: top left;
  pointer-events: none;
  border-radius: 1rem;
  overflow: hidden;
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  transition: var(--base-transition);
  box-shadow: var(--box-shadow);

  &.visible {
    opacity: 1;
    pointer-events: all;
    transition: opacity var(--base-duration) var(--base-easing);
  }

  &:hover button {
    opacity: 0.5;

    &:hover {
      opacity: 1;
      cursor: pointer;
    }
  }
}

button {
  transition: var(--hover-transition);
  padding: 0.5rem;
  background: transparent;
  border: 0;
  width: 100%;
  text-align: left;
}
</style>
