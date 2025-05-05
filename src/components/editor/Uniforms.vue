<template>
  <aside>
    <div class="uniforms">
      <div
        v-for="(uniform, i) in uniforms"
        @contextmenu="e => onContextMenu(e, i)"
        :class="{ locked: uniform[6] }"
        :key="uniform[0] + i"
        class="uniform">
        <IconButton
          icon="lock"
          class="lock"
          @click="lock(i)" />
        <div class="name">{{ uniform[0] }}</div>
        <div
          v-if="uniform[1] === 0"
          class="inputs">
          <input
            name="min"
            type="number"
            :value="uniform[3]?.toFixed?.(3)"
            @input="e => onUpdate(e as any, i, 'min')" />
          <input
            name="value"
            type="range"
            :min="uniform[3]"
            :max="uniform[4]"
            :step="uniform[5] ? 1 : 0.000001"
            :value="uniform[2]"
            @input="e => onUpdate(e as any, i, 'value')" />
          <input
            type="number"
            name="max"
            :value="uniform[4]?.toFixed?.(3)"
            @input="e => onUpdate(e as any, i, 'max')" />
          <button
            class="int"
            @click="() => onUpdate({ target: { value: !uniform[5] } } as any, i, 'int')"
            :class="{ active: uniform[5] }">
            int
          </button>
        </div>

        <div v-if="uniform[1] === 1">
          <Toggle
            type="checkbox"
            name="value"
            :modelValue="uniform[2]"
            @update:modelValue="e => onUpdate({ target: { checked: e } } as any, i, 'value')" />
        </div>

        <div
          class="color"
          v-if="uniform[1] === 3"
          :style="{ background: `linear-gradient(to right, transparent, ${glslColorToHex(uniform[2])})` }">
          <input
            type="color"
            name="value"
            :value="glslColorToHex(uniform[2])"
            @input="e => onUpdate(e as any, i, 'value')" />
        </div>
      </div>
    </div>

    <div class="actions">
      <div
        class="variants"
        :class="{ visible: !adding && !renaming }">
        <div
          class="thumb"
          v-for="(variant, i) in sketch?.variants || []"
          :class="{ active: editor.variant === i }"
          @click="editor.variant === i && editor.variantsDirty[i] ? editor.resetVariant() : editor.tweenToVariant(i)"
          @contextmenu="e => onVariantContextMenu(e, i)"
          :key="i">
          <i
            class="unsaved"
            :class="{ visible: editor.variantsDirty[i] }"></i>
          <div class="shader-container">
            <Transition name="fade">
              <Shader
                v-if="!visualizer.menuOpen"
                :shader="editor.shader"
                :uniforms="variant"
                :stream="visualizer.stream"
                :time="raf.time / 1000"
                :volume="1"
                :dpr="viewport.dpr"
                :animate="true" />
            </Transition>
          </div>
        </div>
        <IconButton
          icon="fork"
          @click="editor.addVariant" />
        <IconButton
          icon="surprise"
          @click="editor.shuffleUniforms" />
        <IconButton
          icon="shuffle"
          :active="editor.variantShuffle"
          @click="editor.toggleVariantShuffle" />
      </div>

      <div
        class="row"
        :class="{ visible: !adding && !renaming }">
        <IconButton
          icon="plus"
          @click="addUniform" />
      </div>

      <div
        class="row"
        :class="{ visible: adding && uniformType === -1 }">
        <button @click="setType(0)">float</button>
        <button @click="setType(1)">bool</button>
        <button @click="setType(3)">color</button>
        <IconButton
          icon="undo"
          @click="cancelAdd" />
      </div>

      <div
        class="row"
        :class="{ visible: uniformType !== -1 || renaming }">
        <input
          :value="uniformName"
          @input="setUniformName"
          @keydown="onUniformKeyDown"
          type="text"
          ref="input"
          :placeholder="nameInputPlaceholder" />
        <IconButton
          icon="check"
          @click="() => (renaming ? finalizeRename() : finalizeAdd())" />
        <IconButton
          icon="undo"
          @click="() => (renaming ? cancelRename() : cancelAdd())" />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const visualizer = useVisualizer();
