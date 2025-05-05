<template>
  <section>
    <Form @submit="submitDetails">
      <input name="name" placeholder="name" />
      <input name="city" placeholder="city" />
      <input name="country" placeholder="country" />
      <input name="address" placeholder="address (line 1)" />
      <input name="address2" placeholder="address (line 2)" />
      <input name="postal_code" placeholder="postal code" />
    </Form>
  </section>
</template>

<script setup lang="ts">
const modal = useModal()
const account = useAccount()
const toast = useToast()

function submitDetails ({ name, ...address }) {
  console.log({ name, address })
}

onMounted(() => {

})
</script> 

<style lang="scss" scoped>
section {
  max-height: 100vh;
  overflow-y: auto;
}
input {
  @include button;
  background: transparent;
  outline: none;
  font-weight: 100;
}
</style>