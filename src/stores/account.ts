import BaseAPI from '../api/base';

const ls = createdNamespacedStorageHelpers('store:account');

type User = {
  phone: string | null;
  email: string | null;
  joined: string;
  lastSeen: string;
  _id: string;
  token: string;
  subscription: any;
  stripe: any;
  visualizer: any;
};

export const useAccount = defineStore('account', () => {
  let API: any = ref(null);

  const user = ref<User | null>(null);
  const token = ref<string | null>(ls.get('token'));
  const id = ref(ls.get('id'));
  const authenticated = ref(false);
  const hydrated = ref(false);
  const subscription = ref(null);
  const type = computed(() => (!!user.value?.subscription ? 'Premium' : 'Free'));
  const premium = computed(() => type.value === 'Premium');
  const email = computed(() => user.value?.email || null);
  const phone = computed(() => user.value?.phone || null);
  const stripeCustomer = computed(() => user.value?.stripe?.customer || null);
  const paymentMethod = computed(() => user.value?.stripe?.paymentMethod || null);
  const settings = ref(clone(user.value?.visualizer) || null);
  const updatingSettings = ref(false);

  watch(
    () => user.value,
    (value: any) => {
      id.value = value._id
      token.value = value.token
      ls.set('token', token.value)
      ls.set('id', id.value)
      updatingSettings.value = true;
      settings.value = clone(value.visualizer);
    },
    {
      deep: true,
    }
  );


  let timeout: any = null

  watch(
    () => settings.value,
    val => {
      if (updatingSettings.value) {
        updatingSettings.value = false;
        return;
      }

      clearTimeout(timeout)
      timeout = setTimeout(() => updateSelf({ visualizer: val }), 150)
    },
    {
      deep: true,
    }
  );

  async function login(data: any = user.value) {
    user.value = data;
    if (user.value && typeof token.value === 'string') fetchSubscription();
    authenticated.value = !!user.value && !!token.value && !!id.value;
    hydrated.value = true;
  }

  async function fetchSelf() {
    const response = await API.value.get(id.value);
    return { success: response?.status === 200, user: response?.data || null };
  }

  async function updateSelf(updates: unknown) {
    if (!API.value || !id.value) return;

    const response = await API.value.put(id.value, updates || {});

    if (response?.status) {
      if (response.status === 200) user.value = response.data;

      return {
        success: response.status === 200,
        user: response.data,
      };
    }
  }

  async function fetchSubscription() {
    if (!user.value?.subscription) return;

    try {
      const API = BaseAPI('subscriptions', token.value);
      const { status, data } = (await API.get(user?.value?.subscription)) as any;

      if (status < 300) {
        subscription.value = data;
        return { sucess: true };
      }

      return { success: false };
    } catch (e) {
      console.log(e);
      return { success: false };
    }
  }

  async function startSubscription() {
    if (!token.value) return;

    try {
      const API = BaseAPI('subscriptions', token.value);
      const { status, data }: any = await API.post('', { user: id.value });
      if (status >= 300) return { success: false };
      updateSelf({ subscription: data._id });
      subscription.value = data;
    } catch (e) {
      console.log(e);
      return { success: false };
    }
  }

  async function cancelSubscription() {
    if (!token.value || !subscription.value) return;

    try {
      const API = BaseAPI('subscriptions', token.value);
      const { status, data }: any = await API.put(user.value?.subscription, { ended: Date.now(), active: false });
      if (status >= 300) return { success: false };
      subscription.value = data;
    } catch (e) {
      console.log(e);
      return { success: false };
    }
  }

  async function resumeSubscription() {
    if (!token.value || !subscription.value) return;

    try {
      const API = BaseAPI('subscriptions', token.value);
      const { status, data }: any = await API.put(user.value?.subscription, { ended: null, active: true });
      if (status >= 300) return { success: false };
      subscription.value = data;
    } catch (e) {
      console.log(e);
      return { success: false };
    }
  }

  async function hydrate () {
    if (!token.value || !id.value) return login(null);
    API.value = BaseAPI('users', token.value);
    const data = await fetchSelf();
    if (data.success && data.user) login(data.user)
  }

  hydrate()

  return {
    user,
    token,
    login,
    id,
    fetchSelf,
    updateSelf,
    authenticated,
    hydrated,
    type,
    email,
    phone,
    premium,
    stripeCustomer,
    paymentMethod,
    startSubscription,
    cancelSubscription,
    resumeSubscription,
    subscription,
    settings,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useAccount, import.meta.hot));
