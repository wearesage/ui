<template>
  <Button
    :to="to"
    @click="$emit('click')"
    class="icon-button"
    :icon="icon"
    :class="{ propActive: active, disabled, small }"
    v-bind="$attrs">
    <div class="tooltip" v-if="tooltip">
      <span>{{ tooltip }}</span>
    </div>
  </Button>
</template>

<script setup lang="ts">
import { type Icon } from './Icon.vue';

defineEmits(['click']);

defineProps<{
  icon: Icon;
  disabled?: boolean;
  active?: boolean;
  tooltip?: string;
  is?: 'button' | 'link';
  to?: string;
  small?: boolean;
}>();
</script>

<style lang="scss" scoped>
$size: var(--nav-width);

button,
a {
  &.active svg {
    opacity: 1;
    transform: scale(1);
  }

  &.propActive {
    svg {
      :deep(*) {
        fill: var(--pink) !important;
      }
    }
  }

  &:hover {
    transform: none;
    background: lighten($black, 20%);

    svg {
      transform: scale(1);
    }
  }

  &:active svg {
    transform: scale(0.95);
  }
}

// [disabled='true'],
// .disabled {
//   opacity: 0.5;
//   cursor: not-allowed;
// }

svg {
  transition: var(--hover-transition);
  :deep(*) {
    transition: var(--hover-transition);

    fill: white;
  }
}

.disabled {
  opacity: .4;
}

// .tooltip {
//   @include position(absolute, null null 100% 0, 20);
//   // @include blur;
//   will-change: transform, opacity;
//   transition: var(--base-transition);
//   background: linear-gradient(to top right, lighten(rgb(0, 0, 0), 5%), lighten(rgb(0, 0, 0), 10%));
//   background: var(--black);
//   font-size: 0.75rem;
//   padding: 0.5rem 1rem;
//   border-radius: 1rem;
//   transform: translateX(0%) scale(0.5);
//   pointer-events: none;
//   opacity: 0;
//   white-space: nowrap;
//   box-shadow: 0 0 0.5rem 0 rgba(black, 0.15);
//   font-weight: 300;
//   color: var(--white);

//   &:first-letter {
//     font-weight: 900;
//     color: $pink;
//   }

//   @include mobile {
//     display: none;
//   }
// }

// button:hover .tooltip,
// a:hover .tooltip {
//   opacity: 1;
//   transform: translateY(-50%) translateX(0) scale(1);
// }

// .disabled {
//   opacity: 0.3;
//   cursor: not-allowed;
//   transform: none;

//   .tooltip {
//     display: none;
//   }
// }

.slot {
  display: contents;
}
</style>
