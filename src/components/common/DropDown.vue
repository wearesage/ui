<template>
  <div
    class="dropdown"
    ref="container"
    :class="{ open }">
    <button>
      <span>{{ displayed }}</span>
      <Chevron class="chevron" />
    </button>
    <Transition name="fade">
      <ul v-if="open">
        <li
          v-for="(option, i) in options"
          :key="i"
          @click="select(option)"
          >{{ option.text }}</li
        >
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import Chevron from '@assets/icons/chevron-down.svg';

type Option = {
  text: string;
  value: any;
};

const props = defineProps<{
  options: Option[];
  modelValue: any;
}>();

const $emit = defineEmits(['update:modelValue']);

const container = ref();
const open = ref(false);

const displayed = computed(() => {
  let returned;

  props.options.forEach(option => {
    if (option.value === props.modelValue) returned = option;
  });

  return returned?.text || '';
});

watch(
  () => open.value,
  val => {
    if (!val) return;
  }
);

function select(option) {
  $emit('update:modelValue', option.value);
}

function onClick(e) {
  const bounds = container.value.contains(e.target);
  if (!bounds) {
    open.value = false;
  } else {
    open.value = !open.value;
  }
}

onMounted(() => {
  document.body.addEventListener('click', onClick);
});

onBeforeUnmount(() => {
  document.body.removeEventListener('click', onClick);
});
</script>

<style lang="scss" scoped>
$height: 3rem;

.dropdown {
  position: relative;
  padding: 0;
  color: $white;
}

button {
  @include flex(center, center, row);
  position: relative;
  z-index: 15;
  min-width: 10rem;
  width: 100%;
  background: transparent;
  color: $white;
  // border: 0;
  padding: 0 1rem;
  height: $height;
  font-size: 1.25rem;
  font-weight: 900;
  border-radius: 2rem;
  // background: lighten($black, 3%);
  text-align: center;
  border: 1px solid $white;
  // box-shadow: var(--box-shadow);
  gap: 1rem;
  outline: 0;

  svg {
    @include size(1.5rem);
    transition: var(--base-transition);

    :deep(*) {
      fill: $white;
    }
  }

  div {
    @include flex(center, center, row);
  }
}

.open .chevron {
  transform: rotate(180deg);
}

ul {
  @include position(absolute, 50% 0 null 0, 10);
  // @include blur;
  padding: 0;
  color: $white;
  background: lighten($black, 0%);
  padding-top: calc(#{$height} / 2);
  border-bottom-right-radius: 2rem;
  border-bottom-left-radius: 2rem;
  // box-shadow: var(--box-shadow);
}

li {
  @include flex(center, start, row);
  padding: 0.5rem 1.5rem;
  white-space: nowrap;
  font-size: 1.25rem;

  &:first-of-type {
    padding: 1rem 1.5rem 0.5rem 1.5rem;
  }

  &:last-of-type {
    padding: 0.5rem 1.5rem 1.5rem;
  }

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
}
</style>
