function ga() {
  (window as any).gtag?.('event', 'page_view', {
    page_path: window.location.pathname,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export const useNavigation = defineStore('navigation', () => {
  const account = useAccount();
  const router = useRouter();
  const route = useRoute();
  const stack = ref<any>([]);
  const lastPage = computed(() => stack.value?.[stack.value.length - 2] || null);
  const currentPage = computed(() => route);

  watch(
    () => route.path,
    () => {
      const { name, meta, path } = route;
      stack.value = [...stack.value, { name, meta, path }];
      nextTick().then(ga);
    },
    {
      immediate: true,
    }
  );

  watch(
    () => account.hydrated,
    () => {
      nextTick().then(() => {
        if (!account.hydrated || route.meta.requiresAuth === false) return;
        if (account.hydrated && !account.authenticated) router.push('/');
      });
    },
    {
      immediate: true,
    }
  );

  return {
    lastPage,
    currentPage,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useNavigation, import.meta.hot));
