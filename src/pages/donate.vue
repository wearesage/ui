<route lang="json">
  {
    "meta": {
      "requiresAuth": false
    }
  }
  </route>

<template>
  <main>
    <div class="container">
      <button
        class="back"
        @click="back()"
        >Back</button
      >
      <div class="h1-container">Support <H1>5HT</H1></div>
      <div class="pad">
        <p>
          5HT was designed &amp; developed by
          <a
            href="https://www.zachwinter.com"
            target="_blank"
            >Zach Winter</a
          >, a Creative Technologist from the United Statess. <br /><br />
          Make a one-time donation below to help support the project's ongoing development.
        </p>

        <!-- <h2>Payment Method</h2> -->

        <div
          class="row methods"
          :class="{ visible: method !== 'STRIPE' }">
          <Button
            icon="card"
            class="stripe"
            :class="{ active: method === 'STRIPE' }"
            @click="select('STRIPE')">
            <div class="col">
              <span>Credit / Debit Card</span>
              <strong>Powered by Stripe</strong>
            </div>
          </Button>

          <div class="crypto">
            <Button
              icon="bitcoin"
              :class="{ active: method === 'BTC' }"
              @click="select('BTC')">
              <div class="col">
                <span>BTC</span>
                <!-- <strong>Powered by Stripe</strong> -->
              </div>
            </Button>

            <Button
              icon="ethereum"
              :class="{ active: method === 'ETH' }"
              @click="select('ETH')">
              <div class="col">
                <span>ETH</span>
                <!-- <strong>Powered by Stripe</strong> -->
              </div>
            </Button>

            <Button
              icon="solana"
              :class="{ active: method === 'SOL' }"
              @click="select('SOL')">
              <div class="col">
                <span>SOL</span>
                <!-- <strong>Powered by Stripe</strong> -->
              </div>
            </Button>

            <Button
              icon="audius"
              :class="{ active: method === 'AUDIO' }"
              @click="select('AUDIO')">
              <div class="col">
                <span>Audio</span>
                <!-- <strong>Powered by Stripe</strong> -->
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div
      class="card"
      :class="{ visible: method === 'STRIPE' }">
      <form
        :class="{ visible: method === 'STRIPE' && !hasIntent }"
        @submit.prevent="onSubmit"
        autocomplete="off">
        <button
          class="back"
          @click="toRoot"
          >Back</button
        >
        <h2 class="amount">One-time Donation</h2>
        <div>
          <input
            ref="amountElement"
            placeholder="Enter Donation Amount (USD)"
            type="text"
            name="amount"
            @value="amount"
            @input="onAmountChanged" />
          <button :disabled="amount === null">Next</button>
        </div>
      </form>

      <div
        id="elements"
        :class="{ visible: method === 'STRIPE' && hasIntent && !submitting && !donated }">
        <button @click="toAmount">Back</button>
        <h2 class="amount"
          >One-time Donation of <strong>${{ amount?.toFixed?.(2) || amount }}</strong></h2
        >
        <div class="elements-inner">
          <StripeElements
            @token="onToken"
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
        <button @click="pay">Pay</button>
      </div>

      <Spinner :class="{ visible: submitting }" />

      <div
        class="success"
        :class="{ visible: method === 'STRIPE' && donated }">
        <H1>Success</H1>
        <p>Thank you so much for supporting 5HT.</p>
        <p>
          Join us on
          <a
            href="https://discord.gg/D3VdbszTQv"
            target="_blank"
            >Discord</a
          >
          and
          <a
            href="https://t.me/+cxgjhILGFlg4ZjYx"
            target="_blank"
            >Telegram</a
          >!
        </p>
        <button
          class="home"
          @click="back()"
          >Done</button
        >
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { StripeElements, StripeElement } from 'vue-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useStripeAPI } from '../api/stripe';

const walletString = ref('');
const { copy } = useClipboard({ source: walletString });
const router = useRouter();
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const loaded = ref(false);
const amountElement = ref();
const amount: Ref<null | number> = ref(null);
const toast = useToast();
const method = ref(null);
const hasIntent = ref(false);
const elms: any = ref(null);
const submitting = ref(false);
const card: any = ref(null);
const donated = ref(false);
const { createPaymentIntent } = useStripeAPI();

let stripe: any;

watch(
  () => [hasIntent.value, submitting.value],
  async ([hasIntent, submitting]) => {
    if (hasIntent && !submitting) {
      await nextTick();
      card.value.stripeElement.focus();
    } else {
      await nextTick();
      amountElement.value.focus();
    }
  }
);

function back() {
  router.push('/');
}

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

watch(
  () => method.value,
  async val => {
    if (val === 'STRIPE') {
      await nextTick();
      amountElement.value.focus();
    }
    hasIntent.value = false;
  }
);

