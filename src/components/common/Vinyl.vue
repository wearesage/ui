<template>
  <div class="vinyl">
    <img
      class="bg"
      src="/images/vinyl.png" />
    <div class="hole"></div>
    <div class="center">
      <img
        class="album"
        :src="src" />
      <div class="inner"></div>
      <div class="inner-2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { size = '100vh', src } = defineProps<{ size?: any; src: string }>();
</script>

<style lang="scss" scoped>
$BLACK: #000;

.vinyl {
  @include flex;
  width: v-bind(size);
  height: v-bind(size);
  border-radius: 100%;
  position: relative;
  overflow: hidden;

  &:before {
    @include position(absolute, 0 10% 0 10%);
    z-index: 1000;
    background: linear-gradient(to right, transparent, rgba($pink, 0.75), transparent);
    content: '';
    mix-blend-mode: screen;
    opacity: 0.25;
  }
}

.bg {
  @include size(100%);
  position: absolute;
}

.center {
  @include size(40%);
  @include flex;
  overflow: hidden;
  position: absolute;
  z-index: 1000;
  background: linear-gradient(to top right, rgba(darken($red, 10%), 0.5), rgba(lighten($purple, 10%), 0.8)), $black;
  border-radius: 100%;
  box-shadow: inset 0 -0.1vw 0px 0.1vw lighten($red, 20%), inset 0 0.1vw 0.1vw 0.1vw darken($red, 20%);
  border: 0.1vw solid $red;
  animation: rotate 10s linear infinite;
  &:after {
    @include position(absolute, 0 0 0 0);
    z-index: 1000;
    background: linear-gradient(to right, transparent, rgba($white, 0.2), transparent);
    mix-blend-mode: overlay;
    content: '';
  }

  &:before {
    @include position(absolute, 0 30% 0 30%);
    z-index: 1000;
    background: linear-gradient(to right, transparent, rgba($pink, 1), transparent);
    content: '';
    mix-blend-mode: screen;
    opacity: 0.3;
  }
}

.inner {
  @include size(70%);
  background: linear-gradient(to top right, rgba(darken($red, 10%), 0.5), rgba(lighten($purple, 10%), 0.8));
  position: absolute;
  box-shadow: inset 0 -0.05vw 0px 0.05vw lighten($red, 20%), inset 0 0.05vw 0.05vw 0.05vw darken($red, 20%);
  border: 0.05vw solid $red;
  border-radius: 100%;
}

.inner-2 {
  @include size(40%);
  background: linear-gradient(to top right, rgba(darken($red, 10%), 0.5), rgba(lighten($purple, 10%), 0.8));
  position: absolute;
  box-shadow: 0 -0.05vw 0px 0.05vw lighten($red, 20%), 0 0.05vw 0.05vw 0.05vw darken($red, 20%);
  border: 0.05vw solid $red;
  border-radius: 100%;
}

.hole {
  @include size(5%);
  background: $BLACK;
  position: absolute;
  border-radius: 100%;
  z-index: 2000;
  box-shadow: inset 0 -0.05vw 0px 0.05vw lighten($purple, 20%), inset 0 0.05vw 0.05vw 0.05vw darken($white, 20%);
}

.album {
  @include position(absolute, 0 0 0 0, 999);
  @include size(100%);
  mix-blend-mode: overlay;
  opacity: 0.85;
  border-radius: 100%;
  overflow: hidden;
}
</style>