const viewport = useViewport();
const tooltip = useTooltip();
const editor = useEditor();
const raf = useRAF();
const adding = ref(false);
const uniformType = ref(-1);
const uniformName = ref('');
const input = ref();
const renaming = ref(false);
const renameIndex = ref(-1);

const props = withDefaults(
  defineProps<{
    uniforms: any[];
    sketch?: any;
  }>(),
  {
    uniforms: [],
  }
);

const emit = defineEmits(['update', 'add', 'delete']);

watch(
  () => uniformType.value,
  val => {
    if (val !== -1) {
      input.value.focus();
    }
  }
);

watch(
  () => renaming.value,
  val => {
    if (val) {
      input.value.focus();
    }
  }
);

const nameInputPlaceholder = computed(() => {
  return renaming.value ? `rename ${props.uniforms[renameIndex.value][0]}` : 'name your uniform';
});

function addUniform() {
  uniformName.value = '';
  adding.value = true;
}

function cancelAdd() {
  uniformType.value = -1;
  adding.value = false;
}

function setType(type: number) {
  uniformType.value = type;
}

function setUniformName(e) {
  uniformName.value = e.target.value;
}

function finalizeRename() {
  emit('update', { key: 'rename', i: renameIndex.value, name: uniformName.value });
  cancelRename();
}

function cancelRename() {
  renameIndex.value = -1;
  renaming.value = false;
}

function onUniformKeyDown(e) {
  if (e.key !== 'Enter') return;

  if (renaming.value) {
    finalizeRename();
  } else {
    finalizeAdd();
  }
}

function glslColorToHex(color: [number, number, number]): string {
  const clampAndConvert = (value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    return Math.round(clamped * 255)
      .toString(16)
      .padStart(2, '0');
  };

  const [r, g, b] = color.map(clampAndConvert);
  return `#${r}${g}${b}`;
}

function hexToGlslColor(hex: string): [number, number, number] {
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }
  if (hex.length !== 6) {
    throw new Error('Invalid hex color format. Expected a 6-character string.');
  }

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  return [r, g, b];
}

function onUpdate(e: { target: HTMLInputElement }, i: number, key: string) {
  const type = props.uniforms[i][1];

  if (type === 0) {
    emit('update', { value: key === 'int' ? e.target.value : parseFloat(e.target.value), key, i });
  }

  if (type === 1) {
    emit('update', { value: e.target.checked, key, i });
  }

  if (type === 3) {
    emit('update', { value: hexToGlslColor(e.target.value), key, i });
  }
}

function onContextMenu(e, i) {
  e.preventDefault();

  tooltip.show(
    [
      {
        text: `Rename "${props.uniforms[i][0]}"`,
        action: () => {
          uniformName.value = '';
          renameIndex.value = i;
          renaming.value = true;
          tooltip.hide();
        },
      },
      {
        text: `Delete "${props.uniforms[i][0]}"`,
        action: () => {
          emit('delete', i);
          tooltip.hide();
        },
      },
    ],
    [e.pageX, e.pageY]
  );
}

function onVariantContextMenu(e, i) {
  e.preventDefault();

  tooltip.show(
    [
      {
        text: `Isolate Variant`,
        action: () => {
          editor.isolateVariant(i);
          tooltip.hide();
        },
      },
      {
        text: `Delete Variant`,
        action: () => {
          editor.deleteVariant(i);
          tooltip.hide();
        },
      },
    ],
    [e.pageX, e.pageY]
  );
}

function finalizeAdd() {
  emit('add', Uniform.create(uniformName.value, uniformType.value));
  cancelAdd();
}

function lock(i) {
  const uniforms = clone(props.uniforms);
  uniforms[i][6] = !uniforms[i][6];
  emit('update', { value: !props.uniforms[i][6], key: 'lock', i });
}
</script>

<style lang="scss" scoped>
aside {
  display: flex;
  flex-direction: column;
  position: absolute;
  width: var(--editor-width);
  bottom: 0;
  left: var(--nav-width);
  z-index: 2;
  background: linear-gradient(to top right, darken(rgb(10, 10, 18), 2%), lighten(rgb(10, 10, 18), 2%));

}

