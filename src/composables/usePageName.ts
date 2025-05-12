export function usePageName() {
  const route = useRoute();
  return route?.name || "";
}
