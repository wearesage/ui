<template>
  <figure
    class="cookie"
    :class="{ tripping, visible: showMonster }">
    <img src="/images/cookie.monster.png" />

    <Transition name="fade">
      <Shader
        v-if="tripping && editor?.activeSketch"
        :shader="editor.shader"
        :uniforms="editor.uniforms"
        :stream="visualizer.stream * 5"
        :volume="visualizer.volume"
        :dpr="viewport.dpr"
        :tween="editor.tweening"
        :tweenProgress="editor.tweenProgress"
        :tweeningUniforms="editor.tweeningUniforms"
        :animate="true" />
    </Transition>

    <img src="/images/cookie.monster.png" />

    <Transition name="fade">
      <Shader
        v-if="tripping && editor?.activeSketch"
        :shader="editor.shader"
        :uniforms="uniforms"
        :stream="visualizer.stream / 2"
        :volume="visualizer.volume"
        :dpr="viewport.dpr"
        :tween="editor.tweening"
        :tweenProgress="editor.tweenProgress"
        :tweeningUniforms="editor.tweeningUniforms"
        :animate="true" />
    </Transition>
  </figure>

  <section>
    <h1
      :class="{ visible: visible && !tripping, rainbow }"
      ref="container"
      >{{ sentence }}<i :class="{ blink, hidden: tripping || showMonster }">_</i></h1
    >
  </section>

  <Transition name="fade">
    <div
      class="actions"
      v-if="showButtons && !tripping">
      <div class="row"> <button @click="fall">🙅</button> <button @click="trip">👌</button></div>

      <!-- <p :class="{ visible: showMonster && !tripping && showOffer }"
        ><strong>LIMITED TIME ONLY: </strong> if you accept our cookies, we'll feed Cookie Monster a heroic dose of LSD.</p
      > -->
    </div>
  </Transition>
</template>

<script setup lang="ts">
const visualizer = useVisualizer();
const editor = useEditor();
const shaders = useShaders();
const viewport = useViewport();
const container = ref();
const sentence = ref('');
const tripping = ref(false);
const showButtons = ref(false);
const showOffer = ref(false);
const showMonster = ref(false);
let interval = shallowRef(null);
const visible = ref(true);
const blink = ref(false);
const rainbow = ref(false);

editor.selectSketch(shaders.published[34]);

const uniforms = ref(
  (() => {
    const returned = [];
    clone(editor.uniforms).forEach(uniform => {
      if (uniform[0] === 'zoom') uniform[2] /= 3;
      returned.push(uniform);
    });
    return returned;
  })()
);

async function trip() {
  tripping.value = true;

  let line = `Excellent. `.split('');

  sentence.value = '';

  for await (const character of line) {
    await pause(CHARACTER_PAUSE + randomNumber(5, 40));
    sentence.value += character;
  }

  await pause(800);

  rainbow.value = true;

  line = [...`On with the show!`];

  sentence.value = '';

  CHARACTER_PAUSE *= 3;

  for await (const character of line) {
    await pause(CHARACTER_PAUSE + randomNumber(5, 40));
    sentence.value += character;
  }
}

function fall() {
  tripping.value = false;
}

const lines = [
  `Hey y'all! `,
  `So, there are a bunch of you now. `,
  `My accountant told me I'm going to get ransacked by the EU if I don't tell you that I use Google Analytics. `,
  `Seems excessive. `,
  '...right? ',
  `Anyway. `,
  `Are you cool with me using cookies so I can impress my grandparents with how many users I have? `,
  `They never forgave me for dropping out of college. `,
  `🍪🍪❓  🥺 👉🏽👈🏽 `,
].map(l => [...l]);

const pauses = [700, 1500, 1200, 700, 900, 700, 1000, 800];

let CHARACTER_PAUSE = 20;

let blinkInterval = setInterval(() => {
  blink.value = !blink.value;
}, 500);

watch(
  () => showMonster.value,
  async val => {
    if (!val) return;
    await pause(1000);
    showOffer.value = true;
  }
);

onMounted(async () => {
  if (editor.variantShuffle) {
    editor.toggleVariantShuffle();
  }

  visible.value = true;
  ;

  clearInterval(interval.value);

  let i = 0;

  for await (const line of lines) {
    visible.value = true;

    if (i === lines.length - 1) {
      showMonster.value = true;
    }

    for await (const character of line) {
      await pause(CHARACTER_PAUSE + randomNumber(5, 40));
      sentence.value += character;
    }

    if (i === lines.length - 1) {
      showButtons.value = true;
      return;
    }

    await pause(pauses[i]);

    visible.value = false;

    // await pause(300);

    sentence.value = '';
    i++;

    // for await (const character of line) {
    //   await pause(DELETE_PAUSE + randomNumber(DELETE_PAUSE / 2, DELETE_PAUSE * 2));
    //   sentence.value = sentence.value.substring(0, sentence.value.length - 1);
    // }
  }
});

onBeforeUnmount(() => {
  clearInterval(blinkInterval.value);
  clearInterval(interval.value);
});
</script>

<style lang="scss" scoped>
$size: 200px;

