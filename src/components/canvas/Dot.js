import * as React from 'react';
import { useCanvas } from './Canvas';

export const Dot = ({ x, y, gridSize }) => {
  const ctx = useCanvas();

  function drawDot() {
    ctx.beginPath();
    ctx.fillStyle = '#ff7f50';
    ctx.arc(x * gridSize, y * gridSize, 3, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.closePath();
  }

  React.useEffect(() => {
    if (ctx) {
      ctx.save();
      //logic here
      drawDot();
      ctx.restore();
    }
  });

  return null;
};
