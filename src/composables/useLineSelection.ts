export function useLineSelection({
  container,
  lines,
  lyrics,
  audio,
}: {
  container: Ref<HTMLElement | null>;
  lines: any;
  lyrics: any;
  audio: any;
}) {
  const selectedLines = ref(new Set());
  const isDragging = ref(false);
  const dragStartLine = ref(-1);
  const dragCurrentLine = ref(-1);
  const selected = computed(() =>
    [...selectedLines.value].map((v: any) => lines.value[v].join("")).join("\n")
  );

  function isLineSelected(lineIndex: number) {
    return selectedLines.value.has(lineIndex);
  }

  function toggleLineSelection(lineIndex: number, event: any) {
    if (!isDragging.value) {
      if (event.shiftKey && dragStartLine.value >= 0) {
        // Shift+click: select range of lines
        const start = Math.min(dragStartLine.value, lineIndex);
        const end = Math.max(dragStartLine.value, lineIndex);

        for (let i = start; i <= end; i++) {
          selectedLines.value.add(i);
        }
      } else if (event.ctrlKey || event.metaKey) {
        // Ctrl/Cmd+click: toggle selection
        if (selectedLines.value.has(lineIndex)) {
          selectedLines.value.delete(lineIndex);
        } else {
          selectedLines.value.add(lineIndex);
        }
      } else {
        // Regular click: clear selection and select only this line
        selectedLines.value.clear();
        selectedLines.value.add(lineIndex);
      }

      dragStartLine.value = lineIndex;
    }
  }

  function startSelection(event: any) {
    // Find which line was clicked by checking all p elements
    const elements = Array.from(event.currentTarget.querySelectorAll("p"));
    const index = elements.findIndex((el: any) => el.contains(event.target));

    if (index >= 0) {
      isDragging.value = true;

      // If not extending existing selection with Ctrl/Cmd, clear selection
      if (!(event.ctrlKey || event.metaKey)) {
        selectedLines.value.clear();
      }

      dragStartLine.value = index;
      dragCurrentLine.value = index;
      selectedLines.value.add(index);
    }
  }

  function updateSelection(event: any) {
    if (!isDragging.value) return;

    // Find which line is currently under the cursor
    const elements = Array.from(event.currentTarget.querySelectorAll("p"));
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeY = event.clientY - rect.top + event.currentTarget.scrollTop;

    // Find the element at the current mouse position
    let currentIndex = -1;
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as any;
      const elRect = el.getBoundingClientRect();
      const elTop = elRect.top - rect.top + event.currentTarget.scrollTop;
      const elBottom = elTop + elRect.height;

      if (relativeY >= elTop && relativeY <= elBottom) {
        currentIndex = i;
        break;
      }
    }

    if (currentIndex >= 0 && currentIndex !== dragCurrentLine.value) {
      dragCurrentLine.value = currentIndex;

      // Clear selection and recompute it based on drag start and current position
      selectedLines.value.clear();
      const start = Math.min(dragStartLine.value, currentIndex);
      const end = Math.max(dragStartLine.value, currentIndex);

      for (let i = start; i <= end; i++) {
        selectedLines.value.add(i);
      }
    }
  }

  function endSelection() {
    isDragging.value = false;
  }

  // Function to seek audio to selected line time
  function seekToLine(lineIndex: number) {
    if (lyrics.processed && lyrics.processed[lineIndex]) {
      const time = lyrics.processed[lineIndex].time;
      audio.seek(time / audio.player.duration);
    }
  }
  
  onMounted(() => {
    container.value?.addEventListener("mousedown", startSelection);
    container.value?.addEventListener("mouseup", endSelection);
    container.value?.addEventListener("mousemove", updateSelection);
  });

  onBeforeUnmount(() => {
    container.value?.removeEventListener("mousedown", startSelection);
    container.value?.removeEventListener("mouseup", endSelection);
    container.value?.removeEventListener("mousemove", updateSelection);
  });

  return {
    selected,
    seekToLine,
    isLineSelected,
    toggleLineSelection,
  };
}
