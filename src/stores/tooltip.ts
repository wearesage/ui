export const useTooltip = defineStore('tooltip', () => {
  const { height } = useViewport();
  const actions = ref<any[]>([]);
  const visible = ref<boolean>(false);
  const position = ref<number[]>([0, 0]);

  async function show(data: any[], [x, y1]: number[]) {
    const element = document.getElementById('tooltip') as HTMLElement;
    actions.value = data;
    visible.value = true;
    await nextTick();
    const y = Math.min(height - element.offsetHeight - 15, y1);
    position.value = [x, y];
  }

  function hide() {
    visible.value = false;
  }

  return { actions, visible, position, show, hide };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useTooltip, import.meta.hot));
