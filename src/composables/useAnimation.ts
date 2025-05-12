import { onMounted, onBeforeUnmount } from "vue";
import { useRAF } from "../stores/raf";

export function useAnimation(tick: ({ now }: { now: DOMHighResTimeStamp }) => void) {
  const { add, remove } = useRAF();
  const name = ref(`animation-${Math.floor(Math.random() * 100000000)}`)

  onMounted(() => {
    add({
      tick,
    }, name.value);
  });

  onBeforeUnmount(() => {
    remove(name.value);
  });
}
