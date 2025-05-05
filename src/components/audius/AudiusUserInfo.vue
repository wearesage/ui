<template>
  <div class="user-info">
    <img
      class="profile"
      :src="user?.profile_picture?.['480x480']" />
    <div class="col">
      <strong class="name">{{ user?.name }}</strong>
      <small class="handle">@<RouterLink :to="`/audius/users/${user?.handle}`">{{ user?.handle }}</RouterLink></small>
      <AudiusUserSocials :user="user" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ user: any }>();
</script>

<style lang="scss" scoped>
.profile {
  @include size(calc(3 * var(--element-size)));
  border-radius: 100%;

  @include mobile {
    @include size(calc(1.5 * var(--element-size)));
  }
}

.user-info {
  @include flex-row(start, center);
  @include gap;
  @include padding(1 0);
  width: 100%;
  position: relative;
  z-index: 10;

  @include mobile {
    @include flex-row(start, start);
  }
}

.col {
  @include flex-column(start, start);
}

.name {
  font-size: 2rem;
}

.name,
.handle {
  line-height: 1;
}

.social {
  margin-top: 1rem;
}
</style>
