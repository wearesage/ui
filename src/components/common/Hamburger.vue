<template>
  <button
    class="hamburger"
    @click="$emit('click')"
    :class="{ open, neon }">
    <div>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps<{ open?: boolean; neon?: boolean }>();
defineEmits(['click']);
</script>

<style lang="scss" scoped>
button {
  @include size(var(--nav-width));
  @include flex;
  transition: var(--hover-transition);
  position: relative;
  // box-shadow: var(--box-shadow);
  background: $black;
  border: 0;
  outline: 0;

  &.neon {
    mix-blend-mode: exclusion;
  }

  * {
    transition: var(--hover-transition);
  }

  &:hover {
    background: lighten($black, 20%);
  }

  &.open {
    background: $pink;
  }

  :deep(svg) {
    @include size(calc(var(--nav-width) / 2.5));
    fill: $white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

span {
  position: relative;
}

span,
span:nth-of-type(2):before,
span:nth-of-type(2):after {
  @include size(40%, 2px);
  content: '';
  transition: var(--base-transition);
  display: flex;
  background: $white;
  border-radius: 1rem;
}

span:nth-of-type(2):before,
span:nth-of-type(2):after {
  @include size(100%, 2px);
  position: absolute;
  transform-origin: center center;
}

.open span {
  background: transparent;
}

.open span:nth-of-type(2):before {
  transform: rotate(225deg);
  opacity: 1;
}

.open span:nth-of-type(2):after {
  transform: rotate(-225deg);
  opacity: 1;
}

.open span:nth-of-type(1),
.open span:nth-of-type(3) {
  width: 0;
}

div {
  @include size(3rem);
  @include flex;
  gap: 4px;
  // padding: 0.75rem;
  transition: var(--base-transition);
}

.open div {
  transform: rotate(180deg);
}
</style>
