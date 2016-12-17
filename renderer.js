"use strict";

const Renderer = (() => {

  const vertexShaderSrc = `
  attribute vec3 aVertexPosition;
  uniform mat4 uTransform;
  uniform vec3 uColor;
  varying vec3 vColor;

  void main() {
      gl_Position = uTransform * vec4(aVertexPosition, 1.0);
      vColor = uColor;
  }
  `;

  const fragmentShaderSrc = `
  precision mediump float;
  varying vec3 vColor;

  void main() {
      gl_FragColor = vec4(vColor, 1.0);
  }
  `;

  // gl specific vars
  var gl;
  var shaders = {};
  var programs = {};
  var buffers = {};
  var currentProgram;

  // render space vars
  var renderSpaceTransform = mat4.create();

  // temporary vars renderer can use
  var tempTransform = mat4.create();

  const initRenderer = (canvasEl) => {
    gl = canvasEl.getContext("webgl");

    shaders.vertex = loadShader(gl.VERTEX_SHADER, vertexShaderSrc)
    shaders.fragment = loadShader(gl.FRAGMENT_SHADER, fragmentShaderSrc);

    programs.colorPoly = createProgram(
      [shaders.vertex, shaders.fragment],
      ["aVertexPosition"],
      ["uTransform", "uColor"]
    );

    buffers.rectBuffer = createBuffer(gl.ARRAY_BUFFER, new Float32Array([
      -1,  1,  0.0,
      -1, -1,  0.0,
       1, -1,  0.0,
       1, -1,  0.0,
      -1,  1,  0.0,
       1,  1,  0.0,
    ]));

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
  };

  const setSize = (width, height) => {
    // in reverse order because matrixes
    mat4.translate(
      renderSpaceTransform,
      renderSpaceTransform,
      vec3.fromValues(-1, -1, 0)
    );
    mat4.scale(
      renderSpaceTransform,
      renderSpaceTransform,
      vec3.fromValues(2 / width, 2 / height, 1)
    );
  };

  // <editor-fold WebGl Boilerplate>
  const updateBuffer = (buffer, data) => {
    gl.bindBuffer(buffer.type, buffer);
    gl.bufferData(buffer.type, data, gl.STATIC_DRAW);
  };

  const createBuffer = (type, data) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    buffer.type = type;
    if (data) {
      gl.bufferData(buffer.type, data, gl.STATIC_DRAW);
    }
    return buffer;
  };

  const loadShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(`Failed to compile shader, info: '${gl.getShaderInfoLog(shader)}'`);
    }
    return shader;
  };

  const createProgram = (shaders = [], attributes = [], uniforms = []) => {
    const program = gl.createProgram();
    program.attributes = {};
    program.uniforms = {};
    shaders.forEach(s => gl.attachShader(program, s));
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      alert(`Failed to link program, info: '${gl.getProgramInfoLog(program)}'`);
    }

    gl.useProgram(program);
    attributes.forEach(a => program.attributes[a] = gl.getAttribLocation(program, a));
    uniforms.forEach(u => program.uniforms[u] = gl.getUniformLocation(program, u));
    return program;
  };

  const enableProgram = (program) => {
    gl.useProgram(program);
    Object.keys(program.attributes).forEach(a => gl.enableVertexAttribArray(program.attributes[a]));
  };
  // </editor-fold>

  // <editor-fold Actual render primitives>

  const drawRect = (color, pos, dim) => {
    const { colorPoly } = programs;
    const { rectBuffer } = buffers;

    if (currentProgram != colorPoly) {
      enableProgram(colorPoly);
      currentProgram = colorPoly;
    }

    gl.bindBuffer(rectBuffer.type, rectBuffer);
    gl.vertexAttribPointer(colorPoly.attributes["aVertexPosition"], 3, gl.FLOAT, false, 12, 0);

    mat4.copy(tempTransform, renderSpaceTransform);
    mat4.translate(tempTransform, tempTransform, pos);
    mat4.scale(tempTransform, tempTransform, dim);
    mat4.scale(tempTransform, tempTransform, vec3.fromValues(0.5, 0.5, 1));

    gl.uniformMatrix4fv(colorPoly.uniforms["uTransform"], false, tempTransform);
    gl.uniform3fv(colorPoly.uniforms["uColor"], color);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  const clearScreen = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    mat4.identity(tempTransform);
  };

  // </editor-fold>

  return {
    initRenderer,
    setSize,
    drawRect,
    clearScreen
  };

})();
