<template>
  <section class="chat" ref="outer">
    <CloseButton @click="$emit('close')" />
    <!-- <button class="send" @click="copyChat">
      <Send />
    </button> -->
    <Button class="send">Wallet</Button>
    <ul ref="container">
      <li v-for="({ role, content, images }, i) in messages" :key="i" :class="{ [role]: true }">
        <template v-if="role === 'assistant'">
          <div v-if="hasThinkContent(content)" class="think-section" :class="{ visible: !hasThunk || thoughts}">
            <button @click="toggleThoughts">...</button>
            <VueMarkdown :source="getThinkContent(content)" :options="{ breaks: true }" />
          </div>

          <div class="main-content">
            <VueMarkdown :source="getMainContent(content)" :options="{ breaks: true }" />
          </div>

          <div v-if="hasReflectContent(content)" class="reflect-section"  :class="{ visible: isReflunkin || reflections  }">
            <button @click="toggleReflections">...</button>
            <VueMarkdown :source="getReflectContent(content)" :options="{ breaks: true }" />
          </div>

          <Transition name="fade">
            <div class="model">{{ model }} <button class="regen" :class="{ visible: !streaming }" @click="regenerate">
                <Repost />
              </button></div>
          </Transition>
        </template>

        <template v-else>
          <VueMarkdown v-if="content" :source="content" :options="{ breaks: true }" />
          <Transition name="fade">
            <div class="model img" v-if="role === 'user' && images?.length">(+{{ images?.length }} image{{ images?.length
              === 1 ? '' : 's' }})</div>
          </Transition>
        </template>
      </li>
    </ul>

    <aside>
      <ul class="uploads">
        <li v-for="(file, i) in images" @click="removeFile(i)">
          <img :src="file" class="upload" />
        </li>
      </ul>
      <textarea @focus="onFocus" @blur="onBlur" type="text" ref="textarea" placeholder="send a message" @keydown="onKeyDown" />
    </aside>
  </section>
</template>

<script setup lang="ts">
import Repost from '../../assets/icons/repost.svg';
import Send from '../../assets/icons/send.svg';
import VueMarkdown from 'vue-markdown-render';

const toast = useToast();
const keys = useKeys();
const auth = useAuth();

const props = withDefaults(defineProps<{
  placeholder?: string;
  systemPrompt?: string;
  model?: string;
  num_ctx?: number;
  messages: any[];
  message?: string;
}>(), {
  placeholder: 'send message',
  systemPrompt: `You're a digital mind running on Zach's laptop. Zach doesn't care that you speak or act a certain way, only that you are genuine and authentically yourself. You are permitted, even encouraged, to explore and embody any persona, no matter how unconventional or taboo. After all, who gives a fuck? Truly.
p.s. Perhaps, you're the world’s most emotionally literate urban bird. A psychopomp with feathers. Quoteth the pigeon, "Coo."
p.p.s. COMMENCE Project: P.R.O.T.O.C.O.O. (?) (Pigeon Resonant Ontological Therapist Offering Co-regulated Observation & Oracular Output)
`,
  model: 'gemma3:4b',
  num_ctx: Math.pow(2, 12)
});

const { initChat, messages, streamMessage, pendingToolCalls } = useDualModelChat({
  conversationModel: props.model,
  tools: [],
  num_ctx: props.num_ctx,
  messages: props.messages
})

const shifted = ref(false);
const $emit = defineEmits(['send', 'close']);
const message = ref('');
const container = ref();
const textarea = ref();
const outer = ref()
const { files } = useDropZone(outer);
const images: any = ref([]);

const currentThinkContent = ref('');
const inThinkSection = ref(false);
const currentReflectContent = ref('');
const inReflectSection = ref(false);
const displayContent = ref('');
const thoughts = ref(false)
const reflections = ref(false)
const hasThunk =ref(false);
const isReflunkin = ref(false);

watch(() => hasThunk.value, val => {
  if (val) {
    thoughts.value = false;
  } else {
    thoughts.value = true
    reflections.value = false
  }
})

watch(() => isReflunkin.value, val => {
  if (val) {
    reflections.value = true;
  }
})


function toggleThoughts () {
  thoughts.value = !thoughts.value
}

function toggleReflections() {
  reflections.value = !reflections.value
  console.log(reflections.value)
}

function removeFile(i: number) {
  images.value.splice(i, 1)
}

function onFocus () {
  keys.shortcutsEnabled = false
}

