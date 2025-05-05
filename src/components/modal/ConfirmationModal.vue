<template>
  <section>
    <span> {{ modal.message }} </span>
    <div>
      <button
        @click="modal.resolve(false)"
        class="no">
        No
      </button>
      <button
        @click="modal.resolve(true)"
        class="yes">
        Yes
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
const modal = useModal();
</script>

<style lang="scss" scoped>
section {
  @include flex(flex-end, flex-start, column);
  gap: 0.5rem;

  div {
    @include flex(center, center, row);
    flex: 1;
    gap: 0.5rem;
  }
}

span {
  font-size: 1.5rem;
}

button {
  width: 100px;
  background: transparent;
  border: 1px solid var(--white);
  padding: 0.5rem 1rem;
  border-radius: 3rem;
  height: 3rem;
  min-width: 5rem;
  transition: var(--hover-transition);

  &:first-of-type {
    margin-left: auto;
  }

  &:hover {
    cursor: pointer;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}

.yes {
  background: var(--pink);
  color: var(--white);
  border: 0;

  &:hover {
    background: var(--white);
    color: var(--pink);
  }
}

.no:hover {
  border-color: var(--pink);
  color: var(--pink);
}
</style>
