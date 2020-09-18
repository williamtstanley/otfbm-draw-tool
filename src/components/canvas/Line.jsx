import * as React from 'react';
import { useCanvas } from './Canvas';
import { ID } from '../../util';
import { Line as LineRenderer } from '../../util/line';

export const Line = ({ points, gridSize, bg }) => {
  const idRef = React.useRef(ID());
  const { registerNode, removeNode } = useCanvas();

  React.useEffect(() => {
    function draw(ctx) {
      if (points.length) {
        const line = new LineRenderer([...points], bg ? '#FFFFFF' : '#07031a', '#f4f6ff');
        line.draw(ctx, gridSize);
      }
    }

    if (registerNode) {
      registerNode(idRef.current, draw);
    }
    return () => removeNode(idRef.current);
  }, [points, gridSize, bg]);

  return null;
};
