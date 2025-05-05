<template>
  <ul class="social" v-if="user">
    <li v-if="user.website">
      <a
        :href="website"
        target="_blank">
        <Icon icon="globe" />
      </a>
    </li>

    <li v-if="user.twitter_handle">
      <a
        :href="`https://www.twitter.com/${user.twitter_handle}`"
        target="_blank">
        <Icon icon="twitter" />
      </a>
    </li>

    <li v-if="user.instagram_handle">
      <a
        :href="`https://www.instagram.com/${user.instagram_handle}`"
        target="_blank">
        <Icon icon="instagram" />
      </a>
    </li>

    <li v-if="user.tiktok_handle">
      <a
        :href="`https://www.tiktok.com/@${user.tiktok_handle}`"
        target="_blank">
        <Icon icon="tiktok" />
      </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
const props = defineProps<{
  user: any;
}>();

const website = computed(() => {
  let url = props.user.website;

  if (url.indexOf('http://') === -1 && url.indexOf('https://') === -1) {
    url = 'https://' + url;
  } else if (url.indexOf('http://') !== -1) {
    url = url.replace('http://', 'https://');
  }

  return url;
});
</script>

<style lang="scss" scoped>
ul {
  @include flex(start, start, row);
  gap: 1rem;
}

svg {
  @include size(2rem);
  fill: $white;
  transition: var(--hover-transition);
}

a:hover svg {
  fill: $pink;
}
</style>
