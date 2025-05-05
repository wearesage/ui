<template>
  <div
    class="glsl-editor"
    ref="container">
    <Transition name="fade">
      <span
        v-if="error && !tempHideError"
        class="shader-error"
        :style="{ transform }">
        {{ error?.message }}
      </span>
    </Transition>
    <Transition name="fade">
      <div
        class="shader-explanation"
        :style="{ transform: explanationTransform }"
        v-html="explanation"
        v-if="explanation" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    shader: string;
    rawShader?: string;
    uniforms: any;
    error?: null | { line: number; message: string };
  }>(),
  {
    uniforms: [],
  }
);

const emit = defineEmits(['update', 'select']);

const container = ref();
const instance = shallowRef();
const tempHideError = ref(false);
const selected = ref('');
const viewport = useViewport();
const explanation = ref(null);
const keys = ref(props.uniforms.map(v => v[0]));

watch(
  () => viewport.selectionBox,
  () => {
    explanation.value = null;
  }
);

const transform = computed(() => {
  return `translateY(${((props as any).error?.line - 1) * 100}%) translateY(4px)`;
});

const explanationTransform = computed(() => {
  return `translateY(${viewport.selectionBox.y + viewport.selectionBox.height + 30}px)`;
});

watch(
  () => props.uniforms,
  (val) => {
    if (val.length !== keys.value.length) {
      instance.value?.destroy?.();
      build();
      keys.value = val.map(v => v[0])
    }
  },
  {
    deep: true
  }
);

watch(
  () => props.shader,
  val => {
    if (val === instance.value._value) return;
    instance.value?.destroy?.();
    build();
  }
);

watch(
  () => props.error,
  val => {
    if (tempHideError.value) return;
    instance.value?.error?.(val);
  },
  { immediate: true }
);

watch(
  () => tempHideError.value,
  val => {
    instance.value.error(val ? null : props.error);
  }
);

// let selectionTimeout: any;

// watch(
//   () => selected.value,
//   val => {
//     clearTimeout(selectionTimeout);

//     if (!val.trim().length) return;

//     selectionTimeout = setTimeout(() => {
//       if (val.trim().length) ask(val.trim());
//     }, 350);
//   }
// );

// async function ask(text: string) {
//   try {
//     const { data } = await post('robot/explain', { shader: props.shader, selection: text, uniforms: props.uniforms });
//     explanation.value = data;
//   } catch (e) {
//     console.log(e);
//   }
// }

let updateTimeout: any;

function build() {
  instance.value = new Editor({
    doc: props.shader,
    parent: container.value,
    uniforms: props.uniforms,
    onSelect(e) {
      selected.value = e;
    },
    onUpdate(e) {
      tempHideError.value = true;
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        tempHideError.value = false;
      }, 350);
      emit('update', e);
    },
  });
}

onMounted(() => {
  build();
});

onUnmounted(() => {
  // instance.value?.destroy?.();
});
</script>

<style lang="scss">
.glsl-editor {
  @include position(absolute, 0 null 0 0);
  padding-left: var(--nav-width);
  padding-bottom: calc(var(--post-size) / 2 + 3.5rem);
  transition: var(--base-transition);
  font-size: 0.8rem;
}

.cm-editor {
  @include size(100%);
  overflow-y: auto;
  width: var(--editor-width);
  background: linear-gradient(to top right, darken(rgb(10, 10, 18), 2%), lighten(rgb(10, 10, 18), 2%));

  * {
    @include scroll-bar;

    &::selection {
      background: lighten(rgb(10, 10, 18), 10%) !important;
    }
  }
}

.cm-gutters {
  background: lighten(rgb(10, 10, 18), 2%) !important;
  color: rgba(white, 0.5) !important;
  font-weight: 100 !important;
  font-size: 0.7rem;
  line-height: 1.25rem;
  width: 1.5rem;
}

.cm-line {
  transition: var(--hover-transition) !important;
  height: 1.25rem !important;
  border: 1px solid rgba($white, 0) !important;
}

.cm-activeLine {
  background-color: rgba($purple, 0.05) !important;
  border: 1px solid rgba($purple, 0.1) !important;
}

.cm-line-error {
  border-color: $red !important;
}

.shader-error {
  @include position(absolute, 0 0 null null, 100);
  height: 1.25rem;
  line-height: 1.25rem;
  padding: 0 0.5rem;
  display: flex;
  background: $red;
}

@include mobile {
  .glsl-editor {
    bottom: calc(25vh + var(--nav-width));
    z-index: 100;
    height: 25vh;
    width: 100%;
    top: 40vh;
    padding: 0;
  }
  
  .glsl-editor, .cm-editor {
    left: 0;
    padding-left: 0;
    right: 0;
    width: 100%;
  }

  .cm-editor {
    @include size(100%);
    overflow: auto;
  }
}
</style>

<style lang="scss">
.shader-explanation {
  @include position(absolute, 0 1rem null calc(2.5rem + var(--nav-width)), 100);
  display: block;
  will-change: transform, opacity;
  font-size: 1rem;
  line-height: 1.2rem;
  padding: 1rem;
  border-top: 1px solid $white;
  background: linear-gradient(to top right, lighten($black, 5%), lighten($black, 20%));
  color: $white;
  border-radius: 1rem;
  box-shadow: var(--box-shadow);

  strong {
    color: $yellow !important;
  }
}
</style>
