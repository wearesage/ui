export default class Plane {
  private ctx: WebGLRenderingContext;
  public vertexBuffer: WebGLBuffer | null;
  public indexBuffer: WebGLBuffer | null;
  private program: WebGLProgram;

  constructor(ctx: WebGLRenderingContext | null, program: WebGLProgram) {
    if (ctx === null) throw Error('WebGLRenderingContext was null.');

    this.ctx = ctx;
    this.program = program;

    // Enable face culling
    this.ctx.enable(this.ctx.CULL_FACE);
    this.ctx.cullFace(this.ctx.BACK);
    this.ctx.frontFace(this.ctx.CCW);

    // Create and bind vertex buffer
    this.vertexBuffer = this.ctx.createBuffer();
    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vertexBuffer);
    this.ctx.bufferData(
      this.ctx.ARRAY_BUFFER,
      new Float32Array([
        -1, -1, // Vertex 0
         1, -1, // Vertex 1
         1,  1, // Vertex 2
        -1,  1  // Vertex 3
      ]),
      this.ctx.STATIC_DRAW
    );

    // Create and bind index buffer
    this.indexBuffer = this.ctx.createBuffer();
    this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.ctx.bufferData(
      this.ctx.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([
        0, 1, 2, // Triangle 1
        2, 3, 0  // Triangle 2
      ]),
      this.ctx.STATIC_DRAW
    );
  }

  render() {
    // Use the shader program
    this.ctx.useProgram(this.program);

    // Bind buffers
    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vertexBuffer);
    this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    // Set up vertex attributes
    const positionLocation = this.ctx.getAttribLocation(this.program, 'position');
    if (positionLocation === -1) {
      console.error('Attribute a_position not found in shader program');
      return;
    }
    this.ctx.enableVertexAttribArray(positionLocation);
    this.ctx.vertexAttribPointer(positionLocation, 2, this.ctx.FLOAT, false, 0, 0);

    // Draw the elements
    this.ctx.drawElements(this.ctx.TRIANGLES, 6, this.ctx.UNSIGNED_SHORT, 0);

    // Disable the attribute array (optional)
    // this.ctx.disableVertexAttribArray(positionLocation);
  }
}
