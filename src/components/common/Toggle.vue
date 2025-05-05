<template>
  <div
    class="toggle"
    :class="{ active: modelValue }">
    <div class="inner">
    <input
      :name="name || ''"
      type="checkbox"
      :checked="modelValue"
      @input="(e: any) => onInput(e)" />
    <i transition></i>
  </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; name?: string }>();
const $emit = defineEmits(['update:modelValue', 'input']);

function onInput(e) {
  $emit('input', e);
  $emit('update:modelValue', !props.modelValue);
}
</script>

<style lang="scss" scoped>
.toggle {
  @include flex;
  height: var(--element-size);
}

.inner {
  @include size(calc(1.3 * var(--element-size)), calc(.6 * var(--element-size)));
  background: rgba(0, 0, 0, 0.25);
  border-radius: 100rem;
  position: relative;
  flex-shrink: 0;

  input {
    @include position(absolute, 0 0 0 0);
    @include size(100%);
    opacity: 0;
    z-index: 1;
  }
}

i {
  @include size(calc(.6 * var(--element-size)));
  margin-left: auto;
  display: flex;
  background: var(--white);
  border-radius: 100%;
  flex-shrink: 0;
  transition: var(--base-transition);
  transform: translateX(calc(-.65 * var(--element-size))) scale(.7);
}

input:checked + i {
  background: var(--pink);
  transform: translateX(0)  scale(.7);
}

.toggle:active i {
  transform: translateX(calc(-.65 * var(--element-size))) scale(.6);
}

input:checked:active + i {
  transform: translateX(0) scale(.6);
}
</style>
