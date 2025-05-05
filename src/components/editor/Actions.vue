<template>
  <nav>
    <RouterLink to="/designs">
      <button>
        <Icon icon="grid" />
      </button>
    </RouterLink>
    <button @click="modal.open('AudioSourceModal')" background="var(--black)">
      <Icon :icon="visualizer.sourceIcon" />
    </button>
    <button tooltip="Create New" @click="$emit('new')">
      <Icon icon="plus" />
    </button>
    <!-- <button
      tooltip="Save Changes"
      :disabled="!dirty"
      @click="$emit('save')">
      <Icon icon="save" />
    </button> -->
    <button tooltip="Undo Changes" :disabled="!dirty" @click="$emit('undo')">
      <Icon icon="restore" />
    </button>
    <!-- <button
      @click="$emit('clone')"
      tooltip="New Iteration">
      <Icon icon="clone" />
    </button> -->
    <button tooltip="Generate Still" @click="$emit('print')">
      <Icon icon="print" />
    </button>
    <button tooltip="Download JSON" @click="$emit('json')">
      <Icon icon="json" />
    </button>
    <button tooltip="Copy Shader to Clipboard (Raw)" @click="$emit('raw')">
      <Icon icon="raw" />
    </button>
    <button tooltip="Copy Shader to Clipboard (ShaderToy)" @click="$emit('shadertoy')">
      <Icon icon="shadertoy" />
    </button>
    <button @click="$emit('fullscreen')">
      <Icon icon="fullscreen" />
    </button>
  </nav>
</template>

<script setup lang="ts">
const visualizer = useVisualizer();
const modal = useModal();

defineProps<{
  dirty: boolean;
}>();

defineEmits(['new', 'save', 'undo', 'clone', 'print', 'json', 'raw', 'shadertoy', 'source', 'fullscreen']);
</script>

<style lang="scss" scoped>
nav {
  @include position(absolute, 0 null 0 0, 3);
}

button {
  @include nav-button;
}

@include mobile {
  nav {
    @include position(absolute, auto 0 0 0, 3);
    @include flex-row;
  }
}
</style>
