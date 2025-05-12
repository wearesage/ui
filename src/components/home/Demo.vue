<template>
  <aside class="demo">
    <transition name="fade">
      <Shader
        v-if="sketch && !viewport.mobile"
        :shader="sketch.shader"
        :uniforms="uniforms"
        :dpr="dpr"
        :animate="false" />
    </transition>
  </aside>

  <div
    class="demo-container"
    ref="container">
    <Button class="prev" @click="prev">
      <ChevronLeft />
    </button>
    <Shader
      v-if="editor?.activeSketch"
      class="two"
      :class="{ opaque: audio.player.playing }"
      :shader="editor.shader"
      :uniforms="editor.uniforms"
      :stream="visualizer.stream"
      :volume="visualizer.volume"
      :dpr="dpr"
      :tween="editor.tweening"
      :tweenProgress="editor.tweenProgress"
      :tweeningUniforms="editor.tweeningUniforms"
      :animate="true" />

    <transition name="fade">
      <div
        class="design"
        v-if="shaders?.published?.length">
        <p><slot /></p>
        <p>
          design
          <strong>#{{ selected + 1 }}</strong>
          <small>of</small>
          <strong>{{ shaders?.published?.length }}</strong>
        </p>
      </div>
    </transition>
    <Button class="next" @click="next">
      <ChevronRight />
    </Button>
  </div>
</template>

<script setup lang="ts">
import ChevronLeft from '../../assets/icons/chevron-left.svg'
import ChevronRight from '../../assets/icons/chevron-right.svg'

const visualizer = useVisualizer();
const viewport = useViewport();
const container = ref(null);
const audio = useAudio();
const editor = useEditor();
const shaders = useShaders();
const sketch = ref();
const selected = ref();
const dpr = computed(() => viewport.limitedDpr);
const uniforms = computed(() => {
  const data = clone(sketch?.value?.variants?.[sketch?.value?.variants?.length === 1 ? 0 : 1]);

  data?.forEach?.(datum => {
    if (datum[0] === 'ballSize' || datum[0] === 'contrast') return;

    if (datum[0] === 'zoom') {
      datum[2] /= 4;
    }

    else if (datum[0] === 'sides') {
      datum[2] = 2;
    } 

    if (datum[0] === 'center') {
      datum[2] += datum[2] / 5;
    }
  });

  return data;
});

watch(
  () => shaders.published,
  val => {
    if (val.length) {
      sketch.value = sample(val);
      selected.value = shaders.published.indexOf(sketch.value);
      editor.selectSketch(sketch.value);
    }
  },
  {
    immediate: true,
  }
);

function prev () {
  selected.value = Math.max(0, selected.value - 1)
  sketch.value = shaders.published[selected.value]
  editor.selectSketch(sketch.value);
}

function next () {
  selected.value = Math.min(selected.value + 1, shaders.published.length - 1)
  sketch.value = shaders.published[selected.value]
  editor.selectSketch(sketch.value);
}

editor.shuffleVariants = true;
</script>

<style lang="scss" scoped>
$pad: 20vh;
$size: 30vw;

aside {
  @include size(100vw, 100%);
  position: fixed;

  :deep(canvas) {
    opacity: 0.1;
  }
}

.demo-container {
  @include size($size);
  margin-right: env(safe-area-inset-right);
  position: relative;
}

.two {
  @include size($size);
  position: relative;
  z-index: 5;
  flex-shrink: 0;

  @include mobile-portrait {
    @include size(100vw, 50vh);
    border-radius: 0 !important;
  }

  transition: var(--base-transition);

  &.opaque {
    opacity: 1;
  }

  :deep(canvas) {
    border-radius: 3rem;
    border-top-right-radius: 10rem;
    border-bottom-left-radius: 10rem;
    overflow: hidden;
    z-index: 10;

    @include mobile-portrait {
      border-radius: 0rem !important;

      &:before,
      &:after {
        border-radius: 3rem !important;
      }
    }

    @include mobile-landscape {
    border-radius: 1rem !important;
  }
  }

  &:after {
    @include position(absolute, 0.2rem null null 0.2rem, 0);
    @include size(calc(100%));
    transform: translateX(0.25rem) translateY(0.25rem);
    border-top-right-radius: 4em;
    border-bottom-left-radius: 4rem;
    border-bottom-right-radius: 2.5rem;
    border-top-left-radius: 3rem;
    transform-origin: center center;
    display: flex;
    transition: var(--hover-transition);
    content: '';
    background: linear-gradient(to top left, rgba(lighten($pink, 0%), .2) 0%, rgba($purple, 1) 100%);

    @include mobile-portrait {
      border-radius: 0 !important;
      display: none;
    }
    @include mobile-landscape {
    border-radius: 1rem !important;
  }
  }
}

.two :deep(canvas) {
  z-index: 100;
  position: absolute;
}

.design {
  @include position(absolute, auto null 0 50%, 20);
  @include size(100%, auto);
  @include flex(end, end, row);
  margin-top: auto;
  gap: 0.5rem;
  background: linear-gradient(to top, lighten($black, 0%),transparent);
  padding: 10rem 1rem 1rem 5rem;
  // border-top-right-radius: 9rem;
  border-bottom-right-radius: 2rem;
  border-bottom-left-radius: 10rem;
  transform: translateX(-50%);
  color: rgba($white, 0.75);
  font-size: 1rem;

  @include mobile-landscape {
    border-radius: 1rem !important;
  }

  strong {
    font-size: 1.5rem;
    font-weight: 900;
    color: $pink;
  }

  strong ~ strong {
    color: $white;
    font-weight: 100;
  }

  p:first-child {
    line-height: 0;

    strong {
      line-height: 0 !important;
    }
  }

  p + p {
    @include flex(end, end, column);
    line-height: 1;
  }

  @include mobile-portrait {
    @include size(100vw, 50vh);
    @include flex(end, space-between, row);
    gap: 0;
    line-height: 0;
    padding: 0;
    margin: 0 auto;
    border-radius: 0;
    border-bottom-right-radius: 0rem;
    border-bottom-left-radius: 0rem;
    left: 0;
    right: 0;
    padding: 1rem;
    transform: none;

    &,
    p,
    strong {
      padding: 0;
      line-height: 0;
    }

    p:first-of-type {
      padding-left: 1rem;
      line-height: 1;

      strong {
        line-height: 1;
      }
    }

    p ~ p {
      line-height: 3;
      padding: 1.5rem 0.75rem;
    }
  }
}

.demo-container {
  position: relative;

  @include mobile-portrait {
    @include size(100vw, 50vh);
    display: block;
    padding: 0;
    margin: 0 auto;
  }
}

.demo {
  pointer-events: none;

  @include mobile-portrait {
    @include size(100vw, 50vh);
    display: flex;
    margin-top: auto;
  }
}

.prev {
  @include position(absolute, 50% null null 1rem, 120);
  transform: translateY(-50%);
}

.next {
  @include position(absolute, 50% 1rem null null, 120);
  transform: translateY(-50%);
}


.prev, .next {
  background: transparent !important;

  &:active {
    transform: translateY(-50%) scale(.9);
  }
}

</style>
