<template>
  <div class="spinner"><i /></div>
</template>

<style lang="scss" scoped>
.spinner {
  @include flex;
}

i,
i:after {
  border-radius: 50%;
  width: 10em;
  height: 10em;
}

i {
  @include size(50px);
  position: absolute;
  display: block;
  margin: 0 auto;
  font-size: 10px;
  text-indent: -9999em;
  border-top: 0.25rem solid var(--white);
  border-right: 0.25rem solid var(--white);
  border-bottom: 0.25rem solid var(--white);
  border-left: 0.25rem solid transparent;
  will-change: transform;
  transform-origin: center center;
  animation: spin 1.1s infinite linear;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
