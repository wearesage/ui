<template>
  <Transition name="fade">
    <nav
      v-if="!modal.visible && visible"
      :class="{ neon: visualizer?.settings?.neon }">
      <IconButton
        :icon="visualizer.sourceIcon"
        @click="modal.open('AudioSourceModal')"
        background="var(--black)" />
      <IconButton
        v-if="visualizer.source === 'AUDIUS'"
        to="/audius"
        background="var(--black)"
        icon="vinyl" />
      <IconButton
        to="/designs"
        background="var(--black)"
        icon="grid" />
      <!-- <IconButton
        @click="$emit('toggle-editor')"
        background="var(--black)"
        icon="code" /> -->
      <IconButton
        to="/settings"
        background="var(--black)"
        icon="settings" />
      <IconButton
        @click="share"
        background="var(--black)"
        icon="share" />
      <IconButton
        v-if="isSupported"
        @click="toggleFullscreen"
        background="var(--black)"
        icon="fullscreen" />
    </nav>
  </Transition>

  <NowPlaying :visible="visible" />
</template>

<script setup lang="ts">
import { useEventListener } from '@vueuse/core';

defineEmits(['toggle-editor']);

const playlist = usePlaylist();
const { isSupported, exit, enter, isFullscreen } = useFullscreen();
const modal = useModal();
const visualizer = useVisualizer();
const visible = ref(false);
const { share } = useShare();

let timeout: any;

function show() {
  visible.value = true;
}

function hide() {
  visible.value = false;
}

watch(
  () => playlist.currentTrack,
  async val => {
    if (val) {
      visible.value = true;
      if (visualizer.settings?.alwaysShowTrackInfo) return;
      await pause(3000);
      visible.value = false;
    }
  },
  { immediate: true }
);

function tick() {
  clearTimeout(timeout);
  show();
  timeout = setTimeout(hide, 3000);
}

function toggleFullscreen() {
  if (isFullscreen.value) {
    exit();
  } else {
    enter();
  }
}

useEventListener(window, 'pointerdown', tick);
useEventListener(window, 'pointermove', tick);
</script>

<style lang="scss" scoped>
@keyframes bobble {
  0% {
    opacity: 0;
    transform: translateY(10rem);
  }

  100% {
    opacity: 1;
    transform: translateY(0%);
  }
}

nav {
  @include position(absolute, 0 env(safe-area-inset-right) 0 null, 10);
  @include flex-column(center, end);
  @include box(1, 0.25);
  overflow: hidden;
  // transition: var(--base-transition);
  // transform: translateX(-50%) translateY(0%);
}

nav > * {
  @include cascade(10, 20ms);
  animation: bobble var(--long-duration) var(--base-easing) forwards;
  opacity: 0;
  border: 0;
}

svg {
  @include size(2rem);
}
</style>
