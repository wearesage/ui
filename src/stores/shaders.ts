export const useShaders = defineStore('shaders', () => {
  const published: Ref<any> = ref([]);
  const thumbnails = useThumbnails();

  async function set(shaders: any[]) {
    published.value = shaders;
    thumbnails.patchVersions(published.value);
  }

  return {
    set,
    published,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useShaders, import.meta.hot));