const currencyRegex = /^\d+(\.\d{1,2})?$/g;

function onAmountChanged(e) {
  if (!isNaN(parseFloat(e.target.value))) {
    amount.value = Number(parseFloat(e.target.value));
  } else {
    amount.value = null;
  }
}

async function select(currency: string) {
  let success;

  if (currency === 'SOL') {
    copy('HPz6ckNAJ8WGDvLUYEmmMbs1194jU6djiaMWdcM1MZTj');
    success = true;
  }

  if (currency === 'BTC') {
    copy('bc1q64jty7h096eq4jgu86vkcy8s3d0d6wjvhxq7jw');
    success = true;
  }

  if (currency === 'ETH') {
    copy('0x956f9156E110873726FFA6aC39D773eDB3D53565');
    success = true;
  }

  if (currency === 'AUDIO') {
    copy('3fZAdWHHy82HT2brNZJgXzwhX1ZCTnjM8Y3zNZr1HvUH');
    success = true;
  }

  if (currency === 'STRIPE') {
    method.value = currency;
  }

  if (!currency) {
    method.value = null;
  }

  if (success) {
    toast.message(`$${currency} address copied to clipboard.`);
  }
}

function formatted(value: number) {
  return value?.toFixed?.(2) || value;
}

async function toRoot() {
  hasIntent.value = false;
  method.value = null;
}

function toAmount() {
  hasIntent.value = false;
}

function onSubmit(e) {
  e.preventDefault();
  e.stopPropagation();
  hasIntent.value = true;
}

async function pay() {
  submitting.value = true;

  const [_, response] = await Promise.all([
    pause(500),
    new Promise(async resolve => {
      try {
        const {
          paymentIntent: { clientSecret },
        } = await createPaymentIntent(amount.value * 100);
        if (!clientSecret) return resolve({});
        const response = await elms.value.instance.confirmCardPayment(clientSecret, {
          payment_method: { card: card.value.stripeElement },
        });

        resolve(response);
      } catch (e) {
        console.log(e);
        submitting.value = false;
        resolve({});
      }
    }),
  ]);

  if (!response.paymentIntent) {
    toast.message('Oops! Something went wrong with that card.');
    submitting.value = false;
    return;
  }

  donated.value = true;
  submitting.value = false;
}

function onToken(e) {
  console.log(e);
}

onMounted(async () => {
  stripe = await loadStripe(STRIPE_KEY);
  loaded.value = true;
});
</script>

<style lang="scss" scoped>
@keyframes fade-up {
  0% {
    transform: translateY(100%);
    opacity: 0;

    @include mobile-portrait {
      transform: translateY(50%);
    }
  }

  100% {
    transform: translateY(0%);
    opacity: 1;

    @include mobile-portrait {
      transform: translateY(50%);
    }
  }
}

main {
  @include flex;
  color: var(--white);
  background: var(--black);
  padding: var(--outer-padding);

  .container > *,
  .success > * {
    @include cascade(10, 150ms);
  }

  .pad > .row > *:not(.card) {
    @include cascade(10, 75ms, 300ms);
  }

  p {
    font-size: 1rem;
  }

  a {
    color: var(--pink);
  }

  @include mobile-portrait {
    display: block;
    padding: calc(2 * var(--outer-padding)) var(--outer-padding);
  }
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
  gap: 2rem;

  @include mobile {
    gap: 0.5rem;
  }
}

.view > .container {
  gap: 1rem;
}

.crypto button,
.stripe,
.home,
button {
  @include size(auto, 3rem);
  @include flex(center, start, row);

  letter-spacing: 1px;
  font-size: 2rem;
  line-height: 1;
  font-weight: 900;
  background: transparent;
  border: 1px solid rgba(lighten($black, 15%), 0.8);
  border-radius: 2rem;
  padding: 0 1rem;
  gap: 1rem;

  transition: var(--hover-transition) !important;

  &.active {
    background: var(--white);
    * {
      fill: var(--pink);
      color: var(--black);
    }
  }

  svg {
    height: 60%;
    width: auto;
  }

  span {
    font-size: 1rem;
    line-height: 1;
    transition: var(--hover-transition);
  }

  strong {
    font-size: 0.65rem;
    line-height: 1;
    display: block;
    opacity: 0.5;
    font-weight: 100;
    font-family: 'Inconsolata', sans-serif;
    transition: var(--hover-transition);
  }

  @include mobile-portrait {
    width: calc(50% - 0.5rem);

    &.stripe {
      width: 100%;
    }
  }
}

.back {
  width: auto;
  border: 1px solid rgba(lighten($black, 15%), 0.8);
}

button * {
  fill: var(--white);
  transition: var(--hover-transition);
}

button:hover * {
  fill: var(--pink);
}