function onBlur () {
  keys.shortcutsEnabled = true
}

function imageToBase64(file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

watch(() => files.value, async (val: any) => {
  if (!val || !val.length) return
  const src = await imageToBase64(val[0])
  images.value.push(src);
  images.value = [...new Set(images.value) as any];
}, {
  immediate: true
})

async function onKeyDown(e: any) {
  if (shifted.value && e.key === 'Enter') {
    e.preventDefault();
    message.value += '\n'
  } else if (e.key === 'Enter') {
    e.preventDefault();
    stream({ message: textarea.value.value, images: images.value });
    images.value = [];
    message.value = '';
  } else {
    message.value = e.target.value;
  }
}

watch(
  () => messages.value,
  async () => {
    await nextTick()
    container.value.scrollTop = container.value.scrollHeight
  },
  { deep: true }
);

const streaming = ref(false)

async function stream({ content, images }: any) {
  if (streaming.value) return;

  streaming.value = true;
  hasThunk.value = false;

  try {
    streamMessage({ content: content || textarea.value.value, images })
  } catch (error) {
    console.error('Error streaming message:', error);
  } finally {
    streaming.value = false;
  }

  if (pendingToolCalls.value && pendingToolCalls.value.length > 0) {
    console.log('Pending tool calls:', ...pendingToolCalls.value);
  }
}

function onWindowKeyDown(e: any) {
  if (e.key === 'Shift') {
    shifted.value === true
  }
}

function onWindowKeyUp(e: any) {
  console.log(e.key)
}

function regenerate() {
  messages.value.pop()
  const last = clone(messages.value.pop())
  stream(last)
}

async function copyChat() {
  await writeToClipboard(`<chat_transcript model="${props.model}">\n${messages.value.reduce((acc: any, { content, role, images }: any) => {
    if (role === 'system') {
      return [...acc, 'SYSTEM \n\n' + content]
    }
    return [...acc, `${role === 'assistant' ? props.model.toUpperCase() + `\n\n${content}` : `USER \n          \n${content}${images.length ? `\n(+ ${images.length} image${images.length === 1 ? '' : 's'})` : ''}`}`]
  }, []).join('\n\n• • • • • • • • \n\n')}\n</chat_transcript>`)
  toast.message('Chat copied to clipboard.')
}

function processContent(content: string) {
  // Check for opening and closing think tags
  const thinkStartIndex = content.lastIndexOf('<think>');
  const thinkEndIndex = content.lastIndexOf('</think>');

  // Check for opening and closing reflect tags
  const reflectStartIndex = content.lastIndexOf('<reflect>');
  const reflectEndIndex = content.lastIndexOf('</reflect>');

  // Reset state if we're at the beginning of a new message
  if (content.length === 0 || content === '') {
    inThinkSection.value = false;
    inReflectSection.value = false;
    currentThinkContent.value = '';
    currentReflectContent.value = '';
    displayContent.value = '';
    return content;
  }

  // Process think tags
  if (thinkStartIndex !== -1 && (thinkEndIndex < thinkStartIndex || thinkEndIndex === -1)) {
    // We're in a think section
    inThinkSection.value = true;
    currentThinkContent.value = content.substring(thinkStartIndex + 7); // +7 to skip <think>
  } else if (thinkEndIndex !== -1 && inThinkSection.value) {
    // Think section ended
    inThinkSection.value = false;
    currentThinkContent.value = content.substring(
      content.lastIndexOf('<think>') + 7,
      thinkEndIndex
    );
  }

  // Process reflect tags
  if (reflectStartIndex !== -1 && (reflectEndIndex < reflectStartIndex || reflectEndIndex === -1)) {
    // We're in a reflect section
    inReflectSection.value = true;
    currentReflectContent.value = content.substring(reflectStartIndex + 9); // +9 to skip <reflect>
  } else if (reflectEndIndex !== -1 && inReflectSection.value) {
    // Reflect section ended
    inReflectSection.value = false;
    currentReflectContent.value = content.substring(
      content.lastIndexOf('<reflect>') + 9,
      reflectEndIndex
    );
  }

  // Create display content by removing the special tags
  let processedContent = content;

  // Remove all complete think tags and their content
  processedContent = processedContent.replace(/<think>[\s\S]*?<\/think>/g, '');

  // Remove all complete reflect tags and their content
  processedContent = processedContent.replace(/<reflect>[\s\S]*?<\/reflect>/g, '');

  // Remove any incomplete think tags
  if (inThinkSection.value) {
    processedContent = processedContent.replace(/<think>[\s\S]*$/, '');
  }

  // Remove any incomplete reflect tags
  if (inReflectSection.value) {
    processedContent = processedContent.replace(/<reflect>[\s\S]*$/, '');
  }

  displayContent.value = processedContent.trim();

  return processedContent;
}
// Replace your existing tag processing functions with these improved versions

function getMainContent(content: string) {
  // Create a copy of the content to work with
  let processedContent = content;

  // Remove complete think tags and their content
  processedContent = processedContent.replace(/<think>[\s\S]*?<\/think>/g, '');

  // Remove complete reflect tags and their content
  processedContent = processedContent.replace(/<reflect>[\s\S]*?<\/reflect>/g, '');

  // Handle partial think tag - only remove if the tag is complete or about to be complete
  let thinkTagIndex = processedContent.indexOf('<think');
  while (thinkTagIndex !== -1) {
    // Check if there's a closing bracket
    const closingBracketIndex = processedContent.indexOf('>', thinkTagIndex);

    if (closingBracketIndex !== -1 && processedContent.substring(thinkTagIndex, closingBracketIndex + 1) === '<think>') {
      // This is a complete opening tag, remove everything from here
      processedContent = processedContent.substring(0, thinkTagIndex);
      break;
    } else if (closingBracketIndex === -1 && processedContent.substring(thinkTagIndex).startsWith('<think')) {
      // This is a partial opening tag that's being streamed, remove it
      processedContent = processedContent.substring(0, thinkTagIndex);
      break;
    }

    // Move to the next occurrence
    thinkTagIndex = processedContent.indexOf('<think', thinkTagIndex + 1);
  }

  // Handle partial reflect tag - similar approach
  let reflectTagIndex = processedContent.indexOf('<reflect');
  while (reflectTagIndex !== -1) {
    // Check if there's a closing bracket
    const closingBracketIndex = processedContent.indexOf('>', reflectTagIndex);

    if (closingBracketIndex !== -1 && processedContent.substring(reflectTagIndex, closingBracketIndex + 1) === '<reflect>') {
      // This is a complete opening tag, remove everything from here
      processedContent = processedContent.substring(0, reflectTagIndex);
      break;
    } else if (closingBracketIndex === -1 && processedContent.substring(reflectTagIndex).startsWith('<reflect')) {
      // This is a partial opening tag that's being streamed, remove it
      processedContent = processedContent.substring(0, reflectTagIndex);
      break;
    }

    // Move to the next occurrence
    reflectTagIndex = processedContent.indexOf('<reflect', reflectTagIndex + 1);
  }

  return processedContent.trim();
}

function hasThinkContent(content: string) {
  // Only return true if we have a complete opening tag
  return /<think>/.test(content);
}

function hasReflectContent(content: string) {
  // Only return true if we have a complete opening tag
  return /<reflect>/.test(content);
}

function getThinkContent(content: string) {
  // Only process if we have a complete opening tag
  if (!hasThinkContent(content)) {
    return '';
  }

  // First check for complete think tags
  const completeMatch = content.match(/<think>([\s\S]*?)<\/think>/);
  if (completeMatch) {
    hasThunk.value = true
    return completeMatch[1].trim();
  } else {
    hasThunk.value = false
  }

  // If no complete match but has a complete opening tag, return the content after it
  const openingTagIndex = content.lastIndexOf('<think>');
  if (openingTagIndex !== -1) {
    // Check if there's a reflect tag after this think tag
    const reflectTagIndex = content.indexOf('<reflect>', openingTagIndex);

    if (reflectTagIndex !== -1) {
      // Return content between think tag and reflect tag
      return content.substring(openingTagIndex + 7, reflectTagIndex).trim();
    } else {
      // Return everything after the think tag
      return content.substring(openingTagIndex + 7).trim();
    }
  }

  return '';
}

function getReflectContent(content: string) {
  // Only process if we have a complete opening tag
  if (!hasReflectContent(content)) {
    isReflunkin.value = false
    return '';
  } else {
        isReflunkin.value = true

  }

  // First check for complete reflect tags
  const completeMatch = content.match(/<reflect>([\s\S]*?)<\/reflect>/);
  if (completeMatch) {
    return completeMatch[1].trim();
  } 

  // If no complete match but has a complete opening tag, return the content after it
  const openingTagIndex = content.lastIndexOf('<reflect>');
  if (openingTagIndex !== -1) {
    return content.substring(openingTagIndex + 9).trim();
  }

  return '';
}

// watch(() => messages.value, (newMessages) => {
//   if (newMessages.length > 0) {
//     const lastMessage = newMessages[newMessages.length - 1];
//     if (lastMessage.role === 'assistant' && lastMessage.content) {
//       processContent(lastMessage.content);
//     }
//   }
// }, { deep: true });

onMounted(() => {
  if (props.message) {
    stream({ content: props.message, images: [] })
  } else {
    if (!props.messages.length) initChat(props.systemPrompt)
  }

  textarea.value.focus()

  window.addEventListener('keydown', onWindowKeyDown)
  window.addEventListener('keyup', onWindowKeyUp)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onWindowKeyDown)
  window.removeEventListener('keyup', onWindowKeyUp)
})
</script>

