import api from './base';
import { useS3API } from './s3';

export function useSketchAPI() {
  const account = useAccount();
  const thumbnails = useThumbnails();
  const studyAPI = useStudiesAPI();
  const s3API = useS3API();

  let API: any = ref(null);

  watch(
    () => account.token,
    (val: any) => {
      API.value = api('iterations', val);
    },
    {
      immediate: true,
    }
  );

  async function getSketchById(iterationId: string | null = null) {
    if (!API) return { success: false, sketch: {} };

    const { status, data } = await API.value.get(`${iterationId}`);

    return {
      success: status < 300,
      sketch: data,
    };
  }

  async function updateSketch(sketch: any) {
    if (!API.value) return { success: false, sketch: {} };

    const { status, data } = await API.value.put(`${sketch._id}`, sketch);

    if (status < 300 && data) {
      await Promise.all([
        s3API.uploadThumbnail({
          image: (await thumbnails.generateThumbnail(sketch)) as string,
          id: sketch._id,
        }),

        s3API.uploadOGimage({
          image: (await thumbnails.generateOgImage(sketch)) as string,
          id: sketch._id,
        }),
      ]);

      return {
        success: true,
        sketch: data,
      };
    }

    return {
      success: false,
    };
  }

  async function createNewSketch({ shader, variants, study }: any) {
    if (!API) return { success: false, sketch: {} };

    const { status, data } = await API.value.post('', { author: account.id, shader, variants, study });

    if (status < 300 && data) {
      await Promise.all([
        s3API.uploadThumbnail({
          image: (await thumbnails.generateThumbnail(data)) as string,
          id: data._id,
        }),

        s3API.uploadOGimage({
          image: (await thumbnails.generateOgImage(data)) as string,
          id: data._id,
        }),
      ]);

      return {
        success: status < 300,
        sketch: data,
      };
    }

    return {
      success: false,
    };
  }

  async function deleteSketch (sketchId: string, studyId: string) {
    const { study } = await studyAPI.getStudyById(studyId)
    study.iterations = study.iterations.filter(v => v !== sketchId)
    await studyAPI.updateStudy(study)
    await API.value.del(sketchId)
  }

  async function getSketches() {
    const { status, data } = (await api('public').get('sketches') as any)

    if (status < 300) {
      return {  
        success: true,
        sketches: data
      }
    }
  }

  return {
    getSketchById,
    updateSketch,
    createNewSketch,
    getSketches,
    deleteSketch
  };
}