h1 {
  // opacity: 0;
  // transition: var(--hover-transition);
  // @include text-gradient($orange, $pink);
  // transform: translateY(-150px);
  font-weight: normal;
  font-size: 2.5rem;
  line-height: 2.5rem;
  // max-width: 800px;
  // padding-top: -50px;
  // padding-left: 100px;
  // transform: translateY(-100px);
  // background: linear-gradient(to top, $black, transparent);
  z-index: 10;
  // max-width: 700px;
  margin-top: 2rem;
  color: $white;
  // opacity: 0;

  @include mobile {
    font-size: 1.5rem;
    line-height: 1.5rem;
  }

  &:first-letter {
    font-weight: 900;
    color: $pink;
  }
}

p {
  opacity: 0;
  transition: var(--base-transition);
}

.visible {
  opacity: 1;
  // transform: translateY(0px);
}

i {
  opacity: 0;

  &.blink {
    opacity: 1;
  }

  &.hidden {
    opacity: 0;
  }
}

.cookie {
  // @include position(fixed, 0 null null 0, 150);
  @include size($size);
  @include flex;
  background: white;
  border: 1px solid $white;
  border-radius: 100%;
  overflow: hidden;
  // @include flex(center, end);
  will-change: transform, opacity;
  object-fit: cover;
  transition: var(--base-transition);
  // mix-blend-mode: exclusion;
  opacity: 0;

  &.visible {
    opacity: 1;
  }

  &.tripping {
    animation: rotate 1000ms var(--base-easing) forwards;
    // img {
    //   mix-blend-mode: exclusion;
    // }

    // :deep(.shader:last-of-type) {
    //   mix-blend-mode: exclusion;
    // }
  }
}

.cookie img {
  @include size($size);

  // @include position(absolute, 0 null null 0, 20);
  position: absolute;
  display: flex;
  object-fit: cover;
  // mix-blend-mode: screen;

  &:first-of-type {
    mix-blend-mode: initial;
    z-index: 1000;
  }
  // animation: rotate 25s linear infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1) rotate(-5deg);
  }

  50% {
    transform: scale(0.9) rotate(5deg);
  }

  100% {
    transform: scale(1) rotate(-5deg);
  }
}

@keyframes pulse2 {
  0% {
    transform: scale(1) rotate(15deg);
  }

  33% {
    transform: scale(1.3) rotate(-10deg);
  }

  66% {
    transform: scale(1) rotate(5deg);
  }

  100% {
    transform: scale(1) rotate(15deg);
  }
}

figure.tripping img {
  animation: pulse2 5s ease-in-out infinite;
}

figure.tripping {
  animation: pulse 3s ease-in-out infinite;
}

.cookie :deep(.shader) {
  @include size($size, $size * 0.5);
  // @include position(absolute, 0 null null 0, 1011);
  // opacity: 0.75;
  mix-blend-mode: difference;

  &:first-of-type {
    @include position(absolute, 0 0 50% 0);
    z-index: 250;
    // mix-blend-mode: exclusion;
    // mix-blend-mode: multiply;
  }

  &:last-of-type {
    @include position(absolute, 0 0 0 0, 1000);
    height: 100%;
  }
  //   mix-blend-mode: screen;
  //   z-index: 1000;
  //   opacity: 0.25;
  // }

  // &:last-of-type {
  //   z-index: 100;
  //   height: $size;
  //   // mix-blend-mode: difference;
  //   mix-blend-mode: hard-light;
  //   // opacity: 0.5;
  // }
}

button {
  @include button;
  font-family: 'Bungee';
  font-weight: normal;
  font-size: 1.5rem;
  height: 3.5rem;
  @include flex;
  border: 1px solid rgba($red, 0.5);

  &:hover {
    background: $red;
  }

  &:last-of-type {
    border-color: rgba($green, 0.5);

    &:hover {
      background-color: $green;
    }
  }
}

sup {
  color: $pink;
  padding: 0.25rem 0 0.25rem 0.25rem;
  transform: translateY(-25%);
}

.actions {
  @include flex(start, start, column);
  position: relative;
  padding: 1rem 0;
  gap: 1rem;

  .row {
    @include flex(center, start, row);
    gap: 0.5rem;
  }
}

strong {
  @include text-gradient($pink, $purple);
}

strong,
p {
  font-size: 1rem;
  line-height: 1rem;
}

section {
  height: fit-content;
  position: relative;
}

p {
  // position: absolute;
  // top: 50%;
  left: 0;
  // transform: translateX(50%);
  // width: fit-content;
  padding: 0.5rem;
  border-radius: 100px;
  overflow: hidden;
  display: block;
  margin: 0;
  opacity: 0;
  margin-top: 3rem;
  transition: var(--base-transition);
  // max-width: 250px;
  line-height: 1rem;

  &.visible {
    opacity: 1;
  }
}

.rainbow {
  @include text-gradient($pink, $yellow);
  font-weight: normal;
  font-family: 'Bungee Outline';
  font-size: 5rem;
  line-height: 5rem;
  // max-width: 320px;
  // @include flex(start, start, column);

  @include mobile-portrait {
    font-size: 3.5rem;
    line-height: 3.5rem;
  }
}
</style>
