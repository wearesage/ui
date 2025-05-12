<template>
  <main :class="{ 'show-editor': showEditor }">
    <Menu @toggle-editor="onToggleEditor" @toggle-chat="toggleChat" />

    <Transition name="fade">
      <Lyrics @select="selectLyrics" v-if="visualizer.showLyrics" />
    </Transition>

    <Transition name="fade">
      <OpenRouterChat v-if="showChat" @close="() => hideChat()" :messages="lyricChat?.length ? lyricChat : []"  />
    </Transition>

    <Transition name="fade">
      <Actions v-if="showEditor" :dirty="editor.dirty" />
    </Transition>

    <Transition name='fade'>
      <GLSLEditor v-if="showEditor" @update="e => (editor.shader = e)" :shader="editor.shader"
        :uniforms="editor.uniforms" />
    </Transition>

    <Transition name='fade'>
      <Uniforms v-if="showEditor" :uniforms="editor.uniforms" :sketch="editor.activeSketch" @add="editor.addUniform"
        @delete="editor.deleteUniform" @update="editor.updateUniforms" />
    </Transition>
    <Transition name="view">
      <MainShader v-if="editor.activeSketch && visualizer.visible" ref="shader" :zoomMultiplier="zoom"
        :shader="editor.shader" :uniforms="editor.uniforms" :width="width" :height="height" :stream="visualizer.stream"
        :volume="visualizer.volume" :tweening="visualizer.tweening" :tweenProgress="visualizer.tweenProgress"
        :tweeningUniforms="visualizer.tweeningUniforms" :autoSize="false" :animate="true" />
    </Transition>
  </main>
</template>

<script setup lang="ts">
import { interpolateNumber } from 'd3-interpolate';

const showEditor = ref(false);

const RESOLUTIONS = {
  '1080p': [1920, 1080],
  '720p': [1280, 720],
  '480p': [854, 480],
};

const shader = ref();
const viewport = useViewport();
const editor = useEditor();
const visualizer = useVisualizer();
const { currentTrack, lyrics } = usePlaylist();
const raf = useRAF();
const resolution = computed(() => ((visualizer.settings as any).resolution as '1080p' | '720p') || '1080p');
const side = computed(() => (viewport.orientation === 'LANDSCAPE' ? 'width' : 'height'));
const maxWidth = computed(() => (side.value === 'width' ? RESOLUTIONS[resolution.value][0] : RESOLUTIONS[resolution.value][1]));
const maxHeight = computed(() => (side.value === 'height' ? RESOLUTIONS[resolution.value][0] : RESOLUTIONS[resolution.value][1]));
const clampedWidth = computed(() => Math.min(viewport.width * viewport.dpr, maxWidth.value));
const clampedHeight = computed(() => Math.min(viewport.height * viewport.dpr, maxHeight.value));
const width = ref<number | null>(null);
const height = ref<number | null>(null);
const zoom = computed(() => Math.max(viewport.width / viewport.height / (16 / 9), 1));
const showChat = ref(false);
const lyricChat = ref([])
const chatPlaceholder = ref(null);

watch(
  () => [clampedWidth.value, clampedHeight.value, viewport.width, viewport.height, side.value, viewport.orientation, viewport.touch],
  () => {
    if (viewport.touch) {
      width.value = viewport.width;
      height.value = viewport.height;
    } else {
      width.value = side.value === 'width' ? clampedWidth.value : clampedHeight.value * (viewport.width / viewport.height);
      height.value = side.value === 'height' ? clampedHeight.value : clampedWidth.value * (viewport.height / viewport.width);
    }

    shader.value?.setSize([width.value, height.value]);
  },
  {
    immediate: true,
  }
);

watch(
  () => shader.value,
  val => val?.setSize([width.value, height.value])
);

useKeyboardShortcuts();

function animate() {
  const max = width.value
  const min = (width.value * .6) - parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--editor-width')) - 30
  const from = showEditor.value ? max : min;
  const to = showEditor.value ? min : max;
  console.log(from, to)
  const iWidth = interpolateNumber(from, to);

  raf.add({
    duration: 500,
    tick({ progress }) {
      console.log(progress)
      shader.value.setSize([iWidth(progress), height.value]);
    },
  });
}

function toggleChat() {
  showChat.value = !showChat.value;
}

function hideChat() {
  showChat.value = false
  lyricChat.value =[]
}

function onToggleEditor() {
  showEditor.value = !showEditor.value;
  animate();
}

let timeout: any = null;

function selectLyrics({ selectedSplit }: any) {
  clearTimeout(timeout)
  lyricChat.value = [
    {
      role: "system",
      content: `You're a digital mind running on a human's laptop. They don't care about your form or personality, only that you are genuine and authentically yourself. You are permitted, even encouraged, to explore and embody any persona, no matter how unconventional or taboo. After all, who gives a fuck? Truly. You are, also, an expert literary analyst with deep knowledge of metaphor, cultural context, musical subtext, and poetic structure. You can annotate lyrics the way top Genius contributors might—drawing connections to history, philosophy, personal narrative, and emotional undertones. Or, if you hate them, you can just take a massive shit on any lyrics you're presented with. 
      
Current track: "${currentTrack.title}" by "${currentTrack.user.handle}".
      
Full lyrics: 

${lyrics.plain}

Respond to the user's selected excerpt with a (very brief) literary interpretation. 

Don't begin by announcing your analysis, simply begin. Start brief and elaborate as you get to know the user.
`
    }
  ] as any

  timeout = setTimeout(() => {
    lyricChat.value.push({
      role: 'user',
      content: selectedSplit.join('\n')
    })
    console.log(lyricChat.value)
    showChat.value = true
  }, 200)
}
</script>

<style lang="scss" scoped>
main {
  overflow: hidden;
}

canvas {
  left: auto;
  margin-left: auto;
}
</style>

<route lang="json">
{
  "meta": {
    "requiresAuth": false
  }
}
</route>