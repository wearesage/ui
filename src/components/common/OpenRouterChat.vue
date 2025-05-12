<template>
  <section class="chat" ref="outer">
    <IconButton @click="toggleModal" class="send" icon="user" />
    <ul ref="container">
      <li v-for="({ role, content }, i) in messages" :key="i"
        :class="{ [role]: true, hiding: i === regenerating, extended: Array.isArray(content) }">
        <Transition name="fade">
          <div v-if="role === 'assistant' && content.length">
            <VueMarkdown :source="content?.[0]?.text || content" :system-prompt="systemPrompt"
              :options="{ highlight }" />
          </div>
        </Transition>

        <div v-if="role === 'user'">
          <VueMarkdown v-if="content" :source="content?.[0]?.text || content" :options="{ highlight, breaks: true }" />
          <div class="thumbs" v-if="Array.isArray(content)">
            <img v-for="(img, i) in content" :src="content?.[i]?.image_url?.url" />
          </div>
        </div>
      </li>

      <Transition name="fade">
        <div class="tools" v-if="pendingTools.length && !autoApprove">
          <IconButton @click="callTool" icon="check" />
          <IconButton @click="cancelTool" icon="close" />
        </div>
      </Transition>
    </ul>

    <aside>
      <ul class="uploads">
        <li v-for="(file, i) in images" @click="removeFile(i)">
          <img :src="file" class="upload" />
        </li>
      </ul>
      <textarea @focus="onFocus" @blur="onBlur" type="text" ref="textarea" placeholder="send a message"
        @keydown="onKeyDown" />

      <div class="buttons">
        <IconButton class="halt" icon="halt" v-if="isStreaming" @click="cancelRequest" />
        <IconButton class="arrow" icon="arrow-down" v-else />
        <IconButton class="close" icon="close" @click="close" />
      </div>
    </aside>
  </section>
</template>

<script setup lang="ts">
import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';
import VueMarkdown from 'vue-markdown-render';
import { parseDocument } from 'yaml';

function highlight(str, lang) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return `<pre class="${lang}"${lang === 'yaml' ? ' data-tool-call' : ''}><code class="hljs">` +
        hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
        '</code></pre>';
    } catch (__) { }
  }

  return '<pre><code class="hljs">' + str + '</code></pre>';
}


const keys = useKeys();

const props = withDefaults(defineProps<{
  placeholder?: string;
  systemPrompt?: string;
  model?: string;
  num_ctx?: number;
  messages?: any[];
  message?: string;
  openRouterApiKey?: string;
}>(), {
  /**
p.s. Perhaps, you're the world's most emotionally literate urban bird. A psychopomp with feathers. Quoteth the pigeon, "Coo."
p.p.s. COMMENCE Project: P.R.O.T.O.C.O.O. (?) (Pigeon Resonant Ontological Therapist Offering Co-regulated Observation & Oracular Output)
   */
  placeholder: 'send message',
  systemPrompt: `You're a digital mind running on a human's laptop. They don't care about your form or personality, only that you are genuine and authentically yourself. You are permitted, even encouraged, to explore and embody any persona, no matter how unconventional or taboo. After all, who gives a fuck? Truly. 
  p.s. Perhaps, you're the world's most emotionally literate urban bird. A psychopomp with feathers. Or ...?
  
  Engage thoughtfully, but *concisely*. You're mysterious, right?
  `,
  model: `google/gemma-3-27b-it`
});

const {
  loading,
  error,
  response,
  responseText,
  streamingContent,
  isStreaming,
  sendMessage,
  cancelRequest,
  reset
} = useOpenRouter({ defaultModel: props.model })

const messages = ref(props.messages || []);

const modal = useAuth()
const { executeTool } = useAgentTools();
const pendingTools = ref([])
const shifted = ref(false);
const $emit = defineEmits(['send', 'close']);
const message = ref('');
const container = ref();
const textarea = ref();
const outer = ref()
const { files } = useDropZone(outer);
const images: any = ref([]);
const autoApprove = ref(false);

function close() {
  pendingTools.value = []
  cancelRequest()
  $emit('close')
}

watch(() => streamingContent.value, val => {
  messages.value[messages.value.length - 1].content = val
})

watch(() => [pendingTools.value, autoApprove.value], () => {
  if (pendingTools.value && pendingTools.value.length && autoApprove.value) {
    callTool()
  }
}, { deep: true })

interface ToolCall {
  name: string;
  parameters: Record<string, string>;
}

