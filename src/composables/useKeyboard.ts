import { onMounted, onBeforeUnmount } from 'vue';

export function useKeyboard(
  key: string,
  callback: any
) {

  function onKeyDown ({ key: _key }: any) {
    if (_key === key) callback?.()
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown);
  });
}
