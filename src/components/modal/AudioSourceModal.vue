<template>
  <section :class="{ neon: visualizer?.settings?.neon }">
    <!-- <header>
      <H1>5HT</H1>
      <h2>Choose your audio source.</h2>
      <CloseButton
        class="close"
        @click="modal.close()" />
    </header> -->

    <div class="row">
      <Button
        class="close"
        @click="modal.close()"
        icon="close" />
      <Button
        @click="select(AUDIO_SOURCES.SPOTIFY)"
        icon="spotify">
        <span>Spotify</span>
      </Button>
      <Button
        @click="select(AUDIO_SOURCES.AUDIUS)"
        icon="audius">
        <span>Audius</span>
      </Button>
      <Button
        @click="select(AUDIO_SOURCES.RADIO_PARADISE)"
        v-if="!viewport.safari"
        icon="radio-paradise">
        <span>Radio Paradise</span>
      </Button>
      <Button
        @click="select(AUDIO_SOURCES.MICROPHONE)"
        icon="microphone">
        <span>Microphone</span>
      </Button>
      <Button
        @click="select(AUDIO_SOURCES.FILE)"
        icon="upload">
        <span>Audio File</span>
      </Button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { AUDIO_SOURCES } from '../../constants/audio-sources';

const modal = useModal();
const viewport = useViewport();
const visualizer = useVisualizer();

modal.transparent = true;

function select(source: any) {
  visualizer.selectSource(source);
  modal.close();
  modal.transparent = false;
  if (source === AUDIO_SOURCES.FILE) modal.open('AudioFileUploadModal');
}
</script>

<style lang="scss" scoped>
@keyframes bobble-left {
  0% {
    opacity: 0;
    transform: translateX(var(--element-size));
  }

  100% {
    opacity: 1;
    transform: translateX(0rem);
  }
}

@keyframes bobble {
  0% {
    opacity: 0;
    transform: translateY(10rem);
    pointer-events: none;
  }

  100% {
    opacity: 1;
    transform: translateY(0%);
    pointer-events: all;
  }
}

header {
  @include flex-column(start, start);
  width: 100%;
  position: relative;

  @include mobile-portrait {
    // @include box(0 1, 1);
    // @include flex-column(center, start);
    // width: 100%;
  }

  :deep(.h1 *) {
    font-size: 5rem;
    line-height: 1;

    // @include mobile-portrait {
    //   font-size: var(--element-size);
    //   line-height: var(--element-size);
    // }
  }

  // @include mobile-portrait {
  //   position: static;
  // }
}

section {
  @include size(fit-content, 100%);
  @include flex-column(center, center);
  margin-left: auto;
  border-radius: 3rem;
  // background: $black;
  color: $white;

  h2 {
    display: block;
    font-size: 1.5rem;
  }

  @include mobile-portrait {
    // @include box;
    border-radius: 2rem;
  }
}

.row {
  @include flex-column(space-between, start);
  padding-right: env(safe-area-inset-right);
  gap: 0.25rem;
  width: 100%;
  // animation: bobble-left var(--long-duration) var(--base-easing) forwards;
  // opacity: 0;
  // @include mobile-portrait {
  //   // flex-direction: column;
  //   flex-wrap: wrap;
  //   // padding-top: 0;
  //   max-width: 50%;
  //   margin: 0 auto;
  // }

  :deep(svg *) {
    fill: $white;
  }
}

.row > * {
  @include cascade(10, 20ms);
  animation: bobble var(--long-duration) var(--base-easing) forwards;
  opacity: 0;
  border: 0;
}

button {
  // @include flex(center, center, row);
  // background: transparent;
  // border: 1px solid $white;
  // gap: 0.5rem;
  // font-size: 1.2rem;
  // padding: 1rem;
  // border-radius: 100px;
  transition: var(--hover-transition);

  background: $black;

  border: none;

  :deep(svg *) {
    transition: var(--hover-transition);
  }

  // &:hover {
  //   background: $white;
  //   color: $white;
  //   cursor: pointer;
  //   border-color: $purple;

  //   :deep(svg *) {
  //     fill: $purple;
  //   }
  // }

  &:active {
    transform: scale(0.95);
  }

  span {
    text-align: left;
    width: 100px;
    display: none;
    line-height: 1rem;
  }
}

svg {
  @include size(2rem);
  flex-grow: 0;
}

.close {
  background: $pink;
  margin-bottom: 1rem;
  &:hover {
    background: $white;
    :deep(*) {
      fill: $pink;
    }
  }

  // @include mobile-portrait {
  //   @include position(absolute,1.5rem 1rem null null);
  // }
}
</style>
