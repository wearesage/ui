<template>
  <section>
    <header>
      <strong class="header"><small>Trending</small> {{ collection }}</strong>
      <div class="range">
        <RangeSelector v-model="audius[range]" />
      </div>
    </header>

    <AudiusContentList
      :collection="data"
      @click="onClick" />
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  collection: 'Playlists' | 'Tracks';
}>();

const audius = useAudius();
const playlist = usePlaylist();
const router = useRouter();
const visualizer = useVisualizer();

const range = computed(() => (props.collection === 'Playlists' ? 'playlistRange' : 'trackRange'));

const data = computed(() => {
  if (props.collection === 'Playlists') {
    return audius.trendingPlaylists[audius[range.value]].reduce((acc, playlist) => {
      return [
        ...acc,
        {
          artwork: playlist.artwork['480x480'],
          title: playlist.playlist_name,
          user: playlist.user.name,
          link: `/audius/playlists/${playlist.id}`,
        },
      ];
    }, []);
  }

  if (props.collection === 'Tracks') {
    return audius.trendingTracks[audius[range.value]].reduce((acc, track) => {
      return [
        ...acc,
        {
          artwork: track.artwork['480x480'],
          title: track.title,
          user: track.user.name,
        },
      ];
    }, []);
  }
});

async function onClick(e: any) {
  if (props.collection === 'Tracks') {
    if (visualizer.source !== 'AUDIUS') await visualizer.selectSource('AUDIUS', false);
    playlist.set([audius.trendingTracks[audius[range.value]][e]]);
    router.push('/visualizer');
  }
}

onMounted(() => {
  audius.initialize();
});
</script>

<style lang="scss" scoped>
section {
  @include flex-column(start, start);
  @include box(1, 1);
  width: 100%;

  @include mobile {
    @include box(1, 0);
  }
}

header {
  @include flex(start, start, row);
  @include box(0 1 0 0, 2);
  width: 100%;
  transition: var(--base-transition);

  @include mobile {
    @include box(0, 1);
    @include flex-row(start, center);
    flex-wrap: wrap;
  }

  strong {
    text-align: center;
    text-transform: uppercase;
    font-family: 'Bungee';
    line-height: var(--element-size);
    font-weight: normal;
    font-size: 1rem;
    white-space: nowrap;

    @include mobile {
      line-height: 1;
    }
  }

  small {
    font-size: 1rem;
    font-family: 'Inconsolata', sans-serif;
    font-weight: 300;
    letter-spacing: 0.15rem;
  }
}

.range {
  display: flex;
  height: var(--element-size);
  flex-shrink: 0;
  flex: 1;
  width: 100%;

  @include mobile {
    @include flex-row(center, center);
    width: 100%;
  }
}
</style>
