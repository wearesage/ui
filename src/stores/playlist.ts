export const usePlaylist = defineStore("playlist", () => {
  const audio = useAudio();
  const index = ref(0);
  const queue = ref<any[]>([]);
  const currentTrack = computed(() => queue.value?.[index.value] || null);
  const length = computed(() => queue.value.length);
  const finished = ref(false);
  const lyrics = ref<any>({
    activeIndex: -1,
    activeLine: null,
    progress: 0,
    loaded: false,
    synced: null,
    plain: null,
    processed: null,
  });

  watch(
    () => currentTrack.value,
    async (val) => {
      lyrics.value.active = -1;
      lyrics.value.progress = 0;
      lyrics.value.loaded = false;
      lyrics.value.synced = null;
      lyrics.value.plain = null;
      lyrics.value.processed = null;

      try {
        const {
          title,
          user: { handle },
        } = val;

        const data = await fetch(
          `https://lrclib.net/api/search?q=${handle}+${title.replaceAll(
            " ",
            "+"
          )}`
        ).then((res) => res.json());

        if (data[0] && data[0].name === title) {
          lyrics.value.synced = data[0].syncedLyrics;
          lyrics.value.plain = data[0].plainLyrics;
          lyrics.value.processed = parseSyncedLyrics(data[0].syncedLyrics);
        }

        lyrics.value.loaded = true;
      } catch (e) {}
    }
  );

  async function set(items: any[]) {
    finished.value = false;
    index.value = 0;
    queue.value = items;
  }

  function previous() {
    index.value = Math.max(0, index.value - 1);
  }

  function next() {
    index.value = Math.min(index.value + 1, queue.value.length - 1);
  }

  watch(
    () => audio.player.progress,
    (val) => {
      if (val === 1) {
        if (index.value === length.value - 1) {
          finished.value = true;
          return;
        }

        next();
        return;
      }

      if (lyrics.value.processed) {
        const position = audio.player.duration * audio.player.progress;

        lyrics.value.processed.forEach((lyric: any, i: number) => {
          if (
            lyric.time <= position &&
            lyrics.value.processed[i + 1]?.time > position
          ) {
            if (lyrics.value.activeIndex !== i) {
              lyrics.value.activeIndex = i;
              lyrics.value.activeLine = lyric.text;
            }
            return;
          }
        });

        const current = lyrics.value.processed[lyrics.value.activeIndex];
        const progress =
          (position - current?.time) /
          (lyrics.value.processed[lyrics.value.activeIndex + 1]?.time -
            lyrics.value.processed[lyrics.value.activeIndex]?.time);
        if (isNaN(progress)) return;
        lyrics.value.progress = clamp(progress);
      }

      if (finished.value) finished.value = false;
    }
  );

  navigator.mediaSession?.setActionHandler("previoustrack", function () {
    previous();
  });

  navigator.mediaSession?.setActionHandler("nexttrack", function () {
    next();
  });

  navigator.mediaSession?.setActionHandler("pause", function () {
    audio.pause();
  });

  navigator.mediaSession?.setActionHandler("play", function () {
    audio.play();
  });

  return {
    currentTrack,
    index,
    queue,
    set,
    next,
    previous,
    length,
    finished,
    lyrics,
  };
});
