<template>
  <section
    class="stripe-onboarding"
    v-if="!account.email">
    <Form
      @submit="addEmail"
      submit-text="Add Email"
      v-if="!account.email">
      <p>To get started, let's add an email address to your account!</p>
    </Form>
  </section>

  <section
    class="stripe-onboarding"
    v-else>
    <H2>Add Payment Method</H2>

    <Form
      @submit="addName"
      v-if="!name.length">
      <div class="row">
        <p>What's your name?</p>
        <input
          name="name"
          placeholder="name" />
      </div>
    </Form>

    <Form
      @submit="addAddress"
      v-if="name.length && !address && !setupIntent">
      <p>Now we need your billing address.</p>
      <input
        name="line1"
        placeholder="address (line 1)" />
      <input
        name="line2"
        placeholder="address (line 2)" />
      <div class="row">
        <input
          name="city"
          placeholder="city" />
        <input
          name="state"
          placeholder="state" />
      </div>

      <div class="row">
        <input
          name="country"
          placeholder="country" />
        <input
          name="postal_code"
          placeholder="postal code" />
      </div>
    </Form>

    <div
      id="elements"
      :class="{ visible: setupIntent }">
      <p>Enter your credit card number, powered securely by <strong>Stripe</strong>.</p>
      <div class="elements-inner">
        <StripeElements
          v-if="loaded"
          v-slot="{ elements }"
          ref="elms"
          :stripe-key="STRIPE_KEY">
          <StripeElement
            ref="card"
            :elements="elements"
            :options="options" />
        </StripeElements>
      </div>
      <Button @click="saveCard">Submit</Button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { StripeElements, StripeElement } from 'vue-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

const { createCustomer, createSetupIntent, savePaymentMethod } = useStripeAPI();

const account = useAccount();
const modal = useModal();
const toast = useToast();
const loaded = ref(false);

let stripe: any = null;

const name = ref('');
const address = ref<any>(null);
const setupIntent = ref(null);
const customerId = ref<any>(null);
const card = ref(null);
const elms: any = ref(null);
const options = ref({
  style: {
    base: {
      iconColor: '#f550b6',
      color: '#f550b6',
      fontWeight: '300',
      fontFamily: 'monospace',
      fontSize: '1.25rem',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: 'rgba(255, 255, 255, .5)',
      },
      ':-webkit-autofill': {
        color: 'rgba(255, 255, 255, 0)',
      },
    },
  },
});

async function addEmail() {
  try {
    const data: any = await modal.open('AuthModal', {
      requestLoginCode,
      submitLoginCode,
      forceMethod: 'email',
      validateOnly: true,
      headerText: 'Add Email',
    });

    if (data?.valid) {
      const { success }: any = await account.updateSelf({ email: data.value });
      if (success) return toast.message('Email added!');
      toast.error('Error updating email address.');
    }
  } catch (e) {}
}

function addName(data) {
  if (!data.name?.length) return toast.error('Oops! Your name is required.');
  name.value = data.name;
}

async function addAddress(addr: any) {
  if (!addr.city || !addr.country || !addr.line1 || !addr.postal_code) return toast.error('Please fill out require fields.');
  address.value = addr;
  const {
    data: { id: customer },
  } = await createCustomer({ name: name.value, email: account.email, address: address.value });
  customerId.value = customer;
  const {
    data: { clientSecret },
  } = await createSetupIntent({ customer });
  setupIntent.value = clientSecret;
}

async function saveCard() {
  try {
    const response = await elms.value.instance.confirmCardSetup(setupIntent.value, {
      payment_method: { card: (card.value as any)?.stripeElement },
    });

    const { success, data } = await savePaymentMethod({
      paymentMethodId: response.setupIntent.payment_method,
      customerId: customerId.value,
    });

    if (success) {
      console.log({ ...clone(account.user), stripe: data })
      const { success, user } = account.updateSelf({ ...clone(account.user), stripe: data });
      console.log(user)

      if (success) account.login(user);
    }
  } catch (e) {
    console.log(e);
  }
}

onMounted(async () => {
  stripe = await loadStripe(STRIPE_KEY);
  loaded.value = true;
});
</script>

<style lang="scss" scoped>
section {
  @include padding(1 0);
  @include vertical-rhythm(1);
  @include flex(start, start);
  width: var(--menu-content-width);
  margin: 0 auto;
}

input {
  @include button;
  width: 100%;
  background: transparent !important;
  outline: 0;
  font-weight: 100;
}

.row {
  @include flex-row(space-between);
  @include gap;
  width: 100%;

  p {
    flex-shrink: 0;
    flex-grow: 1;
  }

  input {
    flex-shrink: 1;
    flex-grow: 0;
  }
}

$max-width: var(--menu-content-width);

#elements {
  display: flex;
  width: 100%;
  height: var(--element-size);
  max-width: $max-width;
  transition: var(--base-transition);
  gap: 1rem;
  flex-direction: column;
  opacity: 0;
  pointer-events: none;

  @include mobile-portrait {
    flex-direction: column;
    width: 100%;
  }

  .elements-inner {
    height: var(--element-size);
    border: 1px solid lighten($black, 20%);
    padding: 0.8rem;
    border-radius: 100px;
  }

  &.visible {
    opacity: 1;
    pointer-events: all !important;
  }

  button {
    width: fit-content;
  }
}

form {
  @include vertical-rhythm(.5);
}

:deep(form) {
  @include mobile {
    padding: 0 !important;
  }
}

strong {
  color: $purple;
}
</style>
