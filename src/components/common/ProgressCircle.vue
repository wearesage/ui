<template>
  <div
    class="container"
    :class="{ visible }">
    <div
      class="progress-circle"
      @click="$emit('click')">
      <canvas
        ref="canvas"
        :width="size * viewport.dpr"
        :height="size * viewport.dpr"
        :style="{ width: size + 'px', height: size + 'px' }" />
      <div class="slot">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useViewport, useRAF } from '@stores';
import { scaleLinear } from 'd3-scale';

export interface Props {
  modelValue?: number;
  size?: number;
  strokeBackground?: string;
  strokeFill?: string;
  visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0.5,
  size: 16 * 3,
  strokeBackground: 'transparent',
  strokeFill: 'rgb(240, 42, 148)',
  visible: false,
});

const canvas = ref();
const viewport = useViewport();
const ctx = ref();

watch(
  () => [props.size, viewport.width, props.strokeBackground, props.strokeFill, props.modelValue],
  async () => {
    await nextTick();
    tick();
  }
);

defineEmits(['update:modelValue', 'click']);

const tick = () => {
  if (!ctx.value) return;

  const size = props.size;
  const x = size / 2;
  const y = size / 2;
  const r = size / 2.5;
  const start = Math.PI * 1.5;
  const end = start + Math.PI * 1.65;
  const angle = scaleLinear([0, 1], [start, end])(props.modelValue);

  ctx.value.resetTransform();
  ctx.value.scale(viewport.dpr, viewport.dpr);
  ctx.value.lineCap = 'round';
  ctx.value.lineWidth = size / 50;
  ctx.value.strokeStyle = props.strokeFill;
  ctx.value.fillStyle = 'rgba(255, 255, 255, 0)';
  ctx.value.clearRect(0, 0, size, size);
  ctx.value.beginPath();
  ctx.value.arc(x, y, r, start, end);
  ctx.value.fill();
  if (props.modelValue === 0) return;
  ctx.value.beginPath();
  ctx.value.arc(x, y, r, start, angle);
  ctx.value.stroke();
};

onMounted(() => {
  ctx.value = canvas.value.getContext('2d');
  tick();
});
</script>

<style lang="scss" scoped>
.container {
  @include position(absolute, 1rem null null 50%);
  @include flex;
  @include mobile-landscape {
    display: none;
  }
  transform: translateX(-50%); // translateY(-50%);
  width: fit-content;
  margin-left: auto;
  z-index: 99;
  pointer-events: none;
  will-change: transform, opacity;
  transition: var(--base-transition);
  opacity: 0;
  border-radius: 100%;

  &.visible {
    // transform: translateX(-50%) translateY(-50%) scale(1);
  }

  // @include mobile-portrait {
  //   transform: scale(0.25);

  //   &.visible {
  //     transform: scale(1);
  //   }
  // }
}

.progress-circle {
  z-index: 15000;
  opacity: 1;
  will-change: transform, opacity;
}

.slot {
  position: absolute;
  top: 1rem;
  right: 1rem;
  left: auto;
  bottom: auto;
  transform: translateX(-50%) translateY(-50%) rotate(-15deg);

  :deep(*) {
    fill: $white;
    transition: var(--page-transition);
  }

  :deep(svg) {
    // transform: scale(0.5) rotate(-35deg);
    // opacity: 0;
  }
}

.visible {
  opacity: 1;

  :deep(svg) {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
