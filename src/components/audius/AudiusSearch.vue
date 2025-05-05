<template>
  <header>
    <Icon icon="audius" class="logo" />
    <TextInput
      v-model="audius.query"
      name="query"
      ref="input"
      placeholder="Search Audius"
      @blur="onBlur"
      @focus="onFocus" />
    <CloseButton
      @click="close"
      :to="null" />
  </header>

  <section class="search">
    <AudiusSearchResults />
  </section>
</template>

<script setup lang="ts">
const audius = useAudius();
const keys = useKeys();
const router = useRouter();
const input = ref();

function onBlur() {
  keys.shortcutsEnabled = true;
}

function onFocus() {
  keys.shortcutsEnabled = false;
}

function close() {
  if (audius.query.length) {
    audius.query = '';
    input.value?.forceFocus?.();
    return;
  }

  router.push('/visualizer');
}
</script>

<style lang="scss" scoped>
header {
  @include flex-row(start, center);
  @include box(1, 1);
  width: 100%;

  @include mobile {
    @include box(1, 1);
  }
}

.search {
  @include flex-column(start, start);
  flex: 1;
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
}

strong {
  text-align: center;
  white-space: nowrap;
  text-transform: uppercase;
  font-family: 'Bungee';
  line-height: var(--element-size);
  font-weight: normal;
  font-size: 1rem;
}

.logo {
  @include size(var(--element-size));
}

.close {
  z-index: 20;
}
</style>
