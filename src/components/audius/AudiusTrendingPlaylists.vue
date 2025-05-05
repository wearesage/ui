<template>
  <section>
    <header>
      <strong class="header"><small>Trending</small> Playlists</strong>
      <RangeSelector v-model="audius.playlistRange" />
    </header>
    
    <AudiusContentList :collection="collection" />
  </section>
</template>

<script setup lang="ts">
const audius = useAudius();

const collection = computed(() => {
  return audius.trendingPlaylists[audius.playlistRange].reduce((acc, playlist) => {
    return [
      ...acc,
      {
        artwork: playlist.artwork['480x480'],
        title: playlist.playlist_name,
        user: playlist.user.name,
        link: `/audius/playlists/${playlist.id}`
      },
    ];
  }, []);
});

onMounted(() => {
  audius.initialize();
});
</script>

<style lang="scss" scoped>
section {
  @include flex-column(start, start);
  max-width: 100vw;
}

header {
  @include flex(start, start, row);
  @include box(0 1);
  width: 100%;
  overflow: hidden;
  transition: var(--base-transition);

  strong {
    text-align: center;
    text-transform: uppercase;
    font-family: 'Bungee';
    line-height: var(--element-size);
    font-weight: normal;
    font-size: 1rem;
  }

  small {
    font-size: 1rem;
    font-family: 'Inconsolata', sans-serif;
    font-weight: 300;
    letter-spacing: .15rem;
  }
}
</style>
