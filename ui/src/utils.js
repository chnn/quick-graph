/* global window */

export const setCanvasDimensions = (canvas, width, height) => {
  const ratio = window.devicePixelRatio || 1;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  canvas.getContext("2d").scale(ratio, ratio);
};