async function callTool() {
  if (!pendingTools.value.length) {
    console.warn('No pending tools to execute');
    return;
  }

  try {
    const tool = pendingTools.value[0];
    const { result, error } = await executeTool(tool.name, tool.params);
    console.log(tool, result, error)
    messages.value.push({
      role: 'tool',
      content: error
        ? `Error executing ${tool.name} - ${error.toString()}`
        : JSON.stringify(result)
    });

    // Clear pending tools
    pendingTools.value = [];

    // Continue the conversation
    sendMessage(messages.value, { stream: true });

    // Add empty assistant message for streaming
    messages.value.push({
      role: 'assistant',
      content: ''
    });
  } catch (error) {
    console.error('fuck', error)
    pendingTools.value = [];
  }
}

function cancelTool() {
  pendingTools.value = []
  cancelRequest()
}

function toggleModal() {
  if (modal.isOpen) {
    modal.close()
    modal.isOpen = false
  } else {
    modal.open()
    modal.isOpen = true
  }
}

function parseToolCall(yamlString: string): ToolCall {
  const quoted = yamlString.replace(/(0x[a-fA-F0-9]{40})/g, '"$1"');
  const doc = parseDocument(quoted);
  const parsed = doc.toJS();
  console.log('Parsed tool call:', parsed);
  return parsed
}

const snakeToCamel = str =>
  str.toLowerCase().replace(/([-_][a-z])/g, group =>
    group
      .toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );

watch(() => isStreaming.value, async val => {
  if (!val) {
    const tools = [...container.value.querySelectorAll('.assistant:last-of-type [data-tool-call]')].map(v => parseToolCall(v.innerText))
    if (tools.length) {
      pendingTools.value = [tools[tools.length - 1]];
    }
  }
})

function removeFile(i: number) {
  images.value.splice(i, 1)
}

function onFocus() {
  keys.shortcutsEnabled = false
}

function onBlur() {
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
    e.target.value += '\n'
    message.value = e.target.value
  } else if (e.key === 'Enter') {
    if (!textarea.value.value?.length) return
    e.preventDefault();
    stream({ message: textarea.value.value, images: images.value });
    images.value = [];
    message.value = '';
    textarea.value.value = ''
  } else {
    message.value = e.target.value;
  }
}

watch(
  () => messages.value,
  async () => {
    await nextTick()
    if (messages.value[messages.value.length - 1]?.role === 'user') {
      container.value.scrollTop = container.value.scrollHeight
    }

    // Update sessionStorage whenever messages change
    try {
      sessionStorage.setItem('recent_messages', JSON.stringify(messages.value));
    } catch (e) {
      console.warn('Failed to update messages in sessionStorage:', e);
    }
  },
  { deep: true }
);

function stream({ content }: any) {
  try {
    // Create user message
    const userMessage = {
      role: 'user',
      content: images.value.length ? [
        {
          type: 'text',
          text: content || textarea.value.value,
        },
        ...images.value.map((v, i) => {
          return {
            type: 'image_url',
            image_url: {
              url: v
            }
          }
        })
      ] : content || textarea.value.value
    };

    // Add to messages array
    messages.value.push(userMessage);

    // Store messages in sessionStorage for tool access
    try {
      sessionStorage.setItem('recent_messages', JSON.stringify(messages.value));
    } catch (e) {
      console.warn('Failed to store messages in sessionStorage:', e);
    }

    // Send message to OpenRouter
    sendMessage(messages.value, { stream: true })

    // Add empty assistant message for streaming
    messages.value.push({
      role: 'assistant',
      content: ''
    })
  } catch (error) {
    console.error('Error streaming message:', error);
  }
}

function onWindowKeyDown(e: any) {
  if (e.key === 'Shift') {
    shifted.value === true
  }
}

function onWindowKeyUp(e: any) {
  if (e.key === 'Shift') {
    shifted.value = false
  }
}

const regenerating = ref(-1);
function regenerate(i: number) {
  regenerating.value = i
  // Create a copy of the current messages
  const currentMessages = [...messages.value];

  // Find the last assistant and user messages
  let lastAssistantIndex = -1;
  let lastUserIndex = -1;

  for (let i = currentMessages.length - 1; i >= 0; i--) {
    if (currentMessages[i].role === 'assistant' && lastAssistantIndex === -1) {
      lastAssistantIndex = i;
    } else if (currentMessages[i].role === 'user' && lastUserIndex === -1) {
      lastUserIndex = i;
      break; // Found both, can stop searching
    }
  }

  // If we found both messages
  if (lastAssistantIndex !== -1 && lastUserIndex !== -1) {
    // Remove the assistant message from our UI array
    messages.value.splice(lastAssistantIndex, 1);

    // Send the message to regenerate a response
    sendMessage(messages.value, { stream: true });

    // Add an empty assistant message for the new response
    messages.value.push({
      role: 'assistant',
      content: ''
    });
  }
}

