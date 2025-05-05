<template>
  <div>
    <button
      @click="select('slow')"
      :class="{ active: modelValue === 'slow' }"
      >Slow</button
    >
    <button
      @click="select('normal')"
      :class="{ active: modelValue === 'normal' }"
      >Normal</button
    >
    <button
      @click="select('fast')"
      :class="{ active: modelValue === 'fast' }"
      >Fast</button
    >
    <i :style="{ transform }" />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: any;
}>(), {
  modelValue: 'normal'
});

const emit = defineEmits(['update:model-value']);

const transform = computed(() => {
  switch (props.modelValue) {
    case 'slow':
      return 'translateX(0%) translateY(-50%)';
    case 'normal':
      return 'translateX(100%) translateY(-50%)';
    case 'fast':
      return 'translateX(200%) translateY(-50%)';
  }
});

function select(value: 'slow' | 'normal' | 'fast') {
  emit('update:model-value', value);
}
</script>

<style lang="scss" scoped>
div {
  @include flex(center, start, row);
  @include box(0 1, 1);
  border-bottom-right-radius: 2rem;
  border-bottom-left-radius: 2rem;

  position: relative;
  // background: linear-gradient(to right, transparent, lighten($black, 20%), transparent);
  
  @include mobile {
    flex: 1;
    padding: 0;
  }
}

i {
  @include size(33.333%, 1px);
  position: absolute;
  top: 100%;
  left: 0;
  background: linear-gradient(to right, transparent, $purple, transparent) !important;
  // border-bottom: 1px solid $white;
  display: flex;
  transition: var(--base-transition);
  overflow: hidden;
}

button {
  @include flex;
  @include button(transparent, $white, $white, $pink);
  border: 0;
  cursor: pointer;
  font-weight: 100;
  flex: 1;

  &:hover {
    color: $purple;
  }

  &.active {
    color: $pink;
    font-weight: 700;
  }

  // @include mobile {
  //   flex: 1;
  //   width: 100%;
  // }
}

button {
  background: transparent !important;
}
</style>
