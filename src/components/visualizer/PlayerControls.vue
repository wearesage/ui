<template>
  <section class="controls">
    <IconButton background="var(--black)" icon="previous" @click="playlist.previous"
      :disabled="visualizer.source === 'FILE' || playlist.index === 0" />
    <template v-if="!viewport.mobilePortrait">
      <small>{{ elapsed }}</small>
      <input type="range" :min="0" :max="1" :step="0.0001" @input="seek"
        :value="seeking ? seekValue : audio.player.progress" />
      <small>{{ duration }}</small>
    </template>
    <IconButton background="var(--black)" icon="next" @click="playlist.next"
      :disabled="visualizer.source === 'FILE' || playlist.length < 2 || playlist.index === playlist.length - 1" />
    <IconButton background="var(--black)" :icon="audio.player.playing || seeking ? 'pause' : 'play'"
      :disabled="!audio.player.src" @click="toggle" />
    <IconButton v-if="visualizer.source === 'AUDIUS'" background="var(--black)" icon="radio"
      @click="audius.buildRadioStation(playlist.currentTrack?.id)" />
    <IconButton v-if="visualizer.source === 'AUDIUS'" background="var(--black)" icon="radio"
      @click="audius.buildRadioStation(playlist.currentTrack?.id)" />
    <IconButton icon="lyrics" background="var(--black)" @click="visualizer.toggleLyrics" />
  </section>
</template>

<script setup lang="ts">
const audius = useAudius();
const visualizer = useVisualizer();
const playlist = usePlaylist();
const audio = useAudio();
const seeking = ref(false);
const seekValue = ref(0.5);
const elapsed = computed(() => formatTime(audio.player.elapsed));
const duration = computed(() => formatTime(audio.player.duration));
const viewport = useViewport();

const emits = defineEmits(['play']);

function toggle() {
  if (!audio.initialized) return emits('play');

  if (audio.player.playing) {
    audio.pause();
    return;
  }

  audio.play();
}

function seek(e: any) {
  seekValue.value = e.target.value;
  audio.seek(seekValue.value * audio.player.duration);
}
</script>

<style lang="scss" scoped>
.controls {
  @include flex(center, start, row);
  @include gap;
  position: relative;
  z-index: 100;

  @include mobile-portrait {
    left: 0;
    bottom: 0;
    right: 0;
    padding-bottom: calc(1rem);
  }
}

small {
  background: $black;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;

  &.auto {
    margin: 0 auto;
  }
}

.radio {
  position: relative;
  z-index: 0;
}

input {
  width: 100px;
}

button {
  border: 0;
}
</style>
