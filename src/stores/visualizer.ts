import { type AUDIO_SOURCE, AUDIO_SOURCES } from '../constants/audio-sources';

const ls = createdNamespacedStorageHelpers('5HT.VISUALIZER');
const AUDIO_SOURCE_KEY = 'AUDIO_SOURCE';
const RADIO_SOURCES: any = {
  [AUDIO_SOURCES.RADIO_PARADISE]: `https://stream.radioparadise.com/aac-320`,
};

let metadataInterval: any;

export type Settings = {
  alwaysShowAlbumArtwork: boolean;
  alwaysShowTrackInfo: boolean;
  alwaysShowPlayerControls: boolean;
  shuffleDesigns: boolean;
  retina: boolean;
  rememberSelectedSource: boolean;
  lastAudioSource: AUDIO_SOURCE;
  reduceFlashing: boolean;
  shuffleInterval: {
    minutes: number;
    tracks: number;
    trackTick: number;
  };
};

export const useVisualizer = defineStore('visualizer', () => {
  const account = useAccount();
  const raf = useRAF();
  const audio = useAudio();
  const playlist = usePlaylist();
  const modal = useModal();
  const editor = useEditor();
  const shaders = useShaders();
  const route = useRoute();
  const spotify = useSpotify();
  const audius = useAudius();
  const viewport = useViewport();
  const source: Ref<AUDIO_SOURCE | null> = ref(null);
  const visible = ref(true);
  const trackTick = ref(0);
  const tweening = computed(() => editor.tweening);
  const tweenProgress = computed(() => editor.tweenProgress);
  const tweeningUniforms = computed(() => editor.tweeningUniforms);
  const settings = computed(() => account.settings || {});
  const volume = computed(() => {
    return Math.pow(
      settings.value?.reduceFlashing ? 1 : source.value === 'SPOTIFY' ? spotify.volume : audio.volume,
      settings.value?.volumeSensitivity || 1
    );
  });
  const stream = computed(() => {
    const speed = settings.value?.speed || 'normal';
    const multiplier = speed === 'normal' ? .9 : speed === 'slow' ? 0.4 : 1.2;

    if (source.value === 'SPOTIFY') {
      return multiplier * (spotify.currentlyPlaying && spotify.playing ? spotify.stream : raf.time / 1000);
    }

    if (source.value === 'AUDIUS') {
      return multiplier * (audio.player.playing ? audio.stream : raf.time / 1000);
    }

    return multiplier * (audio.stream || raf.time / 5000);
  });

  const sourceIcon = computed(() => {
    switch (source.value) {
      case 'SPOTIFY':
        return 'spotify';
      case 'AUDIUS':
        return 'audius';
      case 'MICROPHONE':
        return 'microphone';
      case 'RADIO_PARADISE':
        return 'radio-paradise';
      case 'KEXP':
        return 'kexp';
      case 'FILE':
        return 'upload';
      default:
        return 'sound';
    }
  });

  watch(
    () => spotify.profile,
    async val => {
      if (!val) return;

      try {
        account.updateSelf({
          spotify: {
            ...val,
            accessToken: spotify.tokens.access,
            refreshToken: spotify.tokens.refresh,
          },
          email: account.email || val.email,
        });
      } catch (e) {}
    }
  );

  watch(
    () => [route.path, account.authenticated],
    ([path, val]) => {
      if (val && path === '/visualizer') {
        editor.variantShuffle = true;
        const { resumeLastAudioSource, lastAudioSource } = settings.value as any;
        const shouldAutoSelect = source.value === null && resumeLastAudioSource && lastAudioSource === 'SPOTIFY';
        if (spotify.amIAuthenticating() || shouldAutoSelect) selectSource('SPOTIFY');
        nextTick().then(() => {
          nextTick().then(() => !source.value && modal.open('AudioSourceModal'));
        });
      }
    },
    {
      immediate: true,
    }
  );

  const dpr = computed(() => {
    if (viewport.dpr === 1) return 1;
    return settings.value?.retina ? 2 : 1;
  });

  watch(
    () => spotify.currentlyPlaying,
    val => {
      if (!val || !settings.value?.shuffleDesigns || source.value !== 'SPOTIFY') return;
      sketchShuffleTick();
    }
  );

  watch(
    () => playlist.currentTrack,
    async val => {
      if (!val || !settings.value?.shuffleDesigns || source.value !== 'AUDIUS') return;
      sketchShuffleTick();
    }
  );

  let interval: any;

  watch(
    () => [source.value, settings.value],
    ([source, settings]: any) => {
      if (settings?.shuffle && settings?.shuffleInterval?.minutes) {
        if (source === 'RADIO_PARADISE' || source === 'KEXP' || source === 'AUDIUS') {
          clearInterval(interval);
          interval = setInterval(() => {
            sketchShuffle();
          }, settings.shuffleInterval.minutes * 1000 * 60);
        } else {
          clearInterval(interval);
        }
      } else {
        clearInterval(interval);
      }
    },
    { immediate: true, deep: true }
  );

  function sketchShuffleTick() {
    trackTick.value++;
    if (trackTick.value === settings.value?.shuffleInterval?.tracks) {
      trackTick.value = 0;
      sketchShuffle();
    }
  }

  async function sketchShuffle() {
    visible.value = false;
    await pause(2000);
    editor.selectSketch(sample(shaders.published));
    await nextTick();
    visible.value = true;
  }

  function getMetadata() {
    fetch(import.meta.env.VITE_SERVER + '/api/radio/radio-paradise/now-playing')
      .then(res => res.json())
      .then(data => {
        try {
          const { title, artist, album, cover } = data;
          playlist.set([{ title, artist, album, artwork: cover }]);
        } catch (e) {
          console.log(e);
        }
      });
  }

  function selectSource(selectedSource: AUDIO_SOURCE, clearPlaylist = true) {
    if (source.value === selectedSource) return;

    clearInterval(metadataInterval);

    audio.cleanup();
    spotify.cleanup();

    if (clearPlaylist) playlist.set([]);

    source.value = selectedSource;

    ls.set(AUDIO_SOURCE_KEY, source.value);

    if (source.value === null) return;

    if (source.value === AUDIO_SOURCES.SPOTIFY) {
      return spotify.initialize();
    }

    if (source.value === AUDIO_SOURCES.AUDIUS) {
      audio.initialize(source.value);
      return audius.initialize();
    }

    if (source.value === AUDIO_SOURCES.S3) {
      return audio.initialize(source.value);
    }

    audio.initialize(source.value);

    if (source.value === 'LINK') {
      audio.player.src = '/mp3/demo.mp3';
    }

    if (source.value === 'RADIO_PARADISE') {
      audio.player.src = RADIO_SOURCES[source.value];
      getMetadata();
      clearInterval(metadataInterval);
      metadataInterval = setInterval(() => {
        getMetadata();
      }, 5000);
    }
  }

  onBeforeUnmount(() => {
    clearInterval(interval);
  });

  return {
    selectSource,
    source,
    settings,
    volume,
    stream,
    dpr,
    sourceIcon,
    visible,
    tweening,
    tweenProgress,
    tweeningUniforms,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useVisualizer, import.meta.hot));