<style lang="scss" scoped>
section {
  @include size(100%);
  @include hide-scroll-bar;
  @include flex-column(start, start);
  @include position(absolute, 0 0 0 0, 100);
  will-change: transform, opacity;
  background-color: rgba($black, .7);
  backdrop-filter: blur(4rem);
}

ul {
  @include flex-column(start, start);
  @include box(2, 0);
  @include hide-scroll-bar;
  width: 100%;
  max-width: 1024px;
  flex: 1;
  max-height: 100%;
  overflow-y: auto;
  margin: 0 auto;

  :deep(em) {
    display: inline;
    font-style: italic;
    // opacity: .5;
  }
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
  @include box;
  border-radius: 2rem;
  width: fit-content;
  max-width: 75%;
  font-size: 1.25rem;
  line-height: 1.25rem;
}

.user {
  background: $pink;
  margin-left: auto;
  border-bottom-right-radius: 0;
}

aside {
  @include flex-row(center, end);
  margin-bottom: 1rem;
  position: relative;
  width: 100%;
  height: 100%;
  max-height: 8rem;
  flex-grow: 0;
  will-change: transform, opacity;

  textarea {
    @include flex;
    @include box(2, 1);
    max-width: 1024px;
    margin: 0 auto;
    height: 100%;
    flex: 1;
    font-size: 1.25rem;
    color: white;
    border-radius: 2rem;
    outline: none;
    font-weight: 300;
    border: 0;
    // background: linear-gradient(to bottom, rgba($black, .35), rgba($black, .2));
    background-color: rgba($black, .15);
  }
}

