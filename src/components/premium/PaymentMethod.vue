<template>
  <section>
    <header>
      <H2>Payment Method</H2>

      <Button
        icon="close"
        @click="removePaymentMethod">
        Remove
      </Button>
    </header>

    <div>
      <img :src="`/images/credit-cards/${brand}.png`" />
      <p class="last-4">
        {{ viewport.mobile ? '****' : '**** **** ****' }} <strong> {{ last4 }}</strong>
      </p>
      <p class="exp">{{ exp.month }}/{{ exp.year }}</p>
    </div>

    <address>
      <strong>{{ name }} </strong> <br />
      {{ line1 }} <br />
      {{ line2 }} <br />
      {{ city }}, {{ state }} {{ zip }}<br />
      {{ country }}
    </address>
  </section>
</template>

<script setup lang="ts">
const viewport = useViewport();
const account = useAccount();
const last4 = computed(() => account.paymentMethod?.card?.last4);
const brand = computed<CardType | null>(() => account.paymentMethod?.card?.brand || null);
const name = computed(() => account.stripeCustomer?.name);
const line1 = computed(() => account.stripeCustomer?.address?.line1);
const line2 = computed(() => account.stripeCustomer?.address?.line2 || '');
const country = computed(() => account.stripeCustomer?.address?.country);
const zip = computed(() => account.stripeCustomer?.address?.postal_code);
const city = computed(() => account.stripeCustomer?.address?.city);
const state = computed(() => account.stripeCustomer?.address?.state);
const exp = computed(() => ({
  month: account.paymentMethod?.card?.exp_month,
  year: account.paymentMethod?.card?.exp_year,
}));

function removePaymentMethod() {
  account.updateSelf({ stripe: { customer: null, paymentMethod: null } });
}
</script>

<style lang="scss" scoped>
section {
  @include flex-column(start, start);
  @include vertical-rhythm(1);
  @include box(1 0, 1);
  width: var(--menu-content-width);
  margin: 0 auto;
}

.stripe {
  @include text-gradient($orange, $pink);
  font-size: 1rem;
}

div {
  @include flex-row(space-between, center);
  @include box(0, 1);
  width: 100%;
}

img {
  @include size(auto, 40px);

  @include mobile {
    @include size(auto, 30px);
  }
}

p {
  font-size: 1.5rem;
}

.last-4 {
  color: rgba($white, 0.5);

  strong {
    color: $white;
  }
}

header {
  @include flex-row(space-between);
  width: 100%;
}

address {
  font-style: normal;
  font-size: 1.5rem;
  border-left: 0.25rem solid $pink;
  padding-left: 1rem;
  margin: 2rem 0 1rem 0;
}

.actions {
  @include flex-row(end, end);
}
</style>
