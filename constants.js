"use strict";
const constants = (() => {
  const DIRECTIONS = {
    UP: 1,
    RIGHT: 2,
    DOWN: 3,
    LEFT: 4
  };
  const WIDTH = 800;
  const HEIGHT = 600;
  const GRID_SCALE = 20;
  const GRID_WIDTH_MAX = WIDTH / GRID_SCALE;
  const GRID_HEIGHT_MAX = HEIGHT / GRID_SCALE;
  const COLORS = Object.freeze({
    GREEN: vec3.fromValues(0.0, 1.0, 0.0),
    RED: vec3.fromValues(1, 0, 0)
  });
  const GRID_SIZE_MAX = GRID_WIDTH_MAX * GRID_HEIGHT_MAX;
  const SOUNDS = Object.freeze({
    JINGLE: 'jingle.mp3',
    BACKGROUND: 'background_music.mp3'
  });

  return Object.freeze({
    DIRECTIONS,
    WIDTH,
    HEIGHT,
    GRID_SCALE,
    GRID_WIDTH_MAX,
    GRID_HEIGHT_MAX,
    GRID_SIZE_MAX,
    COLORS,
    SOUNDS
  });
})();
