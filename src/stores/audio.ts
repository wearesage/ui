import { type AUDIO_SOURCE, AUDIO_SOURCES } from '../constants/audio-sources';
import { pause as wait } from '@util';

export const definitions: AudioStreamDefinitions = {
  volume: [
    [
      [2, 0.1, 0.25],
      [4, 0.1, 1.25],
      [2, 0.1, 1],
    ],
    5,
  ],
  stream: [
    [
      [0.75, 0.08, 2.5],
      [0.5, 0.08, 1.5],
      [0.6, 0.1, 1],
    ],
    120,
  ],
};

export const useAudio = defineStore('audio', () => {
  const raf = useRAF();
  const element: Ref<HTMLAudioElement | null> = ref(null);
  const analyser = shallowRef();
  const source: Ref<AUDIO_SOURCE | null> = ref(null);
  const initialized = ref(false);
  const stream = ref(0);
  const volume = ref(1);
  const player = ref({
    playing: false,
    duration: 0,
    elapsed: 0,
    progress: 0,
    loading: false,
    ended: false,
    file: null,
    src: '',
  });

  watch(
    () => player.value.src,
    val => {
      if (!element.value) return;

      player.value.playing = false;
      player.value.duration = 0;
      player.value.elapsed = 0;
      player.value.progress = 0;

      if (!val?.length) return;

      player.value.loading = true;
      player.value.ended = false;
      element.value.src = val;
      element.value.play();

      const now = window.performance.now();

      element.value.addEventListener(
        'play',
        async () => {
          const elapsed = window.performance.now() - now;
          await wait(Math.max(500 - elapsed, 0));
          player.value.loading = false;
        },
        { once: true }
      );
    }
  );

  function initializeAudioElement() {
    element.value?.remove();
    element.value = document.createElement('audio') as HTMLAudioElement;
    element.value.crossOrigin = 'anonymous';
    element.value.src = player.value.src;
    element.value.addEventListener('ended', () => {
      player.value.ended = true;
    });
  }

  function cleanup() {
    raf.remove('audio');
    volume.value = 1;
    stream.value = 0;
    player.value.src = '';
    player.value.playing = false;
    player.value.duration = 0;
    player.value.elapsed = 0;
    player.value.file = null;
    player.value.progress = 0;
    analyser.value?.destroy();
    element.value?.pause();
    element.value = null;
    initialized.value = false;
  }

  function loop() {
    raf.remove('audio');

    raf.add(
      {
        tick({ now }: { now: DOMHighResTimeStamp }) {
          const next = analyser.value.tick({ frameRate: Math.floor(raf.frameRate as number) });

          if (source.value === AUDIO_SOURCES.MICROPHONE) {
            volume.value = Number(next.volume.toFixed(3));
            stream.value = Number(next.stream.toFixed(3));
            return;
          }

          const { currentTime, duration, paused } = element.value as HTMLAudioElement;

          player.value.progress = clamp(currentTime / duration);
          player.value.elapsed = currentTime;
          player.value.duration = duration;
          player.value.playing = !paused;
          volume.value = paused ? 1 : Number(next.volume.toFixed(3));
          stream.value = paused ? now / 1000 : Number(next.stream.toFixed(3));
        },
      } as any, // fuck you
      'audio'
    );
  }

  function initialize(src: AUDIO_SOURCE) {
    cleanup();

    source.value = src;
    analyser.value = new AudioAnalyser({ definitions });

    switch (source.value) {
      case AUDIO_SOURCES.MICROPHONE:
        analyser.value.initialize({ microphone: true });
        break;
      default:
        initializeAudioElement();
        analyser.value.initialize({ element: element.value });
    }

    loop();

    initialized.value = true;
  }

  function play() {
    try {
      (element.value as HTMLAudioElement)?.play();
    } catch (e) {}
  }

  function pause() {
    (element.value as HTMLAudioElement)?.pause();
  }

  function seek(position: number) {
    (element.value as HTMLAudioElement).currentTime = position;
  }

  return {
    cleanup,
    initialize,
    initialized,
    volume,
    stream,
    player,
    play,
    pause,
    seek,
  };
});

if ((import.meta as any)?.hot?.accept && typeof acceptHMRUpdate !== 'undefined') {
  (import.meta as any).hot.accept(acceptHMRUpdate?.(useAudio, (import.meta as any).hot));
}
