"use strict";

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

function init() {
    const gameState = {};

    gameState.canvas = document.getElementById("game");
    gameState.gl = gameState.canvas.getContext("webgl");

    if (gameState.gl == null) {
        console.log("Browser doesn't support webgl");
        return false;
    }

    gameState.shaders = {
        vertex: loadShader(gameState.gl, gameState.gl.VERTEX_SHADER, vertexShaderSrc),
        fragment: loadShader(gameState.gl, gameState.gl.FRAGMENT_SHADER, fragmentShaderSrc),
    };

    gameState.programs = {
        colorPoly: createProgram(
            gameState.gl,
            [gameState.shaders.vertex, gameState.shaders.fragment],
            ["aVertexPosition"],
            ["uTransform", "uColor"]
        )
    };

    gameState.buffers = {
        rectBuffer: createBuffer(gameState.gl, gameState.gl.ARRAY_BUFFER, new Float32Array([
          -1,  1,  0.0,
          -1, -1,  0.0,
           1, -1,  0.0,
           1, -1,  0.0,
          -1,  1,  0.0,
           1,  1,  0.0,
        ]))
    };

    gameState.colors = {
      green: vec3.fromValues(0.0, 1.0, 0.0),
      red: vec3.fromValues(1, 0, 0)
    };

    gameState.worldTransform = mat4.create();
    // in reverse order because matrixes
    mat4.translate(
      gameState.worldTransform,
      gameState.worldTransform,
      vec3.fromValues(-1, -1, 0)
    );
    mat4.scale(
      gameState.worldTransform,
      gameState.worldTransform,
      vec3.fromValues(2 / 800, 2 / 600, 1)
    );

    gameState.boxes = [
      createBox(
        vec3.fromValues(10, 10, 1),
        gameState.colors.red,
        300,
        200
      ),
      createBox(
        vec3.fromValues(10, 10, 1),
        gameState.colors.green,
        700,
        400
      )
    ];

    runLoop([update, render].map(fn => fn.bind(null, gameState)));
}

function runLoop(fns) {
    const loop = () => {
        fns.forEach(fn => fn());
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

function update(gameState) {
    const { boxes } = gameState;

    boxes.forEach((b) => {
      if (b.left) {
        b.interpolator -= 0.01;
        if (b.interpolator < 0) {
          b.interpolator = 0;
          b.left = false;
        }
      } else {
        b.interpolator += 0.01;
        if (b.interpolator > 1) {
          b.interpolator = 1;
          b.left = true;
        }
      }
      mat4.identity(b.transform);
      mat4.translate(
        b.transform,
        b.transform,
        vec3.fromValues(800 * b.interpolator, b.y, 0)
      );
      mat4.scale(
        b.transform,
        b.transform,
        b.size
      );
    });
}

function render(gameState) {
    const { gl, buffers, programs, boxes } = gameState;
    const { rectBuffer } = buffers;
    const { colorPoly } = programs;


    // use our program
    enableProgram(gl, colorPoly);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    boxes.forEach(({transform, color}) => {
      gl.bindBuffer(rectBuffer.type, rectBuffer);
      gl.vertexAttribPointer(colorPoly.attributes["aVertexPosition"], 3, gl.FLOAT, false, 12, 0);

      const finalTransform = mat4.create();
      mat4.multiply(finalTransform, gameState.worldTransform, transform);

      gl.uniformMatrix4fv(colorPoly.uniforms["uTransform"], false, finalTransform);
      gl.uniform3fv(colorPoly.uniforms["uColor"], color);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });
}

function createBox(size, color, x, y) {
  return {
    size,
    color,
    x,
    y,
    interpolator : x / 800,
    left : true,
    transform : mat4.create()
  }
}

// <editor-fold WebGl Boilerplate>

function updateBuffer(gl, buffer, data) {
    gl.bindBuffer(buffer.type, buffer);
    gl.bufferData(buffer.type, data, gl.STATIC_DRAW);
}

function createBuffer(gl, type, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    buffer.type = type;
    if (data) {
      gl.bufferData(buffer.type, data, gl.STATIC_DRAW);
    }
    return buffer;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(`Failed to compile shader, info: '${gl.getShaderInfoLog(shader)}'`);
    }
    return shader;
}

function createProgram(gl, shaders = [], attributes = [], uniforms = []) {
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
}

function enableProgram(gl, program) {
    gl.useProgram(program);
    Object.keys(program.attributes).forEach(a => gl.enableVertexAttribArray(program.attributes[a]));
}

// </editor-fold>

init();
