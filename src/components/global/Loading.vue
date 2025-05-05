<template>
  <section
    @transitionend="onTransitionEnd"
    :class="{
      visible: viewport?.loading,
      transparent: viewport?.loadingIsTransparent,
      noAnimate,
    }">
    <Spinner />
  </section>
</template>

<script setup lang="ts">
const viewport = useViewport();
const noAnimate = ref(false);

watch(
  () => viewport?.loading,
  val => {
    if (val) {
      noAnimate.value = false;
    }
  }
);

function onTransitionEnd() {
  if (!viewport?.loading) {
    viewport.loadingIsTransparent = false;
    noAnimate.value = true;
  }
}
</script>

<style lang="scss" scoped>
section {
  @include position(fixed, 0 null null 0, 1500);
  @include size(100%);
  @include flex;
  background: $black;
  opacity: 0;
  transition: var(--base-transition);
  pointer-events: none;

  :deep(*) {
    transition: none;
  }

  &.visible {
    opacity: 1;
    pointer-events: all;
  }

  &.transparent {
    background: rgba($black, 0);
    pointer-events: none;
  }

  .spinner {
    // transform: scale(0.75);
    transition: var(--base-transition);
  }

  &.visible .spinner {
    transform: scale(1);
  }
}

.noAnimate :deep(*) {
  animation: none;
}
</style>
