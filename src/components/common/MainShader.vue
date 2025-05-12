<template>
  <div
    v-bind="$attrs"
    class="shader"
    :class="{ visible: !error }">
    <canvas ref="canvas" />
  </div>
</template>

<script setup lang="ts">
let INITIALIZATION_RETRIES = 0;

const props = withDefaults(
  defineProps<{
    shader?: string;
    vertexShader?: string;
    zoomMultiplier?: number;
    uniforms?: UniformTuple[];
    dpr?: number;
    debug?: boolean;
    volume?: number;
    stream?: number;
    width?: number | null;
    height?: number | null;
    autoSize?: boolean;
    shaderpad?: boolean;
    animate?: boolean;
    tweening?: boolean;
    tweenProgress?: number;
    tweeningUniforms?: any[];
    buffers?: any;
  }>(),
  {
    dpr: 1,
    animate: false,
    autoSize: true,
    width: null,
    height: null,
    zoomMultiplier: 1
  }
);

const emits = defineEmits(['ctxlost', 'error']);

const id = ref(`${Math.random() * 10000000000}`);
const raf = useRAF();
const canvas = ref();
const ctx: any = shallowRef(null);
const program: any = shallowRef(null);
const size = ref({ width: props.width, height: props.height });
const tweenProgress: any = computed(() => props.tweenProgress);
const tweeningUniforms: any = computed(() => props.tweeningUniforms || []);
const volume: any = computed(() => (typeof props.volume === 'number' ? props.volume : 1));
const stream: any = computed(() => (typeof props.stream === 'number' ? props.stream : 0));
const externalFragmentShader: any = computed(() => props.shader || DEFAULT_FRAGMENT_SHADER);
const externalVertexShader: any = computed(() => props.vertexShader || DEFAULT_VERTEX_SHADER);
const internalUniforms: any = ref(INTERNAL_UNIFORMS());
const externalUniforms: any = computed(() => (props.uniforms?.length ? props.uniforms : DEFAULT_UNIFORMS()));
const error: any = ref(null);
const tweenUniforms: any = computed(() =>
  externalUniforms.value.reduce((acc: any, uniform: any) => {
    if (uniform[1] === 1) {
      acc.push(Uniform.create(`${uniform[0]}Tween`, 1), Uniform.create(`${uniform[0]}TweenProgress`, 0));
    }
    return acc;
  }, [])
);
const uniforms: any = computed(() => [...internalUniforms.value, ...externalUniforms.value, ...tweenUniforms.value]);
const uniformDeclarations: any = computed(() =>
  uniforms.value.reduce((acc: any, [name, type]: any) => {
    acc += `uniform ${(SHADER_TYPE_MAP as any)[type]} ${name};\n`;
    return acc;
  }, '')
);

const internalFragmentShader = computed(
  () => `${DEFAULT_DEFS.join('\n')}
${uniformDeclarations.value}
${GLSL_UTILS}
${externalFragmentShader.value}`
);

const lineOffset = computed(() => {
  const internal = internalFragmentShader.value.split('\n');
  const external = externalFragmentShader.value.split('\n');
  return internal.length - external.length;
});

// defineExpose({ canvas, internalFragmentShader });

const internalVertexShader = computed(() => externalVertexShader.value);

watch(
  () => error.value,
  val => {
    if (!val) return emits('error', null);
    const [raw] = val
      .split('\n')
      .filter((v: string) => v !== '\x00')
      .map((v: string) => v.replace('ERROR: ', ''));
    const split = raw.split(':');
    const line = parseInt(split[1], 10) - lineOffset.value;
    const message = split[3].trim();
    emits('error', { line, message });
  },
  { immediate: true }
);

watch(
  () => [props.width, props.height],
  ([w, h]) => {
    if (!canvas.value || !ctx.value) return;
    canvas.value.width = w;
    canvas.value.height = h;
    ctx.value.viewport(0, 0, canvas.value.width, canvas.value.height);
    if (!props.animate) render();
  }
);

watch(
  () => props.animate,
  val => {
    raf.remove(id.value);

    if (val) {
      raf.add(
        {
          tick() {
            render();
          },
        },
        id.value
      );
    }
  }
);

watch(
  () => [props.shader, props.uniforms],
  (a, b) => {
    const [shader, uniforms] = a as [string, UniformTuple[]];
    const [oldShader, oldUniforms] = b as [string, UniformTuple[]];
    if (shader !== oldShader) return initialize();
    if (uniforms?.length !== oldUniforms?.length) return initialize();
    if (!uniforms?.every((v, i) => oldUniforms?.[i]?.[0] === v[0])) return initialize();
  }
);

function initialize() {
  raf.remove(id.value);

  program.value?.cleanup?.();

  if (!canvas.value) return;

  canvas.value.width = props.width;
  canvas.value.height = props.height;

  ctx.value = createWebGL2Context(canvas.value);

  program.value = createWebGL2App({
    ctx: ctx.value,
    fragmentShader: internalFragmentShader.value,
    vertexShader: internalVertexShader.value,
    uniforms: uniforms.value,
    onError(err: any) {
      error.value = err;
    },
    onSuccess() {
      error.value = null;
    },
  });

  if (!program.value) return;

  if (props.animate) {
    raf.add(
      {
        tick() {
          render();
        },
      },
      id.value
    );

    return;
  }

  render();
}

function render() {
  if (!program.value) return initialize();

  try {
    program.value.uniforms.resolution.set([size.value.width, size.value.height]);
    program.value.uniforms.time.set(Number((window.performance.now() / 1000).toFixed(3)));
    program.value.uniforms.stream.set(stream.value);
    program.value.uniforms.volume.set(volume.value);

    const uniforms = externalUniforms.value;

    uniforms.forEach((uniform: any) => {
      if (uniform[0] === 'zoom') {
        program.value.uniforms[uniform[0]].set(uniform[2] / props.zoomMultiplier);
      } else {
        program.value.uniforms[uniform[0]].set(uniform[2]);
      }

      if (uniform[1] !== 1) return;

      if (tweeningUniforms.value.indexOf(uniform[0]) !== -1) {
        program.value.uniforms[`${uniform[0]}Tween`].set(true);
        program.value.uniforms[`${uniform[0]}TweenProgress`].set(tweenProgress.value);
      } else {
        program.value.uniforms[`${uniform[0]}Tween`].set(false);
      }
    });

    program.value.render();

    INITIALIZATION_RETRIES = 0;
  } catch (e) {
    INITIALIZATION_RETRIES++;

    if (INITIALIZATION_RETRIES < 3) {
      initialize();
      if (!props.animate) render();
    }
  }
}

onMounted(() => initialize());

onBeforeUnmount(() => {
  raf.remove(id.value);
  program.value?.cleanup?.();
});

function setSize([w, h]) {
  size.value = {
    width: w,
    height: h,
  };

  console.log(w, h)

  canvas.value.width = w;
  canvas.value.height = h;
  ctx.value.viewport(0, 0, w, h);
}

defineExpose({
  ctx() {
    return ctx.value || null;
  },

  canvas() {
    return canvas.value || null;
  },

  setSize,
});
</script>

<style lang="scss" scoped>
.shader {
  @include size(auto, 100%);
  @include position(absolute, 0 0 null null, 1);
  opacity: 0;

  &.visible {
    opacity: 1;
  }
}

canvas {
  @include size(auto, 100%);
  @include position(absolute, 0 0 0 null);
  display: block;
}
</style>
