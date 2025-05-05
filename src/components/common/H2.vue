<template>
  <h2><slot /></h2>
</template>

<style lang="scss" scoped>
h2 {
  @include text-gradient($orange, $yellow);
  font-size: 1.5rem;
  line-height: var(--element-size);
  font-weight: 700;
}
</style>
