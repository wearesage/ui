<template>
  <main ref="container"
    :class="{ fullscreen: viewport.fullScreen, full: editor?.preview, neon: visualizer.settings.neon }">
    <Actions v-if="!viewport.fullScreen" @source="source" @new="createNew" @save="save" @undo="undo" @clone="copy"
      @print="print" @json="json" @fullscreen="requestFullscreen" @raw="raw" @shadertoy="shadertoy"
      :dirty="editor.dirty" />

    <Transition name="fade">
      <GLSLEditor v-if="!editor.preview && !viewport.fullScreen" @update="editor.updateShader" :shader="editor.shader"
        :uniforms="editor.uniforms" />
    </Transition>

    <Transition name="fade">
      <Shader v-if="editor && visualizer && !visualizer?.menuOpen" ref="shader" :shader="editor.shader"
        :uniforms="editor.uniforms" :dpr="visualizer?.dpr" :stream="visualizer?.stream" :time="raf.time / 1000"
        :volume="audio.volume" :tween="editor.tweening" :tweenProgress="editor.tweenProgress"
        :tweeningUniforms="editor.tweeningUniforms" @error="onError" :animate="true" />
    </Transition>

    <Uniforms v-if="!editor?.preview && !viewport.fullScreen" :uniforms="editor.uniforms" :sketch="editor.activeSketch"
      @add="editor.addUniform" @delete="editor.deleteUniform" @update="editor.updateUniforms" />
  </main>
</template>

<script setup lang="ts">
import { requestFullscreen } from '../../util/browser'

const visualizer = useVisualizer();
const editor = useEditor();
const thumbnails = useThumbnails();
const viewport = useViewport();
const { updateSketch } = useSketchAPI();
const audio = useAudio();
const raf = useRAF();
const error = ref(null);
const shader = ref();
const container = ref();
const rawShader = ref();

watch(
  () => shader.value?.internalFragmentShader,
  val => {
    rawShader.value = val;
  },
  { immediate: true }
);

function onError(e: any) {
  error.value = e;
  console.log(e);
}

function createNew() {
  editor.selectSketch({
    shader: DEFAULT_FRAGMENT_SHADER,
    variants: [DEFAULT_UNIFORMS()]
  })
}

async function save() {
  // const { activeSketch, shader, variant, uniforms } = editor;
  // const datum = clone(activeSketch);
  // datum.shader = shader;
  // datum.variants[variant] = uniforms;
  // const { success, sketch } = await updateSketch(datum);
  // if (success) {
  //   editor.selectSketch(sketch)
  //   thumbnails.patchVersions([sketch])
  // }
}

function undo() {
  editor.undoChanges();
}

function copy() { }

async function print() {
  const a = document.createElement('a')
  a.href = await thumbnails.generatePrint(editor.activeSketch) as string
  a.download = `${editor.activeSketch._id}.png`
  a.click()
}

function json() {
  editor.downloadSketch()
}

function raw() { }

function source() {
  visualizer.selectSource('RADIO_PARADISE')
}

function shadertoy() { }

onMounted(() => {
  editor.hydrate();
  editor.variantShuffle = false;
  dropJSON(container.value, data => {
    editor.selectSketch(data)
  })
});

onBeforeUnmount(() => {
  editor.housekeeping();
});
</script>

<style lang="scss" scoped>
main {
  padding: 0;
  font-size: 0.8rem;
  background: $black;
}

.shader {
  @include size(calc(100vw - var(--editor-width) - var(--nav-width)), 100%);
  margin-left: auto;

  @include mobile {
    @include size(100vw, 40vh);
  }
}

.fullscreen :deep(.shader) {
  @include size(100%);
  margin: 0 auto;
}

.full .shader {
  @include size(100vw, 100%);
  margin: 0;
}
</style>
