<template>
  <aside class="profile-header">
    <div class="info-container">
      <AudiusUserInfo :user="user" />
    </div>
    <img
      class="cover"
      :src="user?.cover_photo?.['2000x']" />
  </aside>
</template>

<script setup lang="ts">
defineProps<{ user: any }>();
</script>

<style lang="scss" scoped>
aside {
  @include flex(end, end);
  position: relative;
  overflow: hidden;
}

.cover {
  @include size(auto);
  @include position(absolute, 50% null null 50%, -1);
  min-width: 100%;
  min-height: 100%;
  transform: translateX(-50%) translateY(-50%);
}

.info-container {
  @include size(100%);
  @include flex-column(end, end);
  background: linear-gradient(to top, rgba($purple, 1), transparent);

  .user-info {
    width: 50vw;
    margin: 0 auto;

    @include mobile {
      @include box;
      width: 100%;
    }
  }
}
</style>
