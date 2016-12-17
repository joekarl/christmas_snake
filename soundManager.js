"use strict";

var SoundManager = (() => {

  const sounds = {};

  const init = (soundsToLoad = []) => {
    soundsToLoad.forEach((s) => {
      sounds[s] = new Howl({
        src: s
      });
    });
  };

  const play = (sound, repeat = false) => {
    sounds[sound].play();
  };

  return {
    init,
    play
  }
})();
