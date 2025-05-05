<template>
  <main>
    <header v-if="study?.iterations?.length">
      <h1>
        Study
        <strong>{{ study._id }}</strong>
      </h1>
      <h2>
        Showing
        <strong>{{ study.iterations?.length }}</strong>
        {{ study?.iterations?.length === 1 ? 'iteration.' : 'iterations.' }}
      </h2>
      <Button @click="createNew">Create New</Button>
    </header>
    <ul>
      <li
        @contextmenu="e=>onContextMenu(e, iteration)"
        v-for="iteration in study?.iterations || []"
        :key="iteration"
        @click="edit(iteration)">
        <Thumbnail :id="iteration" />
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
const { getStudyById, updateStudy } = useStudiesAPI();
const { getSketchById, createNewSketch, deleteSketch } = useSketchAPI();

const editor = useEditor();
const toast = useToast();
const router = useRouter();
const route = useRoute();
const tooltip = useTooltip();
const study: any = ref({});

async function createNew () {
  const { sketch } = await createNewSketch({ 
    shader: DEFAULT_FRAGMENT_SHADER, 
    variants: [DEFAULT_UNIFORMS()],
    study: route.params.id,
  })

  study.value.iterations.push(sketch._id)
  updateStudy(study.value)
}

async function edit(sketchId: any) {
  const { success, sketch } = await getSketchById(sketchId);
  if (!success) return toast.error('Error loading sketch.');
  editor.selectSketch(sketch);
  router.push('/editor');
}

function onContextMenu (e, iteration) {
  e.preventDefault();

  tooltip.show(
    [
      {
        text: `Delete Iteration`,
        action: async () => {
          await deleteSketch(iteration, study.value._id)
          const response = await getStudyById((route.params as any).id);
          if (response?.success && response?.study) study.value = response.study;
        }
      }
    ],
    [e.pageX, e.pageY]
  );

}

onMounted(async () => {
  const response = await getStudyById((route.params as any).id);
  if (response?.success && response?.study) study.value = response.study;
});
</script>

<style lang="scss" scoped>
main {
  padding: var(--outer-padding);
}

header {
  @include flex(flex-start, center, column);
  gap: 1rem;
  margin-bottom: var(--outer-padding);
}

ul,
li {
  list-style: none;
  padding: 0;
}

ul {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

li {
  position: relative;

  &:before {
    @include position(absolute, 0.2rem null null 0.2rem, 20);
    @include size(calc(100% - 0.4rem));
    display: block;
    transition: var(--hover-transition);
    content: '';
    background: radial-gradient(circle, rgba(10, 10, 18, 0) 40%, rgba(10, 10, 18, 1) 100%);
    box-shadow: inset 0 0 10rem 0rem lighten(rgba(10, 10, 18, 0.75), 0%); //, inset 0 0 2rem 0rem darken(rgba(10, 10, 18, 0), 15%);
  }

  &:hover {
    cursor: pointer;

    img {
      transform: scale(1.1);
    }
    span {
      opacity: 0;
    }
    &:before {
      opacity: 0;
    }
  }
}

figure {
  @include size(200px);
  display: block;
  // box-shadow: inset 0 0.5rem 1rem 1rem black;
  transition: var(--hover-transition);
}

li span {
  @include position(absolute, null 1rem 0 null, 20);
  @include size(fit-content, 2.5rem);
  @include flex(center, flex-end, row);
  padding: 1.5rem 0;
  font-size: 0.9rem;
  transition: var(--hover-transition);
  gap: 0.2rem;
  display: inline-flex;
  border-radius: 100%;
  margin: 0 auto;
  font-weight: 300;
  color: rgb(240, 42, 148);

  strong {
    color: var(--white);
    font-weight: 500;
  }
}
h1 {
  color: var(--white);
}
h1,
a {
  font-weight: 300;
  // font-size: 1.5rem;
}

strong {
  color: var(--pink);
}

strong {
  font-weight: 800;
}


header {
  @include flex(flex-start, center, column);
  position: relative;
  // height: 250px;
  background-size: cover !important;
  background-position: center center !important;
  // padding: 3rem;
  gap: 1rem;

  // &:before {
  //   @include position(absolute, 0 50% 0 0, 0);
  //   // background: radial-gradient(circle, rgba(10, 10, 18, 0) 40%, rgba(10, 10, 18, 1) 100%);
  //   content: '';
  //   pointer-events: none;
  // }

  // &:after {
  //   @include position(absolute, 0 0 0 0%, 0);
  //   background: radial-gradient(circle, rgba(10, 10, 18, 0) 0%, rgba(10, 10, 18, 1) 100%);
  //   content: '';
  //   pointer-events: none;
  // }

  * {
    z-index: 1;
  }

  i {
    @include position(absolute, null 0 0 0, 0);
    display: block;
    height: 75%;
    // background: linear-gradient(to top, rgba(black, 0.75), transparent);
  }
}

h1,
h2 {
  font-size: 2rem;
  line-height: 2rem;
  font-weight: 300;

  strong {
    font-weight: bold;
  }
}

h2 {
  font-size: 1.25rem;
  line-height: 1.25rem;
}
</style>
