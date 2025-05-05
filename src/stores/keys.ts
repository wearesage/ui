export const useKeys = defineStore('keys', () => {
  const shortcutsEnabled = ref(true);

  return {
    shortcutsEnabled,
  };
});
