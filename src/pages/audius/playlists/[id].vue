<template>
  <main>
    <LoadingIndicator :visible="loading" />
    <CloseButton to="/audius" />

    <div class="content">
      <header>
        <h1>{{ playlist?.playlist_name }}</h1>
        <p v-if="playlist?.description">{{ playlist?.description }}</p>
        <Button icon="play" @click="play(playlist?.tracks)">Play All</Button>
        <AudiusUserInfo :user="playlist?.user" />
      </header>

      <div class="tracks-container">
        <AudiusTrackList :tracks="playlist?.tracks" />
      </div>
    </div>

    <Vinyl :src="playlist?.artwork?.['1000x1000']" />
  </main>
</template>

<script setup lang="ts">
const loading = ref(true);
const visualizer = useVisualizer();
const route = useRoute();
const router = useRouter();
const API = useAudiusAPI();
const playlist = ref<any>(null);
const { set } = usePlaylist();

useKeyboardShortcuts();
useEnsureAudius();

async function play (tracks: any[]) {
  if (visualizer.source !== 'AUDIUS') await visualizer.selectSource('AUDIUS')
  set(tracks)
  router.push('/visualizer')
}

onMounted(async () => {
  const response = (await API.fetchPlaylist(route.params.id)) as any;
  playlist.value = response.success ? response.playlist : null;
  loading.value = false;
});
</script>

<style lang="scss" scoped>
main {
  @include flex;
}

.content {
  @include flex-row(start, start);
  @include size(100%);
  overflow: hidden;
  background: linear-gradient(to top, $black, transparent);
}

.close {
  @include position(absolute, 1rem 1rem null null, 10);
}

.vinyl {
  @include position(fixed, -25vh null null -25vh, -1);
  @include size(100vh);

  @include mobile {
    @include position(fixed, -25vh null null 50%, -1);
    transform: translateX(-50%);
  }
}

header {
  @include flex-column(start, start);
  @include box(3, 1);
  width: 50vw;
  padding-top: 50vh;
}

.tracks {
  @include box;
  @include size(100%);
  margin-left: auto;
  padding-top: 50vh;
  padding-bottom: 50vh;
  overflow-y: auto;
}

.tracks-container {
  position: relative;
  height: 100%;
  width: 50vw;
}

h1 {
  @include flex-row(start, start);
  @include gap;
}

h1 button {
  margin-left: auto;
}

@include mobile {
  .content {
    @include flex-column(start, start);
    overflow-y: auto;
  }

  .tracks {
    height: fit-content;
    padding-top: 1rem;
    overflow-y: initial;
    width: 100%;
  }

  header,
  .tracks-container,
  header button {
    width: 100%;
  }

  header {
    @include box;
    padding-top: 50vh;
  }
}
</style>
