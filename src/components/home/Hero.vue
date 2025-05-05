<template>
  <section :class="{ playing: audio.player.playing }">
    <div class="content">
      <div class="headline">
        <Demo>
          <strong class="mobile">SOMA</strong>
        </Demo>

        <div class="text">
          <p>
            <strong class="desktop">SOMA</strong>
            <span>Music visualization <br />for the web. </span>
            <Sources />
            <GetStarted />
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const audio = useAudio();
</script>

<style lang="scss" scoped>
section {
  @include size(100%, 100vh);
  @include flex(center, center, row);
  position: relative;

  @include mobile-portrait {
    height: 100%;
    display: block;
    transform: none;
  }

  @include mobile-landscape {
    @include box(3, 1);
  }
}

.content {
  @include mobile {
    height: 100%;
    width: 100vw;
  }

  // @include mobile-landscape {
  //   width: fit-content;
  // }
}

.headline {
  @include flex(center, center, row-reverse);
  @include size(100%);
  gap: 2rem;

  .text {
    @include flex(start, start, column);
    @include size(100%);
    border-top-left-radius: 3rem;
    border-bottom-left-radius: 3rem;

    @include mobile-landscape {
      @include flex-column(center, start);
    }
  }

  @include mobile-portrait {
    gap: 0;
    padding-top: 0;

    .text {
      display: inline;
    }
  }

  p {
    z-index: 0;
    font-size: 2rem;
    line-height: 1;
    font-weight: 300;
    transition: var(--base-transition);
    color: $white;
    width: fit-content;
    padding: 2rem 6rem 2rem 2rem;
    margin-right: -4rem;
    text-wrap: nowrap;
    // mix-blend-mode: screen;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-top-left-radius: 3rem;
    border-bottom-left-radius: 3rem;
    background: transparent !important;
    // overflow: hidden;
    content: '';
    background: transparent !important;

    @include mobile-portrait {
      padding: 1rem;
      margin: 0;
    }

    @include mobile-landscape {
      font-size: 1.25rem;
      flex-shrink: 0;
      
      br {
        display: none;
      }
    }
  }

  br {
    display: none;

    @include mobile {
      display: initial;
    }

    // @include mobile-landscape {
    //   display: none;
    // }
  }

  @include mobile-portrait {
    flex-direction: column;
  }
}

@keyframes bobble {
  0% {
    opacity: 1;
    transform: translateY(-12.5%) translateX(-50vw) scale(1);
  }

  100% {
    opacity: 1;
    transform: translateY(-12.5%) translateX(-500vw) scale(1);
  }
}

strong {
  // @include position(fixed, 50% null null 50%, 0);
  // transform: translate(-50%, -60%) rotate(0deg) scaleX(1) scale(1);
  // display: none;
  line-height: 1;
  // position: absolute;
  // transform-origin: center center;
  // transform: rotate(45deg);
  // left: 0;
  // z-index: -1;
  // display: none;
  // font-size: 100vh;
  font-size: 10rem;

  font-family: 'Bungee Outline';
  font-weight: normal;
  // opacity: 0.25;
  // mix-blend-mode: exclusion;
  @include text-gradient($pink, $purple);
  // mix-blend-mode: screen;
  // color: $orange;
  // opacity: 0.5;
  // mix-blend-mode: soft-light;

  // display: none;

  @include mobile {
    font-size: 7rem;
  }

  @include desktop {
    // display: none;
  }

  // @include mobile {
  //   display: flex;
  // }
}

.mobile {
  display: none;

  @include mobile-portrait {
    display: flex;
  }
}

.desktop {
  display: none;

  @include mobile-landscape {
    display: flex;
    font-size: 4rem;
  }

  @include desktop {
    display: flex;
  }
}

p span {
  // margin-top: -1rem;
  // padding: 2rem 0 0;
  // background: linear-gradient(to top, $black, transparent);
}
</style>
