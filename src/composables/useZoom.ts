import { ref, onMounted, type Ref, type ComputedRef, watch } from "vue";
import { select } from "d3-selection";
import { zoom, zoomIdentity, ZoomTransform, type D3ZoomEvent } from "d3-zoom";
import "d3-transition";

interface ZoomOptions {
  minZoom?: number;
  maxZoom?: number;
  translateExtent?: [[number, number], [number, number]];
  scaleExtent?: [number, number];
  duration?: number;
  touchEnabled?: boolean;
}

export function useZoom(
  element: Ref<HTMLElement | null>,
  options: Ref | ComputedRef<ZoomOptions>
) {
  const transform = ref<ZoomTransform>(zoomIdentity);
  const zoomBehavior = zoom<HTMLElement, unknown>()
    .scaleExtent(options.value.scaleExtent || [1, 8])
    .on("zoom", (event: D3ZoomEvent<HTMLElement, unknown>) => {
      transform.value = event.transform;
    });

  const touchEnabled = options.value.touchEnabled !== false;

  if (options.value.translateExtent) {
    zoomBehavior.translateExtent(options.value.translateExtent);
  }

  watch(
    () => options.value,
    (val) => {
      if (val.translateExtent) {
        zoomBehavior.translateExtent(val.translateExtent);
      }

      if (val.scaleExtent) {
        zoomBehavior.scaleExtent(val.scaleExtent);
      }
    }
  );

  function resetZoom(duration = options.value.duration || 250) {
    if (!element.value) return;

    select(element.value)
      .transition()
      .duration(duration)
      .call(zoomBehavior.transform, zoomIdentity);
  }

  function setTransform(
    newTransform: ZoomTransform,
    duration = options.value.duration || 0
  ) {
    if (!element.value) return;

    select(element.value)
      .transition()
      .duration(duration)
      .call(zoomBehavior.transform, newTransform);
  }

  onMounted(() => {
    if (!element.value) return;
    const selection = select(element.value);
    selection.call(zoomBehavior);
    if (touchEnabled) element.value.style.touchAction = "none";
  });

  return {
    transform,
    zoomBehavior,
    resetZoom,
    setTransform,
  };
}
