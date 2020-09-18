import * as React from 'react';
import { useCanvas } from './Canvas';
import {ID} from '../../util';
import {Line as LineRenderer} from '../../util/line';

export const Line = ({ points, gridSize }) => {
  const idRef = React.useRef(ID());
  const { registerNode, removeNode } = useCanvas();

  function draw(ctx) {
    if (points.length) {
      const line = new LineRenderer([...points], '#07031a', '#f4f6ff');
      line.draw(ctx, gridSize)
    }
  }

  React.useEffect(() => {
    if (registerNode) {
      registerNode(idRef.current, draw);
    }
    return () => removeNode(idRef.current)
  });

  return null;
};
