import api from './base';

export function useStudiesAPI() {
  const account = useAccount();

  let API: any = ref(null);

  watch(
    () => account.token,
    (val: any) => {
      API.value = api('studies', val);
    },
    {
      immediate: true,
    }
  );

  async function getUserStudies(userId: string | null = null) {
    if (!API.value) return;
    const id = userId || account?.user?._id
    const { status, data } = await API.value.get(`?author=${id}`);

    return {
      success: status < 300,
      studies: data
    }
  }

  async function getStudyById(studyId: string | null = null) {
    if (!API.value) return;
    
    const { status, data } = await API.value.get(`${studyId}`);

    return {
      success: status < 300,
      study: data
    }
  }

  async function updateStudy(study: any) {
    if (!API.value) return

    const { status, data } = await API.value.put(`${study._id}`, study)

    return {
      success: status < 300,
      study: data
    }
  }

  async function createNewStudy() {
    if (!API.value) return;
    
    const { status, data } = await API.value.post('', { author: account.id });

    return {
      success: status < 300,
      study: data
    }
  }

  async function deleteStudy (studyId: string) {
    if (!API.value) return

    const { status, data } = await API.value.del(studyId)

    return {
      success: status < 300,
      data
    }
  }


  return {
    getUserStudies,
    getStudyById,
    createNewStudy,
    updateStudy,
    deleteStudy
  };
}
