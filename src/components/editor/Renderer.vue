<template>
  <canvas
    ref="canvas"
    :width="size.width"
    :height="size.height" />
</template>

<script setup lang="ts">
import { v4 } from 'uuid';

const props = defineProps<{
  sketch: Sketch;
}>();

const raf = useRAF();
const canvas = ref();
const id = ref(v4());
const instance: ShallowRef<Renderer | null> = shallowRef(null);
const size = ref({ width: 0, height: 0 });

watch(
  () => props.sketch,
  val => {
    instance.value?.update(val);
  },
  { deep: true }
);

async function build() {
  raf.remove(id.value);

  await nextTick();

  if (!canvas.value) return;

  instance.value?.destroy();

  instance.value = new Renderer({
    canvas: canvas.value as HTMLCanvasElement,
    sketch: props.sketch,
  });

  raf.add(
    {
      tick: ({ now }: any) => {
        instance.value?.render(now);
      },
    },
    id.value
  );
}

onMounted(() => {
  createResizeObserver(canvas.value, async ({ width, height }) => {
    const dpr = 1;
    size.value = { width: width * dpr, height: height * dpr };
    await nextTick();
    instance.value ? instance.value.resize({ width, height }) : build();
  });
});

onBeforeUnmount(() => {
  raf.remove(id.value);
  instance.value?.destroy();
});
</script>
