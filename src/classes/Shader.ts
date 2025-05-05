export type ShaderConfig = {
  parent?: HTMLElement | string | undefined;
  dpr?: number;
  onResize?: ({ width, height, dpr }: any) => unknown;
  debug?: boolean;
  vertexShader?: string;
  fragmentShader?: string;
  uniforms?: UniformTuple[];
  animate?: boolean;
  shader?: string;
  shaderpad?: boolean;
  onError?: (a: any, b: any) => any;
};

interface ShaderState {
  uniforms?: Record<string, Uniform>;
  volume: number;
  internalUniforms: UniformTuple[];
  stream: number;
  animate: boolean;
  width: number;
  height: number;
}

export default class Shader {
  public config: ShaderConfig;
  private canvas: HTMLCanvasElement;
  private observer: ResizeObserver;
  private ctx: WebGL2RenderingContext;
  public state: ShaderState;
  private plane: Plane;
  private program: WebGLProgram | null;
  private cleanup: () => void;
  private _destroying: boolean = false;

  constructor(config: ShaderConfig) {
    const parent: HTMLElement =
      typeof config.parent === 'string'
        ? (document.querySelector(config.parent) as HTMLElement)
        : config.parent || (document.body as HTMLElement);

    this.config = {
      debug: false,
      vertexShader: DEFAULT_VERTEX_SHADER,
      fragmentShader: DEFAULT_FRAGMENT_SHADER,
      uniforms: DEFAULT_UNIFORMS(),
      animate: false,
      shaderpad: false,
      ...(config || {}),
      parent,
    };

    if (typeof config?.shader === 'string') {
      this.config.fragmentShader = config.shader as string;
    }

    this.state = {
      width: 0,
      height: 0,
      dpr: config?.dpr || (window || { devicePixelRatio: 1 }).devicePixelRatio,
      volume: 1,
      stream: 0,
      internalUniforms: INTERNAL_UNIFORMS(),
      animate: this.config.animate || false,
    } as any;

    const { canvas, observer, ctx } = this.initContext();

    this.canvas = canvas;
    this.observer = observer;
    this.ctx = ctx;

    this.canvas?.addEventListener?.('webglcontextlost', () => {
      if (this._destroying) return console.log('destroying on purpose?');
      this.config.onError?.({ type: 'CONTEXT_LOST' }, this);
    });

    const { plane, program, uniforms, cleanup }: any = this.initProgram();

    this.plane = plane;
    this.program = program;
    this.state.uniforms = uniforms;
    this.cleanup = cleanup;
    this.tick = this.tick.bind(this);
    requestAnimationFrame(this.tick);
    this.log('self', this);
  }

  get dpr() {
    return this.config.dpr || (window || { devicePixelRatio: 1 }).devicePixelRatio;
  }

  set dpr(value: number) {
    this.config.dpr = value;
    this.size = { width: this.state.width, height: this.state.height };
  }

  get thumbnail() {
    return this.canvas?.toDataURL('image/jpeg', .9);
  }

  get print() {
    return this.canvas?.toDataURL('image/png');
  }

  set size({ width, height, dpr }: { width: number; height: number; dpr?: number }) {
    if (!this.canvas) return;

    this.state.width = width;
    this.state.height = height;

    const size = {
      width: this.state.width,
      height: this.state.height,
      dpr: dpr || this.dpr,
    };

    sizeCanvas(this.canvas, size);
    this.state.internalUniforms[0][2] = [size.width * size.dpr, size.height * size.dpr];
    this.ctx.viewport(0, 0, size.width * size.dpr, size.height * size.dpr);
    this.config?.onResize?.(size);
    this.log('size', size);
  }

  get vertexShader() {
    const shader = `
${this.config.vertexShader}
`;

    this.log('vertex', shader);

    return shader;
  }

  get fragmentShader() {
    const shader = `
${DEFAULT_DEFS.join('\n')}

${this.uniformDeclarations}

${GLSL_UTILS}

${
  this.config.shaderpad
    ? `void main () {
  vec2 uv = k_uv(gl_FragCoord);
${this.config.fragmentShader}
  gl_FragColor = vec4(color, 1.);
}`
    : this.config.fragmentShader
}
`;

    this.log('fragment', shader);

    return shader;
  }

  set stream(value: number) {
    this.state.stream = value;
  }

  set volume(value: number) {
    this.state.volume = value;
  }

  get uniforms() {
    const uniforms = [...this.state.internalUniforms, ...(this.config?.uniforms || [])];

    return uniforms;
  }

  set uniform(uniform: UniformTuple) {
    this.config.uniforms?.forEach(u => {
      if (u[0] === uniform[0]) u[2] = uniform[2];
    });
  }

  get uniformDeclarations() {
    console.log(this.uniforms)
    return this.uniforms.reduce((acc, [name, type]) => {
      acc += `uniform ${SHADER_TYPE_MAP[type]} ${name};\n`;

      if (type === 1) {
        acc += `uniform ${SHADER_TYPE_MAP[type]} ${name}Tween;\n`;
        acc += `uniform float ${name}TweenProgress;\n`;
      }

      return acc;
    }, '');
  }

  initContext() {
    const canvas = createCanvas({
      parent: this.config.parent as HTMLElement,
      dpr: this.dpr,
    });
    ``;
    const observer = createResizeObserver(this.config.parent as HTMLElement, size => {
      requestAnimationFrame(() => {
        this.size = size;
      });
    });

    const ctx = createWebGL2Context(canvas);

    return { canvas, observer, ctx };
  }

  initProgram() {
    return (
      createWebGL2App({
        ctx: this.ctx,
        uniforms: this.uniforms,
        fragmentShader: this.fragmentShader,
        vertexShader: this.vertexShader,
        onError(e: any) {
          console.log(e);
        },
      }) || null
    );
  }

  tick(now: DOMHighResTimeStamp) {
    if (!this.ctx) return;

    this.state.internalUniforms[0][2] = [this.canvas.width, this.canvas.height];
    this.state.internalUniforms[1][2] = now / 1000;
    this.state.internalUniforms[2][2] = this.state.stream || now / 1000;
    this.state.internalUniforms[3][2] = this.state.volume;

    this.uniforms?.forEach(uniform => {
      if ((this as any).state.uniforms[uniform[0]].set(uniform[2]) === false) {
        this.config.onError?.('Error setting uniform', this);
      }
    });

    this.plane.render();

    if (this.config.animate) {
      requestAnimationFrame(this.tick);
    }
  }

  log(label: string, data: unknown) {
    if (this.config.debug) log('shader', label, data);
  }

  rebuild({ fragmentShader, uniforms }: { fragmentShader: string; uniforms?: UniformTuple[] }) {
    this.cleanup();

    this.config.fragmentShader = fragmentShader;
    this.config.uniforms = uniforms;

    const { plane, program, uniforms: uniformState, cleanup }: any = this.initProgram();

    this.plane = plane;
    this.program = program;
    this.state.uniforms = uniformState;
    this.cleanup = cleanup;
    this.tick();
  }

  destroy() {
    console.log('destroying');
    this._destroying = true;
    this.cleanup();
    this.observer.disconnect();
    this.canvas.remove();
    this.log('destroy', null);
    this._destroying = false;
  }
}
