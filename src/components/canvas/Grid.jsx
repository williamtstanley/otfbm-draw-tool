import * as React from 'react';
import {useCanvas} from './Canvas';

export const Grid = ({rows, cols, gridSize}) => {
  const ctx = useCanvas();
  
  function drawLine(start, end) {
    const [x, y] = start;
    const [x1, y1] = end;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
    function drawGrid() {
      rows = Number(rows);
      cols = Number(cols);
      ctx.strokeStyle = 'grey';
      // cols
      for (let i = 1; i <= cols + 1; i++) {
        drawLine(
          [gridSize * i, gridSize],
          [gridSize * i, (rows + 1) * gridSize],
        );
      }
      for (let j = 1; j <= rows + 1; j++) {
        drawLine(
          [gridSize, gridSize * j],
          [(cols + 1) * gridSize, gridSize * j],
        );
      }
    }

  React.useEffect(() => {
    if (ctx) {
      ctx.save();
       drawGrid();
      //logic here

      ctx.restore();
    }
  });
  
  return null;
}
