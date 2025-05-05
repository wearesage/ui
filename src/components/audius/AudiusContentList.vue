<template>
  <div class="content-list">
    <ul>
      <li
        v-for="({ artwork, title, user, link }, i) in collection"
        @click="emit('click', i)"
        :key="i">
        <RouterLink
          v-if="link"
          :to="link">
          <img :src="artwork" />
          <strong>{{ trim(title) }}</strong>
          <small>{{ user }}</small>
        </RouterLink>
        <template v-else>
          <img :src="artwork" />
          <strong>{{ trim(title) }}</strong>
          <small>{{ user }}</small>
        </template>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['click']);

defineProps<{ collection: any[] }>();

function trim(str: string) {
  const sliced = str.split('').slice(0, 20).join('');
  if (sliced.length < str.length) return sliced + '...';
  return str;
}
</script>
<style lang="scss" scoped>
$size: 200px;

.content-list {
  @include flex-row(start, start);
  @include scroll-bar;
  width: 100%;
  height: 100%;
  // overflow-x: auto;
}

ul {
  @include flex-row(flex-start, flex-start);
  @include size(100%);
  @include box(.5, .5);
  overflow-y: hidden;
  overflow-x: auto;
}

li {
  @include size(auto, calc(#{$size} + 4rem));
}

li strong {
  width: 100%;
  display: block;
}

img {
  @include size($size);
}

@include mobile {
  $size: 150px;

  li {
    @include size(auto, calc(#{$size} + 4rem));
  }

  img {
    @include size($size);
  }
}
</style>
