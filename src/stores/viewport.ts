import { defineStore, acceptHMRUpdate } from "pinia";
import { createCssVariable } from "../util/styles";

export const useViewport = defineStore("viewport", () => {
  const width = ref(1);
  const height = ref(1);
  const aspectRatio = computed(() => width.value / height.value)
  const dpr = ref();
  const touch = ref();
  const isMobile = computed(() => touch.value)
  const clicked = ref([-1, -1])
  const mouse = ref([-1, -1])
  const popoverVisible = ref(false)
  const orientation = computed(() => {
    if (width.value >= height.value) return 'LANDSCAPE'
    return 'PORTRAIT'
  })

  const artboard = computed(() => {
    return {
      width: width.value,
      height: height.value,
      dpr: dpr.value,
    }
  })

  async function set() {
    await nextTick()
    width.value = window.innerWidth;
    height.value = window.innerHeight;
    dpr.value = window.devicePixelRatio;
    touch.value = "ontouchstart" in window;
    createCssVariable('--viewport-width', `${width.value}px`)
    createCssVariable('--viewport-height', `${height.value}px`)
  }

  set()

  window.addEventListener("resize", set)

  document.body.addEventListener('click', e => {
    clicked.value = [e.clientX, e.clientY]
  })

  document.body.addEventListener('mousemove', e => {
    mouse.value = [e.clientX, e.clientY]
  })

  return {
    width,
    height,
    dpr,
    aspectRatio,
    touch,
    isMobile,
    clicked,
    mouse,
    popoverVisible,
    artboard,
    orientation
  };
});

if (
  (import.meta as any)?.hot?.accept &&
  typeof acceptHMRUpdate !== "undefined"
) {
  (import.meta as any).hot.accept(
    acceptHMRUpdate?.(useViewport, (import.meta as any).hot)
  );
}
