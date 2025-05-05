<template>
  <div class="container">
    <section>
      <H1>Share this!</H1>
      <div class="track-container">
        <div>
          <figure class="artwork">
            <img
              v-if="artwork"
              :src="artwork" />
            <input
              ref="artworkFile"
              type="file"
              :disabled="visualizer.source !== 'FILE'"
              @change="selectArtwork" />
            <button v-if="visualizer.source === 'FILE'"><Icon icon="album-artwork" /></button>
          </figure>
          <p
            class="track"
            v-if="visualizer.source === 'AUDIUS'">
            <span class="track">{{ track }}</span>
            <span class="artist">{{ artist }}</span>
          </p>

          <div
            class="track"
            v-else>
            <div class="track">
              <Icon icon="edit" />
              <input
                @input="e => (track = e.target.value)"
                :placeholder="'Track Title'"
                :value="track" />
            </div>
            <div class="track">
              <Icon icon="edit" />
              <input
                @input="e => (artist = e.target.value)"
                :placeholder="'Track Artist'"
                :value="artist" />
            </div>
          </div>
        </div>
        <Transition name="fade">
          <Screenshot
            v-if="modal.visible"
            @input="onInput"
            :value="link"
            :urlBase="`${origin}/g/`"
            urlPlaceholder="Your Custom URL">
            <Shader
              class="shader"
              :shader="editor.shader"
              :uniforms="editor.uniforms"
              :stream="visualizer.stream"
              :volume="visualizer.volume"
              :animate="true" />
          </Screenshot>
        </Transition>
      </div>

      <div class="buttons">
        <button
          @click="cancel"
          class="no"
          >Cancel</button
        >
        <button
          @click="submit"
          class="yes"
          :disabled="disableSubmit"
          >Create Link</button
        >
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const playlist = usePlaylist();
const editable = ref(false);
const visualizer = useVisualizer();
const editor = useEditor();
const modal = useModal();
const link = ref('');
const og = useOg();
const origin = ref(location.host);
const artworkFile = ref();
const viewport = useViewport();
const selectedArtwork = ref(null);
const artist = ref('');
const toast = useToast();
const track = ref('');

watch(
  () => [modal.visible, visualizer.source, playlist.currentTrack],
  () => {
    link.value = '';

    if (visualizer.source === 'AUDIUS') {
      artist.value = playlist.currentTrack.user.name;
      track.value = playlist.currentTrack.title;
    }

    if (visualizer.source === 'FILE') {
      artist.value = '';
      track.value = '';
    }
  },
  { immediate: true }
);

const artwork = computed(() => {
  if (visualizer.source === 'AUDIUS') return playlist.currentTrack.artwork['480x480'] || playlist.currentTrack.artwork['_480x480'];
  return selectedArtwork.value;
});

const disableSubmit = computed(() => {
  if (visualizer.source === 'AUDIUS') return link.value.length === 0;
  if (visualizer.source === 'FILE') {
    return link.value.length === 0 || !artist.value.length || !track.value.length || !selectedArtwork.value;
  }
  return true;
});

function onInput(e) {
  link.value = e;
}

async function submit() {
  const options: any = { link: link.value, sketch: editor.activeSketch._id, track: {} };

  const { data } = await get(`gists/${link.value as ':id'}`);

  if (data !== null) {
    toast.error(`Link has already been taken.`);
    return;
  }

  og.generateImage(editor.activeSketch).then(async (ogImage: string) => {
    options.track[(visualizer.source as string)?.toLowerCase()] = playlist.currentTrack.id || {
      title: track.value,
      artist: artist.value,
    };

    options.ogImage = ogImage;

    if (visualizer.source === 'FILE') {
      viewport.load();

      const { error, data } = await post('gists/artwork', { image: selectedArtwork.value });

      if (error) {
        console.log(error);
        return;
      }

      const formData = new FormData();
      formData.append('file', playlist.currentTrack.file);
      const { url: artworkUrl } = data;
      const {
        data: { id: trackId },
      } = await postFile('gists/tracks', formData);
      options.track[(visualizer.source as string)?.toLowerCase()].artwork = artworkUrl;
      options.track[(visualizer.source as string)?.toLowerCase()].s3 = trackId;
    }

    const { success, data } = await post('gists', options);

    ;

    if (success) {
      if (await writeToClipboard(`${(window || { location: { origin: '' } }).location.origin}/g/${data.link}`)) {
        toast.message('Link copied to clipboard.');
        modal.resolve(true);
      }
    } else {
      toast.error(data);
    }
  });
}

function selectArtwork(e) {
  const file = (event.target as HTMLInputElement).files?.[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = e => {
      if (e.target?.result) {
        selectedArtwork.value = e.target.result as string;
      }
    };

    reader.readAsDataURL(file);
  }
}

function cancel() {
  modal.resolve(false);
  editable.value = false;
  track.value = false;
}
</script>

<style lang="scss" scoped>
.container {
  @include position(absolute, 0 0 0 0);
  @include flex;
  max-width: 100vw;
  overflow: hidden;
  background: $black;
  // display: contents;
}

section {
  @include flex(flex-start, flex-start, column);
  @include size(600px, auto);
  @include mobile-portrait {
    @include size(calc(100% - 0.5rem), auto);
    margin: 0 auto;
    border-radius: 1.75rem !important;
    // padding: 0.5rem !important;
  }

  position: relative;
  gap: 0rem !important;
  font-size: 1rem;
  border-radius: 2rem !important;
  padding: 1rem !important;

  @include mobile-landscape {
    transform: scale(0.7);
  }
}

