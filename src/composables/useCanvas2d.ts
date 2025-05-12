import {
  onMounted,
  ref,
  computed,
  watch,
  type Ref,
  onUnmounted,
  nextTick,
  type Reactive
} from "vue";
import type { ZoomTransform } from "d3-zoom";

type Artboard = {
  width: number;
  height: number;
  dpr: number;
};

export type CanvasState = {
  ctx: CanvasRenderingContext2D | null;
  canvas: HTMLCanvasElement | null;
  width: number;
  height: number;
  center: {
    x: number;
    y: number;
  };
  dpr: number;
  mouse: [number, number];
};

export function useCanvas2d(
  canvas: Ref<HTMLCanvasElement | null>,
  artboard: Ref | Reactive<Artboard>,
  transform?: Ref | Reactive<ZoomTransform>
) {
  const ctx = ref<CanvasRenderingContext2D | null>(null);
  const mouse = ref<[number, number] | null>(null);
  const $artboard = toReactive(artboard)
  const $transform = toReactive(transform || { x: 0, y: 0, k: 1 });

  watch(
    () => $artboard,
    async () => {
      await nextTick();
      resize();
    },
    { deep: true }
  );

  const state = computed(() => {
    const { width, height, dpr } = $artboard;

    return {
      ctx: ctx.value,
      canvas: canvas.value,
      width,
      height,
      center: {
        x: width / 2,
        y: height / 2,
      },
      dpr: dpr,
      mouse: mouse.value,
    };
  });

  function resize() {
    if (!canvas.value) return;

    const { width, height, dpr } = $artboard;

    canvas.value.width = width * dpr;
    canvas.value.height = height * dpr;
    canvas.value.style.width = width + "px";
    canvas.value.style.height = height + "px";
  }

  function clear() {
    if (!canvas.value || !ctx.value) return;
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
  }

  function normalize() {
    const { dpr } = $artboard;
    const { x, y, k } = $transform 
    ctx.value?.resetTransform();
    ctx.value?.scale(dpr, dpr);
    if (x || y || k) {
      const t = $transform
      ctx.value?.translate(t.x, t.y);
      ctx.value?.scale(t.k, t.k);
    }
  }

  function draw(fn: (s: CanvasRenderingContext2D) => void) {
    if (!ctx.value) return;
    ctx.value.save();
    fn(ctx.value as CanvasRenderingContext2D);
    ctx.value.restore();
  }

  type CircleProps = {
    x: number;
    y: number;
    radius: number;
    lineWidth?: number;
    strokeStyle?: string;
    fillStyle?: string;
  };

  function circle({
    x,
    y,
    radius,
    lineWidth,
    strokeStyle,
    fillStyle,
  }: CircleProps) {
    if (!ctx.value) return;
    if (lineWidth) ctx.value.lineWidth = lineWidth;
    if (strokeStyle) ctx.value.strokeStyle = strokeStyle;
    if (fillStyle) ctx.value.fillStyle = fillStyle;
    ctx.value.beginPath();
    ctx.value.arc(x, y, radius, 0, Math.PI * 2);
    ctx.value.closePath();
    if ((!lineWidth && !strokeStyle) || fillStyle) ctx.value.fill();
    if (strokeStyle || lineWidth) ctx.value.stroke();
  }

  function handleMouseMove(e: MouseEvent) {
    if (!canvas.value) return;

    const rect = canvas.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if ($transform) {
      const t = $transform;
      mouse.value = [(x - t.x) / t.k, (y - t.y) / t.k];
    } else {
      mouse.value = [x, y];
    }
  }

  function handleMouseLeave() {
    mouse.value = null
  }

  onMounted(() => {
    resize();
    ctx.value = canvas.value?.getContext("2d") || null;

    if (canvas.value) {
      canvas.value.addEventListener("mousemove", handleMouseMove);
      canvas.value.addEventListener("mouseleave", handleMouseLeave);
    }
  });

  onUnmounted(() => {
    if (canvas.value) {
      canvas.value.removeEventListener("mousemove", handleMouseMove);
      canvas.value.removeEventListener("mouseleave", handleMouseLeave);
    }
  });

  return {
    state,
    ctx,
    draw,
    clear,
    normalize,
    circle,
    mouse,
  };
}
