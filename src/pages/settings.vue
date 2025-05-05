<template>
  <main>
    <MainHeader title="Settings" />

    <SettingsSection title="Renderer" v-if="account.settings">
      <fieldset class="slim">
        <h2 class="full">Max Resolution</h2>
        <ResolutionSelector v-model="account.settings.resolution" />
      </fieldset>
      <fieldset class="slim">
        <h2 class="full">Visualizer Speed</h2>
        <SpeedSelector v-model="account.settings.speed" />
      </fieldset>
      <fieldset>
        <h2>Disable Flashing</h2>
        <Toggle v-model="account.settings.reduceFlashing" />
      </fieldset>
      <fieldset>
        <h2 :class="{ disabled: account.settings.reduceFlashing }">Volume Sensitivity</h2>
        <input
          :class="{ disabled: account.settings.reduceFlashing }"
          type="range"
          min="0"
          max="2"
          step=".01"
          v-model="account.settings.volumeSensitivity" />
      </fieldset>
    </SettingsSection>

    <SettingsSection title="User Interface">
      <fieldset>
        <h2>Always Show Track Info</h2>
        <Toggle v-model="account.settings.alwaysShowTrackInfo" />
      </fieldset>
      <fieldset>
        <h2>Show Player Controls <small>(When Available)</small></h2>
        <Toggle v-model="account.settings.alwaysShowPlayerControls" />
      </fieldset>
      <fieldset>
        <h2>Shuffle Visualizer Designs</h2>
        <Toggle v-model="account.settings.shuffleDesigns" />
      </fieldset>
      <fieldset>
        <h2>Neon Mode</h2>
        <Toggle v-model="account.settings.neon" />
      </fieldset>
    </SettingsSection>

    <SettingsSection title="Audius">
      <fieldset>
        <h2>Infinity Play</h2>
        <Toggle v-model="account.settings.infinitePlay" />
      </fieldset>
    </SettingsSection>

     <!-- <SettingsSection
      title="Account"
      v-if="account.visualizerSettings"> 
    <fieldset>
        <div>
          <Icon icon="eye" />
          <p>5HT: {{ account.type }}</p>
        </div>
        <Button to="/premium">{{ account.premium ? 'Manage' : 'Upgrade' }}</Button>
      </fieldset>
     <fieldset>
        <div>
          <Icon icon="email" />
          <p>{{ account.email || 'None Set' }}</p>
        </div>
        <Button @click="updateEmail">{{ account.email?.length ? 'Update' : 'Add' }}</Button>
      </fieldset>
      <fieldset>
        <div>
          <Icon icon="phone" />
          <p>{{ account.phone || 'None Set' }}</p>
        </div>
        <Button @click="updatePhone">{{ account.phone?.length ? 'Update' : 'Add' }}</Button>
      </fieldset>
    </SettingsSection>  -->
  </main>
</template>

<script setup lang="ts">
const account = useAccount();
const modal = useModal();
const toast = useToast();

useKeyboardShortcuts();

async function updateEmail() {
  try {
    const data: any = await modal.open('AuthModal', {
      requestLoginCode,
      submitLoginCode,
      forceMethod: 'email',
      validateOnly: true,
      headerText: account.email?.length ? 'Update Email' : 'Add Email',
    });

    if (data?.valid) {
      const { success }: any = await account.updateSelf({ email: data.value });
      if (success) return toast.message('Email updated!');
      toast.error('Error updating email address.');
    }
  } catch (e) {}
}

async function updatePhone() {
  try {
    const data: any = await modal.open('AuthModal', {
      requestLoginCode,
      submitLoginCode,
      forceMethod: 'sms',
      validateOnly: true,
      headerText: account.phone?.length ? 'Update Phone' : 'Add Phone',
    });

    if (data?.valid) {
      const { success }: any = await account.updateSelf({ phone: data.value });
      if (success) toast.message('Email updated!');
      toast.error('Error updating email address.');
    }
  } catch (e) {}
}

function manage() {}
</script>

<style lang="scss" scoped>
main {
  @include box(3, 1);
  @include vertical-rhythm;

  @include mobile {
    @include box(1 1 0 1, 0);
  }
}

section .interval {
  @include flex-row(start, center);
  @include box(0.5 0, 0.5);
  flex-wrap: wrap;
  margin: 0 auto;
  width: var(--menu-content-width);
}

button,
input,
.interval,
.interval * {
  min-height: calc(var(--element-size));
  height: fit-content;
}

.toggle {
  margin-left: 0;
  margin-right: 0;
  flex-shrink: 0;
}

input {
  @include button;
  width: var(--element-size);
  padding: 0;
  text-align: center;
  background-color: transparent;
}

.circle {
  @include size(100%);
  fill: lighten($black, 10%);
  z-index: -1;
}

.interval {
  opacity: 0.25;

  &.active {
    opacity: 1;
  }
}

.interval {
  transition: var(--base-transition);
  pointer-events: none;

  &.active {
    pointer-events: all;
  }
}

.interval > div {
  @include flex-row;
  gap: 0.5rem;
}

h2 {
  @include flex-column(start, start);
  @include gap(0.25);

  strong,
  p {
    padding-left: 1rem;
  }

  p {
    font-size: 1rem;
  }

  small {
    font-size: 0.8rem;
    line-height: 0.8rem;
  }
}

.full {
  @include mobile-portrait {
    display: inline;
    text-align: center;
    width: 100%;
  }
}

h2 {
  display: inline;
  font-weight: 300;

  @include mobile-portrait {
    flex: 1;
    max-width: auto;
    font-size: 1rem;

    small {
      font-weight: 300;
    }
  }
}

:deep(*::first-letter) {
  color: $pink;
  font-weight: 700;
}

.slim {
  @include mobile-portrait {
    padding-top: 1rem;
    flex-direction: column;
  }
}

[type='range'] {
  width: 200px;
  background-color: transparent !important;
  border: 0 !important;

  @include mobile {
    width: 30vw;
  }
}

fieldset.disabled {
  opacity: 0.5;
  pointer-events: none;
}

@keyframes bobble {
  0% {
    opacity: 0;
    transform: translateY(10rem);
  }

  100% {
    opacity: 1;
    transform: translateY(0rem);
  }
}

main > * {
  @include cascade(10, 20ms, 100ms);
  animation: bobble var(--long-duration) var(--base-easing) forwards;
  opacity: 0;
  border: 0;



  .disabled {
    opacity: 0.25;
    pointer-events: none;
  }
}

@include mobile {
  h2 { min-width: 33% }
}
</style>
