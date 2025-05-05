export function useKeyboardShortcuts() {
  const route = useRoute();
  const keys = useKeys();
  const { push } = useRouter();

  useKeyboard('v', () => keys.shortcutsEnabled && push('/designs'));
  useKeyboard('Escape', () => {
    if (route.name === '/audius/playlists/[id]' || route.name === '/audius/users/[id]') return push('/audius');
    return keys.shortcutsEnabled && push('/visualizer');
  });
  useKeyboard('s', () => keys.shortcutsEnabled && push('/settings'));
  useKeyboard('m', () => keys.shortcutsEnabled && push('/audius'));
}
