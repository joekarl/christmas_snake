"use strict";

const ChristmasSnake = (()=> {

  const tempVec = vec3.create();

  var gameState = {};

  const initGame = () => {
    const { DIRECTIONS, WIDTH, HEIGHT, SOUNDS } = constants;

    Renderer.initRenderer(document.getElementById("game"));
    Renderer.setSize(WIDTH, HEIGHT);

    SoundManager.init([SOUNDS.JINGLE, SOUNDS.BACKGROUND]);

    SoundManager.play(SOUNDS.BACKGROUND);

    gameState.snake = new Snake(20, 15, DIRECTIONS.UP);
    gameState.clock = 0;
    gameState.updatesPerSecond = 10;
    gameState.framesPerUpdate = calcFramesPerUpdate(gameState.updatesPerSecond);
    gameState.pickupPosition = vec3.create();
    calcRandomPosition(gameState.pickupPosition);

    document.addEventListener('keydown', (e) => {
      switch (e.which) {
        case 37: // left
          gameState.snake.setDir(DIRECTIONS.LEFT);
          break;
        case 38: // up
          gameState.snake.setDir(DIRECTIONS.UP);
          break;
        case 39: // right
          gameState.snake.setDir(DIRECTIONS.RIGHT);
          break;
        case 40: // down
          gameState.snake.setDir(DIRECTIONS.DOWN);
          break;
      }
    });

    runLoop(updateRender);
  };

  const calcFramesPerUpdate = (updatesPerSecond, fps = 60) => {
    return fps / updatesPerSecond;
  };

  const calcRandomPosition = (pos) => {
    const { GRID_WIDTH_MAX, GRID_HEIGHT_MAX } = constants;

    // Returns a random integer between min (included) and max (excluded)
    // Using Math.round() will give you a non-uniform distribution!
    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min)) + min;
    }

    const x = getRandomInt(0, GRID_WIDTH_MAX);
    const y = getRandomInt(0, GRID_HEIGHT_MAX);
    vec3.set(pos, x, y, 0);
  };

  const runLoop = (fn) => {
    const loop = () => {
      fn();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };

  const updateRender = () => {
    const { GRID_SCALE, COLORS, SOUNDS } = constants;

    if (gameState.gameOver) {
      return;
    }

    gameState.clock += 1;
    if (gameState.clock % gameState.framesPerUpdate == 0) {
      gameState.clock = 0;
      gameState.snake.move();

      if (vec3.equals(gameState.snake.pos, gameState.pickupPosition)) {
        gameState.snake.addToTail();
        calcRandomPosition(gameState.pickupPosition);
        SoundManager.play(SOUNDS.JINGLE);
      }

      if (gameState.snake.selfIntersects()) {
        gameState.gameOver = true;
      }
    }

    // draw pickup
    vec3.scale(tempVec, gameState.pickupPosition, GRID_SCALE);
    vec3.add(tempVec, tempVec, vec3.fromValues(GRID_SCALE / 2, GRID_SCALE / 2, 0));
    Renderer.drawRect(COLORS.GREEN, tempVec, vec3.fromValues(GRID_SCALE - 1, GRID_SCALE - 1, 1));

    // draw snake
    vec3.scale(tempVec, gameState.snake.pos, GRID_SCALE);
    vec3.add(tempVec, tempVec, vec3.fromValues(GRID_SCALE / 2, GRID_SCALE / 2, 0));
    Renderer.drawRect(COLORS.RED, tempVec, vec3.fromValues(GRID_SCALE - 1, GRID_SCALE - 1, 1));

    // draw tail
    for (var i = 0; i < gameState.snake.tailSize; ++i) {
      vec3.scale(tempVec, gameState.snake.tail[i], GRID_SCALE);
      vec3.add(tempVec, tempVec, vec3.fromValues(GRID_SCALE / 2, GRID_SCALE / 2, 0));
      Renderer.drawRect(COLORS.RED, tempVec, vec3.fromValues(GRID_SCALE - 1, GRID_SCALE - 1, 1));
    }

  };

  return {
    initGame
  };
})();
