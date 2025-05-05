export const useViewport = defineStore('viewport', () => {
  const width: Ref<number> = ref(window.innerWidth);
  const height: Ref<number> = ref(window.innerHeight);
  const visibility = useDocumentVisibility();
  const orientation = computed(() => {
    if (width.value > height.value) return 'LANDSCAPE';
    return 'PORTRAIT';
  });
  const mobile = computed(() => {
    if (orientation.value === 'PORTRAIT' && width.value <= 500) return true;
    if (orientation.value === 'LANDSCAPE' && height.value <= 500) return true;
    return false;
  });
  const mobileLandscape = computed(() => mobile.value && orientation.value === 'LANDSCAPE');
  const mobilePortrait = computed(() => mobile.value && orientation.value === 'PORTRAIT');
  const dpr: Ref<number> = ref(window.devicePixelRatio);
  const limitedDpr = computed(() => Math.min(2, dpr.value));
  const fullScreenAvailable = ref(detectFullscreen());
  const fullScreen = ref(!!document.fullscreenElement);
  const userHasInteracted = ref(false);
  const hideUI = ref(false);
  const touch = ref('ontouchstart' in window);
  const safari = ref(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  const pwa = ref(navigator?.standalone || window.matchMedia('(display-mode: standalone)').matches);

  if (pwa.value) document.body.classList.add('pwa');

  const pointer = ref([
    [0, 0],
    [0, 0],
  ]);

  const selectionBox = computed(() => {
    const [x1, y1] = pointer.value[0];
    const [x2, y2] = pointer.value[1];
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const width = Math.max(x1, x2) - x;
    const height = Math.max(y1, y2) - y;
    return {
      x,
      y,
      width,
      height,
    };
  });

  function update() {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
    dpr.value = window.devicePixelRatio;
    touch.value = 'ontouchstart' in window;
  }

  function onFullscreen() {
    fullScreen.value = !!document.fullscreenElement;
  }

  function initialize() {
    document.addEventListener('fullscreenchange', onFullscreen);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
  }

  return {
    width,
    height,
    update,
    mobile,
    orientation,
    mobileLandscape,
    mobilePortrait,
    dpr,
    limitedDpr,
    initialize,
    fullScreen,
    fullScreenAvailable,
    userHasInteracted,
    hideUI,
    selectionBox,
    touch,
    visibility,
    pwa,
    safari,
    $reset() {
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('resize', update);
    },
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useViewport, import.meta.hot));
