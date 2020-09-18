import * as React from 'react';
import { useCanvas } from './Canvas';
import { ID, getColName } from '../../util';

export const YAxis = ({ rows, gridSize }) => {
  const idRef = React.useRef(ID());
  const { registerNode, removeNode } = useCanvas();

  React.useEffect(() => {
    function draw(ctx) {
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      for (let i = 0; i < rows; i++) {
        ctx.fillText(i + 1, gridSize / 2, gridSize + 25 + gridSize * i);
      }
    }

    if (registerNode) {
      registerNode(idRef.current, draw);
    }
    return () => removeNode(idRef.current);
  }, [rows, gridSize]);

  return null;
};
