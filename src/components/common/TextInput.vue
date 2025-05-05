<template>
  <input
    type="text"
    :name="name"
    :value="modelValue"
    ref="input"
    @input="onInput"
    @blur="emit('blur')"
    @focus="emit('focus')" />
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
  name: string;
}>();

const input = ref();
const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

function forceFocus() {
  input.value?.focus();
}

defineExpose({
  forceFocus,
});

function onInput({ target: { value } }) {
  emit('update:modelValue', value);
}
</script>

<style lang="scss" scoped>
input {
  @include button;
  background: transparent;
  outline: 0;
  width: 100%;
  color: $white;
  font-weight: 100;

  ::placeholder {
    color: rgba($white, 0.8);
  }
}
</style>
