<template>
  <ul>
    <li>
      <Icon icon="spotify" />
      <span>Spotify</span>
    </li>
    <li>
      <Icon icon="audius" />
      <span>Audius</span>
    </li>
    <li>
      <Icon icon="microphone" />
      <span>Microphone</span>
    </li>
    <li>
      <Icon icon="radio-paradise" />
      <span>Radio Paradise</span>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
ul {
  @include flex(start, start, row);
  height: fit-content;
  line-height: 1;
  gap: 1rem;
  flex-wrap: wrap;
  position: relative;
  transition: var(--base-transition);
  z-index: 20;

  @include mobile {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
}

%inputs {
  font-size: calc(2rem * 0.5);
}

li {
  @include flex(center, start, row);
  gap: 0.5rem;

  span {
    @extend %inputs;
  }

  @include mobile {
    line-height: 1;
  }
}

ul p {
  @extend %inputs;
  font-weight: 300;
  opacity: 0.75;
  line-height: 1;

  @include mobile {
    line-height: 1;
  }
}

svg {
  @include size(16px);
  fill: var(--yellow);
  display: block;
}

li:nth-child(1) svg {
  fill: var(--green);
}

li:nth-child(2) svg {
  fill: var(--purple);
}

li:nth-child(3) svg {
  fill: var(--blue);
}

li:nth-child(4) svg {
  fill: var(--yellow);
}
</style>
