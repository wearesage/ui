<template>
  <aside
    :class="{ visible: modal?.visible, transparent: modal.transparent, neon: visualizer?.settings?.neon }"
    @transitionend="onTransitionEnd">
    <transition name="fade">
      <component
        v-if="modal?.visible && COMPONENTS?.[modal?.component as ModalType]"
        :is="COMPONENTS?.[modal?.component as ModalType]"
        v-bind="{ ...modalProps }" />
    </transition>
  </aside>
</template>

<script setup lang="ts">
import AudioFileUploadModal from './AudioFileUploadModal.vue';
import AuthModal from './AuthModal.vue';
import AudioSourceModal from './AudioSourceModal.vue';
import ConfirmationModal from './ConfirmationModal.vue';
import CookieModal from './CookieModal.vue';
import ShareModal from './ShareModal.vue';
import SubscriptionModal from './SubscriptionModal.vue';

const modal = useModal?.();
const visualizer = useVisualizer?.();
const modalProps = computed(() => modal.props || {});
const route = useRoute();

watch(route, () => modal.close());

const COMPONENTS: Record<ModalType, any> = {
  ConfirmationModal,
  ShareModal,
  AudioSourceModal,
  AudioFileUploadModal,
  CookieModal,
  AuthModal,
  SubscriptionModal,
};

function onTransitionEnd() {
  if (modal.visible === false) {
    modal.component = null;
    modal.props = null;
  }
}
</script>

<style lang="scss" scoped>
aside {
  @include position(absolute, 0 0 0 0, 20);
  @include flex;
  @include padding;
  background: var(--modal-background);
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  transition: var(--base-transition);
  // mix-blend-mode: exclusion;
    // background: linear-gradient(to right,  lighten(rgba($black, .5), 0%), lighten(rgba($purple, .5), 0%));

  &.visible {
    opacity: 1;
    pointer-events: all;
  }

  &.transparent {
    background: transparent;
  }
}
</style>
