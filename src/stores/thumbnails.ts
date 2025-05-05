const ls = createdNamespacedStorageHelpers('store:thumbnails');

export const useThumbnails = defineStore('thumbnails', () => {
  const versions = ref(ls.get('versions') || {});
  const image: Ref<null | string> = ref(null);
  const _resolve = ref();

  function patchVersions(v: any[]) {
    v.forEach(({ _id, __v }: { _id: string; __v: number }) => {
      versions.value[_id] = __v;
    });
    
    ls.set('versions', versions.value);
  }

  function generateImage(data: any, { width, height }, getterProp = 'thumbnail') {
    const div = document.createElement('div') as HTMLElement;

    div.style.width = width
    div.style.height = height
    div.style.position = 'fixed';
    div.style.bottom = '0px';
    div.style.right = '0px';
    div.style.opacity = '0';
    div.style.zIndex = '-10';
    div.style.pointerEvents = 'none';

    document.body.appendChild(div);

    return new Promise(resolve => {
      const shader = new Shader({
        fragmentShader: data.shader,
        uniforms: data.variants[0],
        animate: false,
        dpr: 1,
        parent: div,
        debug: true,
        onError(e, instance) {
          console.log(e, instance);
        },
      });

      shader.tick(window.performance.now());
      resolve(shader[getterProp]);

      shader.destroy();
      div.remove();
    });
  }

  function resolve(data: any) {
    image.value = data;
    _resolve.value?.(data);
  }

  function generateThumbnail (data: any) {
    return generateImage(data, { width: '800px', height: '800px' })
  }

  function generateOgImage (data: any) {
    return generateImage(data, { width: '1200px', height: '630px' })
  }

  function generatePrint (data: any) {
    return generateImage(data, { width: '6000px', height: '4000px' }, 'print')
  }

  return {
    versions,
    image,
    patchVersions,
    generateThumbnail,
    generateOgImage,
    generatePrint,
    resolve
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useThumbnails, import.meta.hot));
