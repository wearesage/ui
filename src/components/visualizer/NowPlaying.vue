<template>
  <Transition name="longfade">
    <aside
      v-if="visualizer.source === 'AUDIUS' && visible && playlist.currentTrack"
      :class="{ neon: visualizer?.settings?.neon }">
      <figure>
        <img :src="artwork" />
      </figure>
      <div class="info">
        <div>
          <strong>{{ trim(title) }}</strong>
          <RouterLink :to="`/audius/users/${artist.handle}`">
            <span>{{ artist.name }}</span>
          </RouterLink>
        </div>
        <PlayerControls />
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
const viewport = useViewport();
const visualizer = useVisualizer();
const playlist = usePlaylist();
const title = computed(() => playlist.currentTrack?.title);
const artwork = computed(() => playlist.currentTrack?.artwork?.['480x480']);
const artist = computed(() => ({
  name: playlist.currentTrack?.user?.name,
  handle: playlist?.currentTrack?.user?.handle,
}));

defineProps<{
  visible: boolean;
}>();

function trim(str: string) {
  const sliced = str
    .split('')
    .slice(0, viewport.mobile ? 15 : 50)
    .join('');
  if (sliced.length < str.length) return sliced + '...';
  return str;
}
</script>

<style lang="scss" scoped>
aside {
  @include position(fixed, null null calc(1rem + env(safe-area-inset-bottom)) calc(1rem + env(safe-area-inset-left)), 15);
  @include flex-row;
}

.neon {
  mix-blend-mode: exclusion;
}

figure {
  @include size(15rem);
  position: relative;

  @include mobile {
    @include size(10rem);
  }

  &:before {
    @include position(absolute, 0.25rem 0.25rem 0.25rem 0.25rem, 10);
    content: '';
    display: block;
    transition: var(--hover-transition);
    background: radial-gradient(circle, rgba(10, 10, 18, 0) 40%, rgba(10, 10, 18, 0.15) 50%);
    box-shadow: inset 0 0 10rem 0rem lighten(rgba(10, 10, 18, 0.5), 0%);
  }
}

img {
  @include size(100%);
}

.info {
  @include flex-column(space-between, start);
  @include position(absolute, null null 1rem 1rem, 10);
  @include gap(0.5);

  flex: 1;

  div {
    @include flex-row(start, center);
    @include gap(0.5);
  }

  strong {
    font-size: 1.5rem;
    font-weight: 300;
    white-space: nowrap;
    background: $black;
    padding: 0.5rem 1rem;
    border-radius: 5rem;
  }

  a {
    background: $black;
    font-weight: 700;
    padding: 0.4rem 0.75rem;
    border-radius: 1rem;

    span {
      @include text-gradient($orange, $pink);
      white-space: nowrap;
    }
  }
}
</style>
