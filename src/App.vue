<template>
  <ToolTip />
  <Toast />
  <BaseModal />
  <Loading />
  <Root />
</template>

<script setup lang="ts">
import './styles.scss';

useViewport().initialize()
useRAF();
useFetchShaders();
useVisualizer();
useAccount();
useNavigation();
</script>
