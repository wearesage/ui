export const usePlaylist = defineStore('playlist', () => {
  const audio = useAudio();
  const index = ref(0);
  const queue = ref<any[]>([]);
  const currentTrack = computed(() => queue.value?.[index.value] || null);
  const length = computed(() => queue.value.length);
  const finished = ref(false);

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
    val => {
      if (val === 1) {
        if (index.value === length.value - 1) {
          finished.value = true;
          return;
        }

        next();
        return;
      }

      if (finished.value) finished.value = false;
    }
  );

  navigator.mediaSession?.setActionHandler('previoustrack', function () {
    previous();
  });

  navigator.mediaSession?.setActionHandler('nexttrack', function () {
    next();
  });

  navigator.mediaSession?.setActionHandler('pause', function () {
    audio.pause();
  });

  navigator.mediaSession?.setActionHandler('play', function () {
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
  };
});
