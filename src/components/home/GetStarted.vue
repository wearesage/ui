<template>
  <div class="get-started">
    <div class="row">
    <Button @click="login">Get Started</Button>
    <Button
      @click="play"
      :icon="audio.player.playing ? 'pause' : 'play'">
      Demo
    </Button>
  </div>
    <div class="row">
      <a
        href="https://discord.com/invite/D3VdbszTQv"
        target="_blank">
        <IconButton icon="discord" />
      </a>
      <a
        href="https://t.me/+cxgjhILGFlg4ZjYx"
        target="_blank">
        <IconButton icon="telegram" />
      </a>
      <IconButton
        @click="share"
        background="var(--black)"
        icon="share" />
      <IconButton
        icon="coffee"
        @click="router.push('/donate')" />
    </div>
  </div>
</template>

<script setup lang="ts">
const account = useAccount();
const modal = useModal();
const audio = useAudio();
const visualizer = useVisualizer();
const initialized = ref(false);
const router = useRouter();
const { share } = useShare();

async function login() {
  await visualizer.selectSource(null);
  if (account.authenticated) return router.push('/visualizer');
  modal.open('AuthModal', { targetRoute: '/visualizer' });
}

function play() {
  if (audio.player.playing) {
    audio.pause();
    return;
  }

  if (initialized.value) {
    audio.play();
    return;
  }

  visualizer.selectSource('LINK');
  initialized.value = true;
}
</script>

<style lang="scss" scoped>
.get-started {
  @include flex(start, start, row);
  flex-wrap: wrap;
  gap: 1rem;
  line-height: 2.5rem;

  @include mobile-portrait {
    width: 100%;
    margin-top: 0;
    line-height: 3.5rem;
  }
}

.row {
  @include flex-row(start, start);
  @include gap(0.5);
  width: 100%;

  &:first-of-type > * {
    @include mobile-portrait {
      width: 100%;
    }
  }

  &:nth-of-type(2) {
    @include mobile-portrait {
      justify-content: space-between
    }

    > * {
      flex: 1;
    }
  }
}

a,
button {
  @include flex(center, center, row);
  flex: 1;
  flex-shrink: 0;
  padding-left: 0;
  padding-right: 0;
  flex-grow: 1;
  gap: 0.5rem;
}

button {
  background-color: transparent;
}

@include mobile-landscape {
  .get-started {
    max-width: fit-content;
  }
}
</style>
