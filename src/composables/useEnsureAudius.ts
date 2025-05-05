export function useEnsureAudius() {
  const visualizer = useVisualizer();

  onMounted(() => {
    if (visualizer.source !== 'AUDIUS') {
      window.addEventListener('click', () => visualizer.selectSource('AUDIUS'), { once: true });
    }
  });
}