.toggle {
  margin: 0 0 0 auto !important;
  outline: 1px solid var(--pink) !important;
}

fieldset {
  @include flex(center, flex-start, row);
  width: 100%;
  border: 0;
  border-bottom: 1px solid rgba(white, 0.15);
  padding-bottom: 0.5rem;
  gap: 1rem;

  &:last-of-type {
    border: 0;
    padding: 0;
  }
}

.track-container {
  @include flex(center, start, row);
  @include size(100%, 400px);
  // border: 1px solid $white;
  padding: 1rem;
  // border-radius: 1rem;
  position: relative;
  z-index: 0;
  // margin-top: -2rem;

  @include mobile-portrait {
    @include size(100%, 250px);
    max-width: 100%;
    // padding: 0.25rem;
    // margin-top: -1rem;
  }

  @include mobile-landscape {
    height: 225px;
  }

  div {
    @include flex(center, start, row);
    gap: 0.5rem;
    margin-top: auto;
    width: 100%;
  }
}

.buttons {
  @include flex(center, center, row);
  gap: 1rem;
  width: 100%;
  margin: 0 auto;

  button {
    text-wrap: nowrap;
  }
}

.buttons button {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  flex: 1;
  // width: 100%;
  // width: 120px;
  background: transparent;
  border: 1px solid var(--white);
  padding: 0.5rem 1rem;
  border-radius: 3rem;
  // min-width: 5rem;
  height: 3rem;
  // font-weight: 900;
  font-size: 1rem;
  transition: var(--hover-transition);
  will-change: transform, opacity;

  &:first-of-type {
    margin-left: auto;
  }

  &:hover {
    cursor: pointer;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &.yes {
    background: $pink;
    border-color: $pink;
    color: $white;
  }

  &:disabled {
    opacity: 0.25;
  }
}

p.track {
  max-width: 100%;
  width: fit-content;
  height: auto;
  display: inline-flex;
  justify-content: start;
  align-items: start;
  flex-direction: column;
  // font-size: 0.75rem;
  font-size: 1rem;
  line-height: 1.5;

  flex-wrap: wrap;
  // opacity: 0.25;
  transition: var(--base-transition);
  position: relative;
  z-index: 1;

  .track,
  .artist {
    background: $black;
    min-width: fit-content;
    max-width: 100%;
  }
  // &.active {
  gap: 0.5rem;
  //   opacity: 1;
  // }
  @include mobile-portrait {
    font-size: 0.9rem;
  }
}

.track div {
  @include flex(center, center, row);
  position: relative;
  width: 100%;
  flex: 1;

  svg {
    @include size(1rem);
    @include position(absolute, 50% null null 0.35rem);
    transform: translateY(-50%);
    display: flex;
    pointer-events: none;
  }
}

.track input {
  padding: 0.25rem 0rem 0.25rem 1.5rem;
  background: transparent;
  flex: 1;
  border: 0;
  outline: 0;
}

.track svg {
  fill: $white;
  opacity: 0.5;
  margin-left: 0.25rem;
}

.track .track {
  display: inline;
  text-wrap: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 0;
  letter-spacing: 0.025rem;
  padding: 0.25rem 0.5rem;
  border-radius: 2rem;
  outline: 0;

  @include mobile-portrait {
    width: calc(100% - 5rem);
  }
}

.track .artist {
  border: 0;
  display: inline-block;
  color: var(--pink);
  // font-size: 0.8rem;
  letter-spacing: 0.025rem;
  padding: 0.25rem 0.5rem;
  border-radius: 2rem;
}

.h1,
:deep(.h1 *) {
  width: 100%;
  flex: 1;
  font-size: 4rem;
  display: flex;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  // margin-right: auto;
  // text-align: left;

  @include mobile-portrait {
    font-size: 2rem;
  }
}

.h1 {
  @include position(absolute !important, -1rem 2rem auto auto, 20);
  width: auto;

  :deep(*) {
    width: auto;
  }

  @include mobile-portrait {
    top: 0;
    right: 1.5rem;
  }
}

.artwork {
  @include size(6rem);
  @include flex;
  // @include shade(to top right, rgba($pink, 0.5), rgba($purple, 0.5));
  position: relative;
  background: rgba($black, 0.25);
  border-radius: 1rem;
  z-index: 1;
  flex-shrink: 0;

  // &:hover {
  //   img {
  //     opacity: 0.25;
  //   }
  // }

  button {
    @include size(100%);
    @include flex;
    background: radial-gradient($black, transparent);
    border: 0;
    fill: $white;
    position: absolute;
    z-index: 2;

    svg {
      @include size(2rem);
    }
  }

  @include mobile-portrait {
    @include size(4rem);
  }

  @include mobile-landscape {
    @include size(4rem);
  }

  input {
    @include position(absolute, 0 0 0 0, 10);
    opacity: 0;
  }

  img {
    @include size(100%);
    position: relative;
    z-index: -1;
    transition: var(--hover-transition);
  }
}

.screenshot {
  @include position(absolute, 0 0 0 0, 0);
  width: 100%;
}

.shader {
  flex-shrink: 0;
}
</style>
