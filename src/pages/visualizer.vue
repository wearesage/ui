<template>
  <main :class="{ 'show-editor': showEditor }">
    <Menu @toggle-editor="onToggleEditor" />

    <!-- <Actions
      :dirty="editor.dirty" />

    <GLSLEditor
      @update="e => (editor.shader = e)"
      :shader="editor.shader"
      :uniforms="editor.uniforms" />

    <Uniforms
      :uniforms="editor.uniforms"
      :sketch="editor.activeSketch"
      @add="editor.addUniform"
      @delete="editor.deleteUniform"
      @update="editor.updateUniforms" /> -->

    <Transition name="view">
      <MainShader
        v-if="editor.activeSketch && visualizer.visible"
        ref="shader"
        :zoomMultiplier="zoom"
        :shader="editor.shader"
        :uniforms="editor.uniforms"
        :width="width"
        :height="height"
        :stream="visualizer.stream"
        :volume="visualizer.volume"
        :tweening="visualizer.tweening"
        :tweenProgress="visualizer.tweenProgress"
        :tweeningUniforms="visualizer.tweeningUniforms"
        :autoSize="false"
        :animate="true" />
    </Transition>
  </main>
</template>

<script setup lang="ts">
import { interpolateNumber } from 'd3-interpolate';

const showEditor = ref(false);

const RESOLUTIONS = {
  '1080p': [1920, 1080],
  '720p': [1280, 720],
  '480p': [854, 480],
};

const shader = ref();
const viewport = useViewport();
const editor = useEditor();
const visualizer = useVisualizer();
const raf = useRAF();
const resolution = computed(() => ((visualizer.settings as any).resolution as '1080p' | '720p') || '1080p');
const side = computed(() => (viewport.orientation === 'LANDSCAPE' ? 'width' : 'height'));
const maxWidth = computed(() => (side.value === 'width' ? RESOLUTIONS[resolution.value][0] : RESOLUTIONS[resolution.value][1]));
const maxHeight = computed(() => (side.value === 'height' ? RESOLUTIONS[resolution.value][0] : RESOLUTIONS[resolution.value][1]));
const clampedWidth = computed(() => Math.min(viewport.width * viewport.dpr, maxWidth.value));
const clampedHeight = computed(() => Math.min(viewport.height * viewport.dpr, maxHeight.value));
const width = ref<number | null>(null);
const height = ref<number | null>(null);
const zoom = computed(() => Math.max(viewport.width / viewport.height / (16 / 9), 1));

watch(
  () => [clampedWidth.value, clampedHeight.value, viewport.width, viewport.height, side.value, viewport.orientation, viewport.touch],
  () => {
    if (viewport.touch) {
      width.value = viewport.width;
      height.value = viewport.height;
    } else {
      width.value = side.value === 'width' ? clampedWidth.value : clampedHeight.value * (viewport.width / viewport.height);
      height.value = side.value === 'height' ? clampedHeight.value : clampedWidth.value * (viewport.height / viewport.width);
    }

    shader.value?.setSize([width.value, height.value]);
  },
  {
    immediate: true,
  }
);

watch(
  () => shader.value,
  val => val?.setSize([width.value, height.value])
);

useKeyboardShortcuts();

function animate() {
  const max = side.value === 'width' ? clampedWidth.value : clampedHeight.value * (viewport.width / viewport.height);
  const min = viewport.width * 0.6 - parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-width'));
  const from = showEditor.value ? max : min;
  const to = showEditor.value ? min : max;
  const iWidth = interpolateNumber(from, to);

  raf.add({
    duration: 500,
    tick({ progress }) {
      shader.value.setSize([iWidth(progress), height.value]);
    },
  });
}

function onToggleEditor() {
  showEditor.value = !showEditor.value;
  animate();
}
</script>

<style lang="scss" scoped>
main {
  overflow: hidden;
}
</style>
