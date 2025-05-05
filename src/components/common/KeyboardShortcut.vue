<template>
  <div class="keyboard">
    <Button icon="keyboard">
      <slot class="slop" />
    </Button>
    <span>press <strong>ESC</strong> to return to visualizer</span>
    <MushySVG class="mushroom"/>
  </div>
</template>

<script setup lang="ts">
import MushySVG from '../../assets/images/mushrooms.svg';
</script>

<style lang="scss" scoped>
.keyboard {
  $size: 2rem;
  @include flex-row(space-evenly, center);
  @include gap(1.5);
  @include position(absolute, 1rem null null 50%, 100);
  overflow: hidden;
  line-height: 1;
  transform: translateX(-50%);
  pointer-events: none;
  font-size: $size;
  background: $black;
  border: 1px solid lighten($black, 30%) !important;
  padding: 0 0 0 0;
  border-radius: 2rem;
  width: var(--menu-content-width);

  @include mobile {
    display: none;
  }
  
  :deep(svg) {
    fill: lighten($black, 20%);
  }

  :deep(button svg) {
    @include size($size/.5 !important);
    position: absolute;
    fill: lighten($black, 20%);
    z-index: -1;
  }
}

.slop :deep(*) {
  font-weight: 100 !important;
}

.mushroom {
  @include size(auto, calc(var(--element-size) * .5));
  // @include position(absolute, 50% 1rem null null);
  // transform: translateY(-50%);
  display: none;
  :deep(*){ fill: $pink; }
}

span {
  font-size: 1rem !important;
  position: relative;
  z-index: 10;
  border: 0 !important;
  color: rgba($purple, .5);
  font-weight: 100 !important;

   * {
    color: rgba(lighten($purple, 15%), 1);

   }
}

* {
  border: 0 !important;
}

button :deep(*) {
  font-size: 1.75rem;
  font-weight: 700;
}
</style>
