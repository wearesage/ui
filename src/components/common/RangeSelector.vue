<template>
  <div>
    <button
      @click="select('week')"
      :class="{ active: modelValue === 'week' }"
      >Week</button
    >
    <button
      @click="select('month')"
      :class="{ active: modelValue === 'month' }"
      >Month</button
    >
    <button
      @click="select('year')"
      :class="{ active: modelValue === 'year' }"
      >Year</button
    >
    <i :style="{ transform }" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: any;
}>();

const emit = defineEmits(['update:model-value']);

const transform = computed(() => {
  switch (props.modelValue) {
    case 'week':
      return 'translateX(0%) translateY(-50%)';
    case 'month':
      return 'translateX(100%) translateY(-50%)';
    case 'year':
      return 'translateX(200%) translateY(-50%)';
  }
});

function select(value: 'week' | 'month' | 'year') {
  emit('update:model-value', value);
}
</script>

<style lang="scss" scoped>
div {
  @include flex(center, start, row);
  position: relative;

  @include mobile {
    width: 100%;
  }
}

i {
  @include size(33.333%, 1px);
  position: absolute;
  top: calc(100% - 10px);
  left: 0;
  background: transparent;
  border-bottom: 1px solid $white;
  display: flex;
  transition: var(--base-transition);
  overflow: hidden;
}

button {
  @include flex;
  @include button(transparent, $white, $white, $purple);
  height: calc(1.25 * var(--element-size));
  border: 0;
  cursor: pointer;
  font-weight: 100;
  flex: 1;

  &:hover {
    color: $yellow;
  }

  @include mobile {
    flex: 1;
    width: 100%;
  }
}

button {
  background: transparent !important;
}
</style>
