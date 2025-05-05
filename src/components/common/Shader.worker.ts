import { ref } from 'vue';
import { createWebGL2App, createWebGL2Context } from '@util';

const program = ref();

function initialize() {
  program.value?.cleanup?.();

  if (!canvas.value) return;

  ctx.value = createWebGL2Context(canvas.value);

  program.value = createWebGL2App({
    ctx: ctx.value,
    fragmentShader: internalFragmentShader.value,
    vertexShader: internalVertexShader.value,
    uniforms: uniforms.value,
    onError(err: any) {
      error.value = err;
    },
    onSuccess() {
      error.value = null;
    },
  });

  if (!program.value) {
    return;
  }

  if (props.animate) {
    raf.add(
      {
        tick() {
          render();
        },
      },
      id.value
    );

    return;
  }

  render();
}

function render() {
  if (!program.value) return initialize();

  try {
    program.value.uniforms.resolution.set([size.value.width * dpr.value, size.value.height * dpr.value]);
    program.value.uniforms.time.set(window.performance.now() / 1000);
    program.value.uniforms.stream.set(stream.value);
    program.value.uniforms.volume.set(volume.value);

    const uniforms = externalUniforms.value;

    uniforms.forEach((uniform: any) => {
      program.value.uniforms[uniform[0]].set(uniform[2]);

      if (uniform[1] !== 1) return;

      if (tweeningUniforms.value.indexOf(uniform[0]) !== -1) {
        program.value.uniforms[`${uniform[0]}Tween`].set(true);
        program.value.uniforms[`${uniform[0]}TweenProgress`].set(tweenProgress.value);
      } else {
        program.value.uniforms[`${uniform[0]}Tween`].set(false);
        program.value.uniforms[`${uniform[0]}TweenProgress`].set(0);
      }
    });

    program.value.render();

    INITIALIZATION_RETRIES = 0;
  } catch (e) {
    INITIALIZATION_RETRIES++;

    if (INITIALIZATION_RETRIES < 3) {
      initialize();
      if (!props.animate) render();
    }
  }
}