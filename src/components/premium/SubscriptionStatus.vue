<template>
  <section>
    <header>
      <H2>Subscription Details</H2>
    </header>

    <div class="content">
      <p>
        <strong>5HT Premium</strong>
        <span> $10.99 (USD) monthly</span>
      </p>
    </div>

    <template v-if="account.subscription && active">
      <p v-if="active">Your 5HT Premium account is active!</p>
      <p v-else>Your 5HT Premium account expired!</p>

      <div class="remaining">
        <H1 class="days">{{ daysLeft }}</H1>
        <p class="text">days remaining</p>
        <div class="row">
          <strong>
            Will Renew:
            <span>{{ account.subscription.active ? 'Yes' : 'No' }}</span>
          </strong>
        </div>
      </div>

      <div class="row">
        <Button
          v-if="account.subscription?.active"
          @click="account.cancelSubscription">
          Cancel Subscription
        </Button>

        <Button
          v-else
          background="var(--purple)"
          @click="account.resumeSubscription">
          Resume Subscription
        </Button>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { format, differenceInDays } from 'date-fns';

function date(value: any) {
  return format(new Date(value), 'PPP');
}

const account = useAccount();

const daysLeft = computed(() => {
  return differenceInDays(account.subscription?.validThru, new Date());
});

const remaining = computed(() => {
  const value = daysLeft.value;
  return (value === 1 ? ' Day' : ' Days') + ' Remaining';
});

const active = computed(() => daysLeft.value > 0);
</script>

<style lang="scss" scoped>
section {
  @include padding(1 0);
  @include vertical-rhythm(2);
  @include flex(start, start);
  width: var(--menu-content-width);
  margin: 0 auto;
  font-size: 1.5rem;
}

header {
  @include flex-row(start, center);
  width: 100%;
}

.content {
  @include flex-row(space-between, center);
  width: 100%;
}

p {
  @include flex-column(start, start);
}

strong {
  color: $purple;
}

.remaining {
  width: 100%;
  // @include box(1.5 1);
  // margin: 2rem 0 1rem 0;
  // border: 1px solid $purple;
  // border-radius: 10rem;
  // width: 100%;
  // text-align: center;

  .days,
  .text {
    font-size: 5rem;
    line-height: 1;
  }

  @include flex-row(center, center);
  @include gap;

  strong {
    font-size: 1.5rem;
    font-weight: 300;
    color: $pink;
  }

  .text {
    font-size: 1.5rem;
    line-height: 1;
    // font-weight: 700;
    color: $pink;
  }
}

.row {
  @include flex-column(end, end);
  margin-left: auto;
}

.content {
  @include box;
  border-top: 1px solid $purple;
  border-bottom: 1px solid $purple;
}

button {
  margin-left: auto;
}

strong span {
  color: $white;
  font-weight: bold;
}
</style>
