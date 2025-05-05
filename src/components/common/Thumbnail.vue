<template>
  <figure @click="$emit('click')">
    <img :src="src" :alt="id" />
  </figure>
</template>

<script setup lang="ts">
import { useThumbnails } from '../../stores';
defineEmits(['click'])
const { versions } = useThumbnails();
const { id } = defineProps<{
  id: string;
}>();

const src = computed(() => `https://s3.us-west-1.amazonaws.com/kaleidosync.com/thumbs/${id}.jpg?v=${versions?.[id] || 0}`);
</script>

<style lang="scss" scoped>
img {
  width: 100%;
  transition: var(--hover-transition);
}

figure {
  @include size(15vw);
  position: relative;
  transition: var(--hover-transition);
  overflow: hidden;

  &:hover {
    cursor: pointer;

    img {
      transform: scale(1.25);
    }
  }

  &:hover:before {
    opacity: 0;
  }
}
</style>
