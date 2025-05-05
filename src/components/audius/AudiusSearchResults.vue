<template>
  <section
    :class="{ visible: users.length || playlists.length || tracks.length }"
    class="results">
    <ul class="users">
      <li
        v-for="(user, i) in users"
        :key="`user-${i}`"
        class="user">
        <RouterLink :to="`/audius/users/${user?.handle}`">
          <img
            :src="user?.profile_picture?.['150x150']"
            :alt="user?.name" />
          <strong>{{ user?.name }}</strong>
        </RouterLink>
      </li>
    </ul>

    <div class="lists">
      <AudiusContentList :collection="_playlists" />
      <AudiusContentList :collection="_tracks" @click="playTrack"/>
    </div>
  </section>
</template>

<script setup lang="ts">
const visualizer = useVisualizer();
const playlist = usePlaylist();
const audius = useAudius();
const router = useRouter();
const playlists = computed(() => audius.searchResults.playlists);
const users = computed(() => audius.searchResults.users);
const tracks = computed(() => audius.searchResults.tracks);

const _playlists = computed(() => {
  return playlists.value.reduce((acc, playlist) => {
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
});

const _tracks = computed(() => {
  return tracks.value.reduce((acc, track) => {
    return [
      ...acc,
      {
        artwork: track.artwork['480x480'],
        title: track.title,
        user: track.user.name,
      },
    ];
  }, []);
});

async function playTrack(i: any) {
  const track = tracks.value[i]
  if (visualizer.source !== 'AUDIUS') await visualizer.selectSource('AUDIUS', false);
  playlist.set([track]);
  router.push('/visualizer');
}
</script>

<style lang="scss" scoped>
.results {
  @include flex-column(start, start);
  @include box(0 3 3 3, 1);
  @include scroll-bar;
  // flex: 1;
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
  opacity: 0;
  transition: var(--base-transition);

  &.visible {
    opacity: 1;
  }

  @include mobile {
    @include flex-column(start, start);
    @include box(0 1 1 1,0);
  }
}

ul {
  @include flex-column(start, start);
  @include box(1 0, 0.5);
  height: 100%;
  flex: 1;
}

li {
  @include flex-row(start, center);
  @include gap;
}

a {
  @include flex-row(start, center);
  @include gap;
}

img {
  @include size(5rem);
}

.user img {
  border-radius: 3rem;
}

div {
  @include flex-column(start, start);
  width: 100%;
}

.users {
  @include flex-row(start, center);
  @include scroll-bar;
  @include gap(2);
  flex: 1;
  width: 100%;
  flex-shrink: 0;
  overflow-y: hidden;
  overflow-x: auto;
  min-height: 10rem;
}

.users li {
  height: 5rem;
  flex-shrink: 0;
  flex: 1;

  strong {
    white-space: nowrap;
  }
}

.lists {
  @include flex-column(start, start);
  @include box(2 0, 2);
}
</style>
