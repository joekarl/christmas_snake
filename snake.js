"use strict";

const isOppositeDir = (dirA, dirB) => {
  const { DIRECTIONS } = constants;
  return (dirA == DIRECTIONS.UP && dirB == DIRECTIONS.DOWN) ||
    (dirA == DIRECTIONS.DOWN && dirB == DIRECTIONS.UP) ||
    (dirA == DIRECTIONS.LEFT && dirB == DIRECTIONS.RIGHT) ||
    (dirA == DIRECTIONS.RIGHT && dirB == DIRECTIONS.LEFT);

};

function Snake(x, y, dir) {
  const { DIRECTIONS, GRID_SIZE_MAX } = constants;

  this.pos = vec3.fromValues(x, y, 0);
  this.prevPos = vec3.create();
  this.dir = dir;
  this.lastDir = this.dir;
  this.tail = new Array(GRID_SIZE_MAX);
  for (var i = 0; i < GRID_SIZE_MAX; ++i) {
    this.tail[i] = vec3.create();
  }
  this.tailSize = 0;

  this.setDir = (newDir) => {
    if (!isOppositeDir(this.lastDir, newDir)) {
      this.dir = newDir;
    }
  };

  this.move = () => {
    const { DIRECTIONS, GRID_WIDTH_MAX, GRID_HEIGHT_MAX } = constants;
    vec3.copy(this.prevPos, this.pos);
    this.lastDir = this.dir;
    switch (this.dir) {
      case DIRECTIONS.UP:
        this.pos[1] += 1;
        break;
      case DIRECTIONS.DOWN:
        this.pos[1] -= 1;
        break;
      case DIRECTIONS.LEFT:
        this.pos[0] -= 1;
        break;
      case DIRECTIONS.RIGHT:
        this.pos[0] += 1;
        break;
    }

    if (this.pos[0] < 0) {
      this.pos[0] = GRID_WIDTH_MAX - 1;
    } else if (this.pos[0] >= GRID_WIDTH_MAX) {
      this.pos[0] = 0;
    } else if (this.pos[1] < 0) {
      this.pos[1] = GRID_HEIGHT_MAX - 1;
    } else if (this.pos[1] >= GRID_HEIGHT_MAX) {
      this.pos[1] = 0;
    }

    // move the tail
    if (this.tailSize > 0) {
      for (var i = 0; i < this.tailSize - 1; ++i) {
        vec3.copy(this.tail[i], this.tail[i + 1]);
      }
      vec3.copy(this.tail[this.tailSize - 1], this.prevPos);
    }
  };

  this.addToTail = () => {
    vec3.copy(this.tail[this.tailSize], this.prevPos);
    this.tailSize += 1;
  };

  this.selfIntersects = () => {
    for (var i = 0; i < this.tailSize; ++i) {
      if (vec3.equals(this.pos, this.tail[i])) {
        return true;
      }
    }
    return false;
  }
}
