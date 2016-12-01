"use strict";

const vertexShaderSrc = `
attribute vec3 aVertexPosition;
attribute vec3 aVertexColor;
uniform mat4 uTransform;
varying vec3 vColor;

void main() {
    gl_Position = uTransform * vec4(aVertexPosition, 1.0);
    vColor = aVertexColor;
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
            ["aVertexPosition", "aVertexColor"],
            ["uTransform"]
        )
    };

    gameState.buffers = {
        rectBuffer: createBuffer(gameState.gl, gameState.gl.ARRAY_BUFFER)
    };

    gameState.worldTransform = new mat4();

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
    const { gl, buffers } = gameState;
    const { rectBuffer } = buffers;
    updateBuffer(gl, rectBuffer, new Float32Array([
         0.0,  0.5,  0.0,  1.0,  0.0,  0.0,
        -0.5, -0.5,  0.0,  0.0,  1.0,  0.0,
         0.0, -1.0,  0.0,  1.0,  1.0,  1.0,
         0.0, -1.0,  0.0,  1.0,  1.0,  1.0,
         0.5, -0.5,  0.0,  0.0,  0.0,  1.0,
         0.0,  0.5,  0.0,  1.0,  0.0,  0.0,
    ]));
}

function render(gameState) {
    const { gl, buffers, programs } = gameState;
    const { rectBuffer } = buffers;
    const { colorPoly } = programs;


    // use our program
    enableProgram(gl, colorPoly);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.viewport(0, 0, gameState.canvas.width, gameState.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(rectBuffer.type, rectBuffer);
    gl.vertexAttribPointer(colorPoly.attributes["aVertexPosition"], 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(colorPoly.attributes["aVertexColor"], 3, gl.FLOAT, false, 24, 12);
    gl.uniformMatrix4fv(colorPoly.uniforms["uTransform"], false, );

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// <editor-fold WebGl Boilerplate>

function updateBuffer(gl, buffer, data) {
    gl.bindBuffer(buffer.type, buffer);
    gl.bufferData(buffer.type, data, gl.STATIC_DRAW);
}

function createBuffer(gl, type) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    buffer.type = type;
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