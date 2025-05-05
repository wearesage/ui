<template>
  <main :class="{ pwa: viewport.pwa }">
    <div class="row">
      <div
        v-if="shaders.published.length"
        class="shaders">
        <CloseButton :to="targetPath" />

        <Shader
          v-for="(sketch, i) in chunks[index]"
          :class="{ hidden: !sketch?._id }"
          :id="sketch?._id || i"
          :key="sketch?._id || i"
          @click="e => onClick(e, sketch)"
          @contextmenu="e => onContextMenu(e, sketch)"
          @pointerdown="e => onPointerDown(e, sketch)"
          @pointerup="e => onPointerUp(e, sketch)"
          :shader="sketch?.shader || `void main () { gl_FragColor = vec4(0, 0, 0, 1); }`"
          :animate="true"
          :dpr="viewport.limitedDpr"
          :volume="visualizer.volume"
          :stream="visualizer.stream"
          :uniforms="sketch?.variants?.[0]" />

        <nav>
          <Button
            background="var(--black)"
            icon="chevron-left"
            class="prev"
            :disabled="index === 0"
            @click="prev" />
          <ul>
            <li
              class="dot"
              v-for="(chunk, i) in chunks"
              :class="{ active: index === i }"
              :key="i"
              @click="() => (index = i)"
              >{{ i + 1 }}</li
            >
          </ul>
          <Button
            background="var(--black)"
            icon="chevron-right"
            class="next"
            @click="next"
            :disabled="lastPage" />
        </nav>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const navigation = useNavigation();
const editor = useEditor();
const viewport = useViewport();
const router = useRouter();
const visualizer = useVisualizer();
const tooltip = useTooltip();
const shaders = useShaders();
const total = 8;
const index = ref(storage.get('5HT.DESIGN_INDEX') || 0);
const lastPage = computed(() => {
  return !!chunks.value[index.value].find(v => v._id === shaders.published[shaders.published.length - 1]._id);
});
const targetPath = computed(() => {
  if (navigation.lastPage?.path === '/visualizer' || navigation.lastPage?.path === '/editor') return navigation.lastPage.path;
  return '/visualizer';
});
const chunks = computed(() => {
  const chunks = chunk(shaders.published, total);
  if (chunks[chunks.length - 1].length === total) return chunks;

  let i = chunks[chunks.length - 1].length;

  while (i < total) {
    chunks[chunks.length - 1].push({
      shader: 'void main () { gl_FragColor(.8, .2, .6, 1); }',
      variants: [[]],
    });

    i++;
  }

  return chunks;
});

function onClick(e, sketch) {
  if (viewport.touch) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return
  }

  select(sketch)
}

useKeyboardShortcuts();
useKeyboard('ArrowLeft', prev);
useKeyboard('ArrowRight', next);

watch(
  () => index.value,
  val => storage.set('5HT.DESIGN_INDEX', val)
);

function prev() {
  index.value = Math.max(0, index.value - 1);
}

function next() {
  index.value = Math.min(index.value + 1, chunks.value.length - 1);
}

function select(sketch: any) {
  editor.selectSketch(sketch);
  router.push(targetPath.value);
}

let timeout: any = null;
let long: any = null;

function onPointerDown(e, sketch) {
  if (!viewport.touch) return

  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  long = false;

  timeout = setTimeout(() => {
    long = true;
    onContextMenu(e, sketch);
  }, 150);
}

function onPointerUp(e, sketch) {
  if (!viewport.touch) return

  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  clearTimeout(timeout);

  if (long === true) return;

  select(sketch)
}

function onContextMenu(e, sketch) {
  e.preventDefault();

  tooltip.show(
    [
      {
        text: `Select Visualizer`,
        action: () => {
          editor.selectSketch(sketch);
          router.push('/visualizer');
        },
      },
      {
        text: `Open In Editor`,
        action: () => {
          editor.selectSketch(sketch);
          router.push('/editor');
        },
      },
    ],
    [e.pageX, e.pageY]
  );
}
</script>

<style lang="scss" scoped>
$radius: 3rem;

main {
  @include flex(center, center, row);
  overflow-x: hidden;
}

main > div {
  @include flex-row(start, start);
  @include gap(2);

  @include mobile-portrait {
    @include gap;
  }
}

.shader {
  @include size(10vw, 20vw);
  position: relative;
  overflow: hidden;
  animation: none;
  transition: var(--base-transition);

  @include mobile-portrait {
    @include size(50vw, 30vw);
  }

  &:before {
    @include position(absolute, 0.25rem null null 0.25rem, 10);
    @include size(calc(100% - 0.5rem));
    content: '';
    display: block;
    transition: var(--hover-transition);
    background: radial-gradient(circle, rgba(10, 10, 18, 0) 40%, rgba(10, 10, 18, 0.15) 50%);
    box-shadow: inset 0 0 10rem 0rem lighten(rgba(10, 10, 18, 0.5), 0%);
  }

  :deep(canvas) {
    transition: var(--hover-transition);
  }

  &:hover {
    opacity: 1 !important;

    &:before {
      opacity: 0;
    }
  }

  &:hover :deep(canvas) {
    transform: scale(1.1);
  }
}

.pwa .shader {
  @include mobile-portrait {
    height: 35vw;
  }
}

.hidden {
  opacity: 0 !important;
}

.row,
.shaders {
  @include flex-row;
}

@keyframes bobble {
  0% {
    opacity: 0;
    transform: translateY(30%);
  }

  100% {
    opacity: 1;
    transform: translateY(0%);
  }
}

.shaders {
  flex-wrap: wrap;
  position: relative;

  @include mobile-portrait {
    @include size(100%, auto);
  }
}

.close {
  @include position(absolute, null 0 calc(100% + 1rem) null, 100);

  @include mobile-portrait {
    right: 1rem;
    bottom: calc(100% + 1rem);
  }
}

nav {
  @include position(absolute, calc(100% + 1rem) 0 null 0);
  @include flex-row(space-between, center);

  @include mobile-portrait {
    @include box(0 1);
  }
}

nav ul {
  @include flex-row;
  @include gap(0.5);
}

.dot {
  @include size(1.5rem);
  background: transparent;
  border: 1px solid $white;
  text-indent: -999px;
  overflow: hidden;
  border-radius: 100%;
  display: flex;
  transition: var(--hover-transition);

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(1);
  }

  &.active {
    background: $pink;
    border-color: $pink;
  }
}
</style>