.uniforms {
  @include scroll-bar;
  height: calc(var(--post-size) / 2);
  overflow-y: auto;
}

input {
  background: transparent;
  border: 0;
}

.inputs {
  display: flex;
  width: 100%;
}

[name='min'],
[name='max'],
[name='step'] {
  width: 80px;
  flex-shrink: 0;
  text-align: center;
}

[name='value'] {
  display: flex;
  flex: 1;
}

*:active,
*:focus {
  outline: none;
}

.actions {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 0.75rem;

  .row {
    width: 100%;
    display: flex;
  }
}

.actions button {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 100%;
  transition: var(--base-transition);

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.9);
  }
}

.actions .row {
  flex-direction: row;
  justify-content: flex-end;
  gap: 0.5rem;
  opacity: 0;
  pointer-events: none;
  transition: var(--base-transition);

  & + div {
    position: absolute;
    width: calc(100% - 1.5rem);
  }

  &.visible {
    opacity: 1;
    pointer-events: all;
  }
}

.actions div button {
  width: auto;
  padding: 0 1rem;
  border-radius: 100px;
}

.uniform {
  width: 100%;
  display: flex;
  align-items: center;

  // background: linear-gradient(to top right, rgba(0, 0, 0, 0.5), rgba(255, 255, 255, 0.1));

  div {
    width: 100%;
    align-items: center;
    display: flex;
    height: 3rem;
    padding-left: 1rem;
    margin-right: 1rem;
    position: relative;

    [type='color'] {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
    }
  }
}

.uniform + .uniform {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.name {
  max-width: 100px;
  font-weight: 800;
}

.actions input[type='text'] {
  display: flex;
  margin-right: auto;
  flex: 1;
  height: 2rem;
}

.variants {
  @include flex(center, start, row);
  gap: 0.5rem;
  opacity: 0;
  transition: var(--hover-transition);
  will-change: transform, opacity;

  &.visible {
    opacity: 1;
  }
}

.thumb {
  @include size(3rem !important, 2rem !important);
  position: relative;
  border-radius: 2rem;
  transition: var(--hover-transition);
  // overflow: hidden;
  transform: scale(0.9);
  border: 0.1rem solid rgba(lighten($black, 40%), 0.75);

  &:before {
    @include position(absolute, 0 0 0 0, 10);
    content: '';
    border-radius: 2rem;
    box-shadow: inset 0 0 0.7rem 0rem rgba($pink, 0.75);
    transition: var(--hover-transition);
    opacity: 0;
  }

  .shader-container {
    @include size(100%);
    border-radius: 2rem;
    overflow: hidden;
  }

  &.active {
    transform: scale(1);
    opacity: 1;
    border: 0.1rem solid rgba($pink, 1);
    // outline: 0.1rem solid $black;
    // box-shadow: 0 0rem 0rem 0.1rem $white;
  }

  &.active:before {
    opacity: 1;
  }

  &:hover {
    opacity: 1;
    transform: scale(1);
    cursor: pointer;
  }

  &:active {
    transform: scale(0.9);
  }
}

.int {
  transition: var(--base-transition);
  color: white;
  background: transparent;
  border: 0;

  &.active {
    color: var(--pink);
  }
}

.lock {
  opacity: 0.25;
}

.uniform > * {
  transition: var(--base-transition);
}

.uniform.locked > * {
  opacity: 0.25;

  &.name,
  &.lock {
    opacity: 1;
  }
}

.unsaved {
  @include unsaved;
}

@include mobile {
  aside,
  .uniforms {
    width: 100%;
    left: 0;
    height: 25vh;
  }

  aside {
    top: 65vh;
    bottom: var(--nav-width);
    height: auto;
  }
}

.lock {
  border: 0 !important;
  width: fit-content;
  background: transparent !important;
  padding-right: 0;
}

@include mobile {
  .name {
    flex-shrink: 1;
    max-width: 2rem;
    display: inline;

  }
}
</style>
