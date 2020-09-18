import * as React from 'react';
import { useCanvas } from './Canvas';
import { ID, getColName } from '../../util';

export const XAxis = ({ cols, gridSize }) => {
  const idRef = React.useRef(ID());
  const { registerNode, removeNode } = useCanvas();

  React.useEffect(() => {
    function draw(ctx) {
      ctx.textAlign = 'center';
      for (let i = 0; i < cols; i++) {
        const code = getColName(i);
        let offset = gridSize / 2;
        if (code.length > 1) {
          ctx.font = '14px sans-serif';
        } else {
          ctx.font = '16px sans-serif';
        }
        ctx.fillText(code, gridSize + offset + gridSize * i, gridSize / 2);
      }
    }

    if (registerNode) {
      registerNode(idRef.current, draw);
    }
    return () => removeNode(idRef.current);
  }, [cols, gridSize]);

  return null;
};
