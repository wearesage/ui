<template>
  <div class="h1">
    <h1><slot></slot></h1>
    <h1><slot></slot></h1>
  </div>
</template>

<style lang="scss" scoped>
.h1 {
  display: flex;
  margin: 0;
  padding: 0;
  transition: var(--base-transition);
  pointer-events: none;
  user-select: none;
  position: relative;
  z-index: 11;

  // mix-blend-mode: screen;
  // z-index: 1000 !important;
}

h1 {
  font-family: 'Bungee';
  font-size: 4rem;
  line-height: 1;
  margin: 0;
  font-weight: normal;
  padding: 0;
}

h1:first-of-type {
  @include text-gradient(lighten($black, 5%), darken($black, 5%));
  // opacity: 0.25;
  // color: lighten($pink, 0%);
  // mix-blend-mode: exclusion;
}

h1 + h1 {
  @include text-gradient(var(--purple), var(--pink));
  position: absolute;
  opacity: 0.75;
  font-family: 'Bungee Outline';
}

@include mobile {
  h1 {
    font-size: 3rem;
    line-height: 1;
  }
}

@include mobile-landscape {
  h1 {
    font-size: 5rem;
    line-height: 1;
  }
}
</style>
