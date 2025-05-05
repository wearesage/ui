<template>
  <RouterLink
    v-bind="$attrs"
    v-if="to"
    :class="{ disabled }"
    :to="to">
    <Icon
      v-if="icon"
      :icon="icon" />
    <slot></slot>
  </RouterLink>

  <button
    v-bind="$attrs"
    :class="{ disabled }"
    v-else>
    <Icon
      class="icon"
      v-if="icon"
      :icon="icon" />
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { type Icon } from './Icon.vue';

withDefaults(
  defineProps<{
    icon?: Icon;
    disabled?: boolean;
    to?: string;
    background?: string;
    color?: string;
  }>(),
  {
    background: 'transparent',
    color: 'var(--white)',
    disabled: false,
  }
);
</script>

<style lang="scss" scoped>
button,
a {
  @include flex-row;
  @include gap;
  font-weight: 100;
  display: inline-flex;
  margin: 0;
  height: var(--element-size);
  border: 1px solid lighten($black, 30%);
  border-radius: 50rem;
  padding: 0 1.25rem;
  white-space: nowrap;
  font-size: 1rem;
  line-height: 2.5rem;
  transition: var(--hover-transition);
  will-change: transform;
  text-decoration: none;
  background: v-bind(background);
  color: v-bind(color);

  &:hover {
    background: lighten($black, 20%);
  }

  &:active {
    transform: scale(0.95);
  }
}

:deep(svg) {
  @include size(1.25rem);
}
.disabled{
  opacity: .25;
  cursor: not-allowed;
}

:deep(.icon) {
  transform: translate(90deg) !important;
}
</style>
