export function useSlotNames() {
  const slots = useSlots();
  const names = computed(() => Object.keys(slots));
  return names;
}
