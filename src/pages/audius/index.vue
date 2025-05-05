<template>
  <main>
    <AudiusSearch />
    <LoadingIndicator :visible="audius.searching" />
    <Transition name="fade">
      <div v-if="!audius.searching && !audius.hasSearchResults">
        <AudiusTrending collection="Playlists" />
        <AudiusTrending collection="Tracks" />
      </div>
    </Transition>
  </main>
</template>

<script setup lang="ts">
const audius = useAudius();
useKeyboardShortcuts();
useEnsureAudius();
</script>

<style lang="scss" scoped>
main {
  @include flex-column(start, start);

  @include mobile {
    padding-right: env(safe-area-inset-right);
    padding-left: env(safe-area-inset-left);
  }
}

div {
  @include flex-column(start, start);
  @include size(100%);
  @include box(0, 1);
  flex-shrink: 0;
}
</style>
