<template>
  <main>
    <MainHeader
      title="5HT Premium"
      closeButtonLink="/settings" />

    <template v-if="account.stripeCustomer">
      <SubscriptionStatus />
      <PaymentMethod />
    </template>

    <StripeOnboarding v-else />
  </main>
</template>

<script setup lang="ts">
const account = useAccount();
</script>

<style lang="scss" scoped>
main {
  @include flex-column(start, start);
  @include box(3, 3);

  @include mobile {
    @include box(2, 1);
  }
}
</style>
