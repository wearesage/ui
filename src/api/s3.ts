import api from './base';

export function useS3API() {
  const account = useAccount();

  let API: any = ref(null);

  watch(
    () => account.token,
    (val: any) => {
      API.value = api('s3', val);
    },
    {
      immediate: true,
    }
  );

  async function uploadImage({ image, id, folder }: { image: string; id: string; folder: string }) {
    if (!API.value) return { success: false, sketch: {} };
    const { status, data } = await API.value.post(folder, { image, id });
    return { success: status < 300 && data?.success };
  }

  async function uploadThumbnail({ image, id }: { image: string; id: string }) {
    return uploadImage({ image, id, folder: 'thumbs' });
  }

  async function uploadOGimage({ image, id }: { image: string; id: string }) {
    return uploadImage({ image, id, folder: 'og-images' });
  }

  return {
    uploadThumbnail,
    uploadOGimage,
  };
}
