<template>
  <div>
    <Button icon="upload">
      <span>Select Audio File</span>
      <input
        type="file"
        ref="input"
        @change="onChange" />
    </Button>
    <CloseButton
      class="close"
      @click="modal.close()" />
  </div>
</template>

<script setup lang="ts">
const input = ref();
const audio = useAudio();
const modal = useModal();

modal.transparent = true;

function onChange({ target }: any) {
  const file = target.files[0];

  if (file) {
    audio.player.file = file;
    audio.player.src = URL.createObjectURL(file);
    audio.play();
    modal.resolve(null);
  }
}
</script>

<style lang="scss" scoped>
div {
  @include center;
  @include flex-row;
  @include box;
}

button {
  @include flex(center, center, row);
  padding: 1rem;
  gap: 1rem;
  position: relative;
  color: $white;
  border: 1px solid $white;
  border-radius: 50px;

  svg :deep(*) {
    fill: $white;
  }
}

input {
  @include position(absolute, 0 0 0 0);
  opacity: 0;
}
</style>
