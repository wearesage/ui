export function useFetchShaders() {
  const { getSketches } = useSketchAPI();
  const editor = useEditor();
  const shaders = useShaders();

  onMounted(async () => {
    if (shaders.published.length) {
      if (!editor.activeSketch) return editor.selectSketch(sample(shaders.published));
    }

    const { sketches }: any = await getSketches();
    shaders.set(sketches);
    editor.selectSketch(sample(shaders.published));
  });

  return shaders;
}
