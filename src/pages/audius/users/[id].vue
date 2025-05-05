<template>
  <main>
    <LoadingIndicator :visible="loading" />
    <CloseButton to="/audius" />
    <AudiusProfileHeader :user="user" />
    <AudiusTrackList :tracks="user?.tracks || []" />
  </main>
</template>

<script setup lang="ts">
const loading = ref(true);
const route: any = useRoute();
const { fetchUserByHandle } = useAudiusAPI();
const user = ref(null);

useKeyboardShortcuts();
useEnsureAudius();

onMounted(async () => {
  const response: any = await fetchUserByHandle(route.params.id);
  user.value = response.success ? response.user : null;
  loading.value = false;
});
</script>

<style lang="scss" scoped>
main {
  @include flex-column(start, start);
}

.close {
  @include position(absolute, 1rem 1rem null null, 10);
}

.profile-header {
  @include size(100%, 35vh);
  flex-shrink: 0;
}

.tracks {
  @include size(50vw, 100%);
  flex: 1;
  overflow-y: auto;

  @include mobile {
    width: 100%;
  }
}
</style>
