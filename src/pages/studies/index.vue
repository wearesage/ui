<template>
  <main v-if="studies?.length">
    <transition name="fade">
      <header>
        <h1>
          Showing <strong>{{ studies?.length }}</strong> studies.
        </h1>
        <Button @click="createStudy">Create New</Button>
      </header>
    </transition>
    <ul>
      <li
        v-for="(study, i) in studies"
        :key="i"
        @contextmenu="e => onContextMenu(e, study)"
        @click="view(study)">
        <Thumbnail :id="study?.iterations?.[0]" />
        <span v-if="(study as any)?.iterations?.length !== 1">
          +<strong>{{ (study as any).iterations.length - 1 }}</strong>
        </span>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
const router = useRouter();
const studies = ref([])

function view(study: any) {
  router.push(`/studies/${study._id}`);
}

const { getUserStudies, createNewStudy, updateStudy, deleteStudy } = useStudiesAPI()
const { createNewSketch } = useSketchAPI();
const tooltip = useTooltip();

async function createStudy () {
  const { study } = await createNewStudy() as any
  const { sketch } = await createNewSketch({ 
    shader: DEFAULT_FRAGMENT_SHADER, 
    variants: [DEFAULT_UNIFORMS()],
    study: study._id,
  })
  study.iterations.push(sketch._id)
  await updateStudy(study)
  const data = await getUserStudies()
  studies.value = data?.studies.length ? data.studies : []
}

function onContextMenu (e, { _id }) {
  e.preventDefault();

  tooltip.show(
    [
      {
        text: `Delete Study`,
        action: async () => {
          await deleteStudy(_id)
          const data = await getUserStudies()
          studies.value = data?.studies.length ? data.studies : []
        }
      }
    ],
    [e.pageX, e.pageY]
  );

}

onMounted(async () => {
  const data = await getUserStudies()
  studies.value = data?.studies.length ? data.studies : []
})
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

h1 {
  width: 100%;
  color: var(--white);
  font-weight: 300;
  font-size: 2rem;
  line-height: 2rem;
}

strong {
  color: var(--pink);
}

strong {
  font-weight: 800;
}

ul,
li {
  list-style: none;
  padding: 0;
}

ul {
  @include flex(flex-start, flex-start, row);
  flex-wrap: wrap;
}

main > ul {
  @include flex(flex-start, flex-start);
  gap: 1rem;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 auto 2rem auto;
}

figure {
  @include size(200px);
  display: block;
  transition: var(--hover-transition);
}

li {
  position: relative;
  cursor: pointer;


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

  span {
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
  strong {
    @include size(fit-content, 2.5rem);
    @include flex;
  }
}
</style>
