<template>
  <form @submit.prevent="onSubmit" class="form" ref="form">
    <slot></slot>
    <div class="buttons" v-if="cancelText || submitText">
      <Button @click.prevent="onCancel" v-if="cancelText">{{ cancelText }}</Button>
      <Button>{{ submitText }}</Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    submitText?: string | null,
    cancelText?: string | null
  }>(),
  {
    submitText: 'Submit',
    cancelText: null,
  }
)

const form = ref()

const emits = defineEmits(['submit', 'cancel'])

function onCancel () {
  emits('cancel')
}

function onSubmit(e) {
  const formData = new FormData(form.value)
  const formProps = Object.fromEntries(formData)
  emits('submit', formProps)
}
</script>

<style lang="scss" scoped>
form,
form :deep(label) {
  @include flex-column(flex-start, flex-start);
  width: 100%;
}

form {

  position: relative;
}

.buttons {
  @include flex-row(end, center);
  width: 100%;
}
</style>
