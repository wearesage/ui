<template>
  <RouterView v-slot="{ Component, route }">
    <transition :name="transition">
      <component :is="Component" :key="route.path" />
    </transition>
  </RouterView>
</template>

<script setup lang="ts">
const transition = ref<null | 'view'>(null)

onMounted(async () => {
  await pause(500)
  transition.value = 'view'
})
</script>