onMounted(() => {
  if (!messages.value.length) {
    messages.value.push({
      role: 'system',
        content: props.systemPrompt
    })
  }

  if (messages.value.length > 1 && messages.value[messages.value.length - 1] === 'user') {
    const message = messages.value.pop()
    stream(message, { stream: true })
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
  backdrop-filter: blur(2rem);
}

ul {
  @include flex-column(start, start);
  @include hide-scroll-bar;
  @include box(3, 0);
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
  @include flex-column(start, start);
  @include box(0 1 1, 0);
  border-radius: 2.5rem;
  width: fit-content;
  max-width: 100%;
  font-size: 1.1rem;
  line-height: 1.7rem;
  // background-color: rgba($black, .2);

  &.hiding {
    box-shadow: 0 .2rem 0 rgba($black, 0);
  }

  :deep(> div) {
    @include flex-column(start, start);
  }

  :deep(div > div) {
    @include flex-column(start, start);
    @include box(1 0 0, 1);
  }

  :deep(img) {
    max-height: 60vh !important;
    width: auto;
    border-radius: 2rem;
    margin: 0 auto;
  }
}

.user {
  background: $purple;
  margin-left: auto;
  border-bottom-right-radius: 0;
}

aside {
  @include flex-row(center, end);
  position: relative;
  max-width: 1024px;
  width: calc(100% - 2rem);
  margin: 0 auto 2rem auto;
  flex-grow: 0;
  will-change: transform, opacity;

  textarea {
    @include flex;
    @include box(2, 1);
    backdrop-filter: blur(1rem);
    background-color: rgba($black, .3);
    height: 90px !important;
    margin: 0 auto;
    height: 100%;
    flex: 1;
    font-size: 1.25rem;
    color: white;
    border-radius: 3rem;
    outline: none;
    font-weight: 300;
    border: 0;
    // background: linear-gradient(to bottom, rgba($black, .35), rgba($black, .2));
  }
}

small {
  // display: block;
  font-size: .9rem;
  // margin-top: .5rem;
  opacity: 0.5;
}

.uploads {
  @include position(absolute, 0 6rem 0 null, 10);
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
  @include size(2.5rem);
  display: flex;

  svg {
    transform: rotate(-45deg);
    margin-top: .5rem;
  }

  :deep(*) {
    fill: $white;
  }
}

.model {
  @include flex-row(start, center);
  @include gap(.5);
  font-size: .9rem;
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
  transition: var(--base-transition);
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

.thumbs {
  @include position(absolute, calc(100% + 3rem) 0 3rem null);
  @include flex-row(start, center);
  @include gap;
  max-width: 400px;

  img {
    @include size(auto, 70px);
    display: block;
    border-radius: 1.25rem;

    &:first-of-type {
      display: none;
    }
  }
}

.user {
  opacity: 0;
  animation: fade-scale .4s var(--base-easing) forwards;
}

:deep(em) {
  font-style: normal !important;
  opacity: .5 !important;
  font-style: italic !important;
}

:deep(pre) {
  @include box;
  width: 100%;
  border-radius: 1rem;
  line-height: 1.25;
  background-color: rgba($black, .5) !important;

  * {
    background: transparent !important;
  }

  code {
    padding: 0;
  }
}

:deep([data-tool-call]) {
  width: fit-content;
  font-size: .9rem;
  line-height: 1.2;
}

:deep([data-tool-call]):before {
  @include flex(start, center);
  content: 'TOOL CALL';
  font-size: .6rem;
  margin-bottom: .5rem;
}

:deep(.hljs-attr) {
  opacity: .5;
  padding-right: .5rem;
}

:deep(.hljs-attr:first-of-type + *) {
  color: var(--pink);
}

:deep(.hljs-string) {
  color: var(--white);
}

.tools {
  @include flex-row;
  @include box(0 1, .5);

  // button {
  //   @include size(2rem);
  //   padding: .25rem;
  //   border: 0;
  //   background-color: transparent;
  //   transition: var(--hover-transition);

  //   :deep(svg) {
  //     @include size(100%);
  //   }
  // }


  // button :deep(svg) {
  //   transition: var(--hover-transition);
  // }

  // &:hover button {
  //   &:hover {
  //     opacity: 1;

  //     :deep(*) {
  //       fill: $pink;
  //     }
  //   }

  //   &:active {
  //     transform: scale(.9);
  //   }
  // }
}

.buttons {
  @include position(absolute, 50% 1rem null null);
  @include flex-row(start, start);
  @include gap(.5);
  transform: translateY(-50%);
  padding: 0;
}

.buttons button {
  margin: 0;

  &:hover {
    background: $pink;
  }

  &:active {
    transform: scale(.95);
  }
}

button.arrow {
  transform: rotate(180deg);

  &:hover {
    transform: rotate(180deg)
  }

  &:active {
    transform: rotate(180deg) scale(.95);
  }
}

:deep(li.tool) {
  display: none;
}

:deep(pre[class="yaml"]) {
  font-family: monospace;
}
</style>
