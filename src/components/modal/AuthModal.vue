<template>
  <section>
    <header>
      <Button
        class="close"
        @click="modal.close"
        icon="close" />

      <div>
        <h2 v-if="!shouldSetPassword"
          >Enter your <strong>{{ fetched ? 'password' : 'email' }}</strong
          >.</h2
        >
        <h2 v-if="shouldSetPassword">Choose a <strong>password</strong>.</h2>
      </div>
    </header>

    <Form
      @submit="onSubmit"
      :submit-text="null">
      <div
        class="row"
        v-if="!fetched">
        <input
          ref="input"
          type="text"
          name="email"
          placeholder="email address" />
        <Button
          class="send"
          icon="send" />
      </div>
      <div
        class="column"
        v-if="fetched && shouldSetPassword">
        <input
          v-if="forgot"
          ref="forgotInput"
          type="text"
          name="forgotCode"
          placeholder="enter code sent to email" />
        <input
          ref="passwordInput"
          type="password"
          name="password"
          :placeholder="shouldSetPassword ? 'password' : 'password'" />
        <input
          v-if="shouldSetPassword"
          ref="input"
          type="password"
          name="password2"
          placeholder="repeat password" />
        <Button
          class="send"
          icon="send" />
      </div>
      <div
        class="row"
        v-if="fetched && !shouldSetPassword">
        <input
          ref="passwordInput"
          type="password"
          name="password"
          :placeholder="shouldSetPassword ? 'choose a password' : 'enter your password'" />
        <Button
          class="send"
          icon="send" />
      </div>
      <div
        class="row"
        v-if="fetched && !shouldSetPassword">
        <Button @click.prevent="resetPassword">Forgot Password</Button>
      </div>
    </Form>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  headerText: string;
}>();

const modal = useModal();
const account = useAccount();
const input = ref();
const toast = useToast();
const passwordInput = ref();
const forgotInput = ref();
const router = useRouter();
const fetched = ref(false);
const shouldSetPassword = ref(false);
const forgot = ref(false);
const userEmail = ref('');

async function signup({ email, password }) {
  const data = await fetch(`${import.meta.env.VITE_SERVER}/api/auth/signup`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  }).then(res => res.json());

  if (data?._id) {
    account.login(data);
    router.push('/visualizer');
  }
}

async function login({ email, password }) {
  const data = await fetch(`${import.meta.env.VITE_SERVER}/api/auth/login`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  }).then(res => res.json());

  if (data?.error) return toast.error(data.error);

  if (data?._id) {
    account.login(data);
    router.push('/visualizer');
  }
}

async function resetPassword() {
  forgot.value = true;
  shouldSetPassword.value = true;

  fetch(`${import.meta.env.VITE_SERVER}/api/auth/reset`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: userEmail.value }),
  }).then(res => res.json());

  await nextTick()
  forgotInput.value.focus()
}

async function finalizeReset({ password, forgotCode }) {
  forgot.value = true;
  shouldSetPassword.value = true;

  const data = await fetch(`${import.meta.env.VITE_SERVER}/api/auth/finish-reset`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: userEmail.value, code: forgotCode, password }),
  }).then(res => res.json())

  if (data.error) {
    return toast.error(data.error);
  }

  login({ email: userEmail.value, password })
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const isValidEmail = email => emailRegex.test(email);

async function onSubmit({ email, password, password2, forgotCode }: any) {
  if (fetched.value) {
    if (shouldSetPassword.value) {
      if (password !== password2) return toast.error('Passwords do not match.');
      if (forgot.value) return finalizeReset({ password, forgotCode });
      return signup({ email: userEmail.value, password });
    }

    return login({ email: userEmail.value, password });
  }

  if (!isValidEmail(email)) return toast.error('Please enter a valid email.');

  const { hasPassword } = await fetch(`${import.meta.env.VITE_SERVER}/api/auth/user/${email}`).then(res => res.json());
  shouldSetPassword.value = !hasPassword;
  userEmail.value = email;
  fetched.value = true;
  await nextTick();
  passwordInput.value.focus();
}

onMounted(async () => {
  await nextTick()
  input.value.focus();
});
</script>

<style lang="scss" scoped>
section {
  @include flex-column;
  border-radius: var(--border-radius);
  position: relative;
  width: 500px;

  @include mobile {
    width: 100%;
  }
}

form {
  @include flex-column(center, start);
  @include gap(1);
  width: 100%;
}

div {
  @include flex-row(start, start);
  @include gap;
  width: 100%;

  .send {
    width: 4rem;
    flex-grow: 0;
    flex-shrink: 1;
    background: $pink !important;
    border: 0;
  }
}

input {
  @include button;
  @include flex;
  flex: 1;
  flex-shrink: 0;
  height: var(--element-size);
  color: white;
  background: transparent;
  outline: none;
  font-weight: 100 !important;
  font-size: 1rem;
}

button {
  font-size: 1rem;
  transition: var(--hover-transition);

  &:hover {
    background: lighten($black, 10%);
  }

  &:active {
    transform: scale(0.95);
  }
}

input::placeholder {
  color: rgba($white, 0.5);
  font-weight: 100;
}
[name='forgotCode'],
[name='email'],
[name='password'],
[name='password2'] {
  @include button;
  flex: 1 !important;
  flex-shrink: 0 !important;
  height: var(--element-size) !important;
  width: 100%;
  font-weight: 900;

  &.full {
    padding-left: 1rem;
  }

  &.email {
    padding-left: 1rem;
  }
}

.active [name='phone'] {
}

[name='code'] {
  @include padding(null 0);
  max-width: 4rem;
  text-align: center;
  transition: var(--hover-transition);
  font-weight: 900;
  padding: 0;

  &[disabled] {
    opacity: 0.25;
  }
}

.close {
  width: fit-content;
  // @include position(absolute, null 0rem calc(100% + 2rem) null, 10);
  transform: translateY(0%); // translateX(100%);
  position: absolute;
  right: 0;
}

:deep(form button) {
  width: 100%;
}

:deep(form .buttons button) {
  // border-color: $white !important;
}

.methods {
  margin-right: auto;
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  button {
    transform: none;
    gap: 0.5rem;
  }

  li.active button {
    border-color: $pink !important;
  }
}

header {
  @include flex(start, center);
  @include box(0 0 2 0);
  width: 100%;
  flex-shrink: 0;

  h1 {
    flex-shrink: 0;
  }

  h2 {
    font-size: 2.5rem;

    strong {
      color: $pink;
    }

    @include mobile {
      font-size: 1.5rem;
    }
  }
}

// .col {
//   @include flex-column(start, start);
// }

// .row {
//   @include flex-row(center, start);
//   position: relative;
// }

// [name='code'] {
//   @include position(absolute, 0 null 0 0, 10);
// }

.column {
  display: flex;
  flex-direction: column;

  > * {
    height: var(--element-size);
    min-height: var(--element-size);
    display: flex;
    flex-shrink: 0;
  }
}
//   // * {
//   //   height: fit-content;
//   // }

//   button {
//     @include button;
//     margin-left: auto;
//   }
// }


.send {
  margin-left: auto;
}
</style>
