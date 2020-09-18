import * as React from 'react';
import { useCanvas } from './Canvas';
import { ID } from '../../util';

export const Grid = ({ rows, cols, gridSize }) => {
  const idRef = React.useRef(ID());
  const { registerNode, removeNode } = useCanvas();

  React.useEffect(() => {
    function draw(ctx) {
      function drawLine(start, end) {
        const [x, y] = start;
        const [x1, y1] = end;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
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
    if (registerNode) {
      registerNode(idRef.current, draw);
    }
    return () => removeNode(idRef.current);
  }, [rows, cols, gridSize, registerNode]);

  return null;
};
