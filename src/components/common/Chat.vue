<template>
  <section class="chat">
    <ul ref="container">
      <li
        v-for="({ type, text, timestamp }, i) in messages"
        :class="{ [type]: true }">
        <VueMarkdown
          v-if="text"
          :source="text"
          :options="{ breaks: true }" />
        <small>{{ formatDate(timestamp) }} ago</small>
      </li>
    </ul>

    <aside>
      <textarea
        type="text"
        ref="textarea"
        :placeholder="placeholder"
        :value="message"
        @keydown="onKeyDown"
        @input="onInput" />
      <Button
        class="send"
        icon="send" />
    </aside>
  </section>
</template>

<script setup lang="ts">
import { pause } from '@util';
import VueMarkdown from 'vue-markdown-render';
import { interpolateNumber } from 'd3-interpolate';
import { formatDistance } from 'date-fns';

const emit = defineEmits(['send']);
const props = withDefaults(defineProps<{
  messages: any[];
  placeholder: string;
}>(), {
  placeholder: 'send message'
});
const raf = useRAF();
const message = ref('');
const container = ref();
const textarea = ref();

watch(
  () => props.messages,
  () => animateScrollTop()
);

async function onKeyDown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    emit('send', message.value);
    message.value = '';
  }
}

function onInput({ target: { value } }) {
  message.value = value;
}

async function animateScrollTop() {
  await nextTick() 
  if (!container.value) return
  const from = container.value.scrollTop;
  const to = container.value.scrollHeight - container.value.offsetHeight;
  const iScrollTop = interpolateNumber(from, to);

  raf.add({
    duration: 350,
    tick({ progress }) {
      container.value.scrollTop = iScrollTop(progress);
    },
  });
}

function formatDate(d) {
  if (!d) return
  return formatDistance(new Date(), new Date(d));
}

onMounted(() => {
  textarea.value.focus()
})
</script>

<style lang="scss" scoped>
section {
  @include size(100%);
  @include hide-scroll-bar;
  position: relative;
  padding-bottom: calc(100px + 3rem);
}

ul {
  @include flex-column(start, start);
  @include box;
  max-height: 100%;
  overflow-y: auto;
  position: relative;
  margin: 0 auto;
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

li {
  @include padding;
  border-radius: 2rem;
  width: fit-content;
  max-width: 75%;
  font-size: 1.25rem;
  line-height: 1.75rem;
  margin-top: 1rem;

  :deep(div > p) {
    @include flex-column(start, start);
  }

  :deep(* + *) {
    margin-top: 1rem;
  }
}

li,
aside {
  animation: fade-in var(--base-duration) var(--base-easing) forwards;
  opacity: 0;
}

.HumanMessage {
  background: $purple;
  margin-left: auto;
  border-bottom-right-radius: 0;
}

aside {
  @include flex-row(center, end);
  @include position(absolute, null 0 0 0, 10);
  @include box;
  margin: 0 auto;
  background: $black;
  border-top-left-radius: 1.5rem;
  border-top-right-radius: 4rem;
  will-change: transform, opacity;

  textarea {
    @include button;
    @include flex;
    flex: 1;
    font-size: 1.25rem;
    color: white;
    border-radius: 1rem;
    outline: none;
    font-weight: 300;
    height: 100px;
    border: 0;
    background: linear-gradient(to bottom, lighten($black, 3%), lighten($black, 0%)) !important;
  }
}

small {
  display: block;
  font-weight: 500;
  margin-top: 1rem;
  opacity: 0.5;
}
</style>
