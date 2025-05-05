type Study = {
  _id: string;
  iterations: any[];
};

export const useStudies = defineStore('studies', () => {
  const all: Ref<Study[]> = ref([]);

  return {
    all,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useStudies, import.meta.hot));
