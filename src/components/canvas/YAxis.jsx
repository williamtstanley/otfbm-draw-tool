import * as React from 'react';
import { useCanvas } from './Canvas';
import { ID, getColName } from '../../util';

export const YAxis = ({ rows, gridSize }) => {
  const idRef = React.useRef(ID());
  const { registerNode, removeNode } = useCanvas();

  React.useEffect(() => {
    function draw(ctx) {
      const px = Math.round(gridSize / 2.5);
      ctx.font = `${px}px sans-serif`;
      ctx.textAlign = 'center';
      for (let i = 0; i < rows; i++) {
        ctx.fillText(
          i + 1,
          gridSize / 2,
          gridSize + Math.round(gridSize / 1.6) + gridSize * i,
        );
      }
    }

    if (registerNode) {
      registerNode(idRef.current, draw);
    }
    return () => removeNode(idRef.current);
  }, [rows, gridSize]);

  return null;
};