button:active {
  transition: var(--hover-transition);
  transform: scale(0.95) !important;
}

.container h2 {
  font-size: 2rem;
  color: var(--pink);
  padding: 0;
}

.col {
  @include flex(start, center);
}

.row {
  @include flex(center, start, row);
  gap: 1rem;

  @include mobile-portrait {
    flex-direction: column;
  }
}

.h1-container,
.h1-container :deep(*) {
  @include flex(center, flex-start, row);
  font-size: 4rem;
  gap: 1rem;

  @include mobile {
    font-size: 2.5rem;

    :deep(*) {
      font-size: 2.5rem;
    }
  }
}

.pad {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @include mobile {
    gap: 1rem;
  }
}

.card {
  @include flex(flex-start, flex-start, column);
  gap: 1rem;
  padding: 1rem;
  width: 100%;
  opacity: 0;
  pointer-events: none;
  transition: var(--base-transition);

  button {
    font-size: 1rem;
  }

  [type='text'] {
    @include size(auto, 3rem);
    padding: 0 1rem;
    flex: 1;
    background: transparent;
    color: var(--white);
    transition: var(--hover-transition);
    border: 1px solid rgba(lighten($black, 15%), 0.8);

    border-radius: 2rem;
    &::placeholder {
      color: rgba(white, 0.75);
    }

    &:focus,
    &:active {
      outline: 0;
      border: 1px solid var(--white);
    }

    @include mobile-portrait {
      width: 100%;
      flex: initial;
    }
  }
}

.visible {
  opacity: 1 !important;
  pointer-events: all !important;
}

$max-width: 600px;

.card form {
  @include flex(flex-start, flex-start, column);
  width: 100%;
  max-width: $max-width;
  gap: 2rem;
  position: absolute;
  margin: 0 auto;
  opacity: 0;
  pointer-events: none;
  transition: var(--base-transition);

  @include mobile-portrait {
    flex-direction: column;
    width: 100%;
    padding: 1rem;
  }
}

#elements {
  position: absolute;
  width: 100%;
  max-width: $max-width;
  z-index: -1;
  opacity: 0;
  pointer-events: none !important;
  transition: var(--base-transition);
  gap: 1rem;
  display: flex;
  flex-direction: column;

  @include mobile-portrait {
    flex-direction: column;
    width: 100%;
    padding: 1rem;
  }

  .elements-inner {
    border: 1px solid rgba(lighten($black, 15%), 0.8);
    padding: 0.75rem;
    border-radius: 100px;
  }

  &.visible {
    pointer-events: all !important;
  }

  button {
    width: fit-content;
  }
}

.card {
  @include position(absolute, 0 0 0 0);
  @include flex;
  @include blur(1rem, rgba(black, 0.5));
  opacity: 0;
  pointer-events: none;
  transition: var(--base-transition);

  &.visible {
    pointer-events: all;
    opacity: 0;
  }
}

.spinner {
  @include position(absolute, 50% null null 50%);
  transform: translateX(-50%) translateY(-50%) scale(1.5);
  opacity: 0;
  transition: var(--base-transition);
  pointer-events: none;
}

.card form,
.card #elements {
  transform: scale(0.95);

  &.visible {
    transform: scale(1);
  }
}

.success {
  @include flex;
  width: 100%;
  padding: 1rem;
  gap: 1rem;
  opacity: 0;
  pointer-events: none;
  transition: var(--base-transition);
  transform: scale(0.75);

  p {
    font-size: 1rem;
  }

  p a {
    border-bottom: 1px solid transparent;
    transition: var(--base-transition);
  }

  p a:hover {
    border-color: var(--pink);
    color: var(--white);
  }

  &.visible {
    opacity: 1;
    pointer-events: all;
    transform: scale(1);
  }

  button {
    margin-top: 1rem;
  }

  @include mobile-portrait {
    gap: 0.5rem;

    :deep(.h1 *) {
      font-size: 6rem;
    }
  }
}

.home {
  width: fit-content;
  text-transform: uppercase;
  margin-top: 0;

  @include mobile-portrait {
    font-size: 1rem;
  }
}

.amount {
  font-size: 2rem;
  background: transparent;

  strong {
    font-weight: 700;
    color: var(--pink);
  }
}

form div {
  @include flex(flex-start, flex-start, row);
  gap: 1rem;

  [type='text'] {
    min-width: 320px;

    @include mobile-portrait {
      min-width: initial;
    }
  }
}

.crypto {
  @include flex(flex-start, flex-start, row);
  flex-wrap: wrap;
  gap: 1rem;
}

.back {
  font-size: 1rem;
}

button[disabled] {
  opacity: 0.5;
}

.h1,
.h1 :deep(*) {
  font-size: 3rem !important;
}
</style>