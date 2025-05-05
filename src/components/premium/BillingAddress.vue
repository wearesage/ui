<template>
  <section>
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
const account = useAccount();
const name = computed(() => account.stripeCustomer?.name);
const line1 = computed(() => account.stripeCustomer?.address?.line1);
const line2 = computed(() => account.stripeCustomer?.address?.line2 || '');
const country = computed(() => account.stripeCustomer?.address?.country);
const zip = computed(() => account.stripeCustomer?.address?.postal_code);
const city = computed(() => account.stripeCustomer?.address?.city);
const state = computed(() => account.stripeCustomer?.address?.state);
</script>

<style lang="scss" scoped>
section {
  @include flex-column(start, start);
  @include vertical-rhythm;
  @include gap;
  width: var(--menu-content-width);
  margin: 0 auto;
}

address {
  font-style: normal;
  font-size: 1.5rem;
  border-left: .25rem solid $pink;
  padding-left: 1rem;
}
</style>
