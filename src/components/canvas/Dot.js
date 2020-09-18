import * as React from 'react';
import { useCanvas } from './Canvas';
import {ID} from '../../util'

export const Dot = ({ x, y, gridSize }) => {
  const idRef = React.useRef(ID());
  const { registerNode, removeNode } = useCanvas();

  function draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = '#ff7f50';
    ctx.arc(x * gridSize, y * gridSize, 3, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.closePath();
  }

  React.useEffect(() => {
    if (registerNode) {
      registerNode(idRef.current, draw);
    }

    return () => removeNode(idRef.current)
  });

  return null;
};
