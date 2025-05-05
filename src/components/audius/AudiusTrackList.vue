<template>
  <ul
    v-if="tracks"
    class="tracks">
    <li
      v-for="(track, i) in tracks"
      :key="i">
      <img :src="track?.artwork?.['480x480']" />
      <div class="info">
        <strong class="title">{{ track.title }}</strong>
        <p class="artist">
          <RouterLink :to="`/audius/users/${track.user.handle}`">{{ track.user.name }}</RouterLink>
        </p>
      </div>
      <span class="duration">{{ formatTime(track.duration) }}</span>
      <IconButton icon="play" @click="play(track)"/>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { formatTime } from '@util'

defineProps<{ tracks: any[] }>();

const playlist = usePlaylist()
const visualizer = useVisualizer();
const router = useRouter();

async function play (track: any) {
  if (visualizer.source !== 'AUDIUS') await visualizer.selectSource('AUDIUS', false)
  playlist.set([track])
  router.push('/visualizer')
}
</script>

<style lang="scss" scoped>
ul {
  @include flex-column(start, start);
  @include box;
  margin: 0 auto;
  flex-shrink: 0
}

img {
  @include size(75px);
}

li {
  @include flex-row(start, center);
  @include gap;
  width: 100%;
}

.duration {
  margin-left: auto;
}

.info {
  @include flex-column(center, start);
  @include gap(0.5);
}
</style>
