<template>
  <Button
    icon="coffee"
    class="donate"
    @click="router.push('/donate')" />
</template>

<script setup lang="ts">
const router = useRouter();
</script>

<style lang="scss" scoped>
.donate {
  // @include size(fit-content, var(--element-size));

  // @include position(fixed, 0 0 null null, 50);
  // transform: translateY(-50%);
  // border-top-left-radius: 0;
  // border-bottom-left-radius: 0;
  transition: var(--base-transition);
  background: $black;
  // border-color: $pink;
  // border: 0;

  // padding: 0;

  background: transparent;
  color: $white;
  cursor: pointer;

  :deep(svg) {
    fill: $white;
  }

  &:hover,
  &:active {
    background: linear-gradient(to top right, rgba($pink, 0.5), lighten(rgba($purple, 0.9), 0%));
    background-color: $pink;
  }
}
</style>