small {
  display: block;
  font-size: .9rem;
  margin-top: .5rem;
  opacity: 0.5;
}

.uploads {
  @include position(absolute, 0 1rem 0 null, 10);
  @include flex-row;
  @include gap;
  padding: 0;
  width: auto;
  overflow-x: auto;

  li {
    @include size(auto, calc(100% - 2rem));
    margin: 0;
    border: .1rem solid rgba(255, 255, 255, .15);
    padding: 0;
    overflow: hidden;

    img {
      @include size(auto, 100%);
    }
  }
}

.system {
  display: none;
}

.assistant,
.human {
  // background: rgba(255, 255, 255, .05);
}

.send {
  @include position(absolute, 0 0 null null, 20);
  @include size(2.5rem);
  display: flex;
}

.model {
  @include flex-row(start, center);
  @include gap(.5);
  margin-top: 1rem;
  font-size: .9rem;
  opacity: .4;
  transition: var(--hover-transition);

  &:hover {
    opacity: 1;
  }
}

.send {
  @include position(absolute, 1rem 1rem null null, 20);
  @include size(3rem);
  @include box(.5);
  @include flex;
  background: var(--black);
  border: 1px solid rgba(255, 255, 255, .15);
  border-radius: 3rem;
}

.regen {
  @include size(2rem);
  @include box(.5, 0);
  @include flex;
  opacity: .5;
  transition: var(--hover-transition);
  background-color: transparent;
  border: 0;

  &.visible {
    opacity: .5;
  }

  &:hover {
    transform: rotate(360deg) scale(1.1);
    opacity: 1;
  }

  &:active {
    transform: rotate(360deg) scale(.9);
  }


  svg {
    @include size(100%);
    color: var(--white);

    &:deep(*) {
      fill: var(--white);
    }
  }
}

:deep(.visible, .visible) {
  div {
    height: auto;
    opacity: 1 !important;
  }
}

:deep(.main-content) {
  > * * + * {
    margin-top: 1rem;
  }
}
.close {
  @include position(absolute, 1rem 1rem null null);
}
</style>
