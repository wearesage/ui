<template>
  <div class="lyrics-container">
    <aside ref="container">
      <p 
        v-for="(text, i) in lines" 
        :key="i"
        :class="{ 'selected': isLineSelected(i) }"
        @click="toggleLineSelection(i, $event)"
      >
        <span 
          v-for="(char, j) in text" 
          :key="j" 
          :class="{ 
            highlighted: lyrics.activeIndex > i || (lyrics.activeIndex === i && progress >= j / text.length),
          }"
        >{{ char }}</span>
      </p>
    </aside>
  </div>
</template>

<script setup lang="ts">
const $emit = defineEmits(['select'])
const audio = useAudio(); 
const container = ref(null);
const { currentTrack, lyrics } = usePlaylist();
const progress = computed(() => lyrics.progress)
const lines = computed(() => lyrics.processed?.map(v => v.text.split('')));
const { selected, isLineSelected, toggleLineSelection } = useLineSelection({ container, lines, audio })
const keys = useKeys();
const message = ref('')
const selectedSplit = computed(() => selected.value.split('\n'))

watch(() => [selectedSplit.value, selected.value], () => {
  $emit('select', { selectedSplit: selectedSplit.value, selected: selected.value })
})
</script>

<style scoped lang="scss">
.lyrics-container {
  @include size(100%);
  will-change: transform, opacity;
  position: relative;
  z-index: 5;
}

aside {
  @include size(100%);
  @include box(3);
  padding-bottom: 50vh;
  overflow-y: auto;
  user-select: none;
  transition: var(--base-transition);

  p {
    color: rgba(255, 255, 255, 0.5);
    font-size: 1.25rem;
    font-family: 'Red Hat Mono', monospace;
    padding: 0.25rem 0;
    cursor: pointer;
    position: relative;
    
    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    
    &.selected {
      background: linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
      
      &::before {
        content: '';
        position: absolute;
        left: -1rem;
        top: 0;
        bottom: 0;
        width: 4px;
        background: var(--pink);
      }
    }
  }
}

span {
  transition: all 100ms ease;
  
  &.highlighted {
    color: white;
  }
}
</style>