import * as React from 'react';
import { useCanvas } from './Canvas';
import { ID, getColName } from '../../util';

export const Img = ({ image, cols, rows, gridSize }) => {
  const idRef = React.useRef(ID());
  const { registerNode, removeNode } = useCanvas();

  React.useEffect(() => {
    function draw(ctx) {
      function drawImageActualSize() {
        ctx.drawImage(
          this,
          gridSize,
          gridSize,
          gridSize * cols,
          gridSize * rows,
        );
      }
      function clearImage() {
        ctx.clearRect(gridSize, gridSize, gridSize * cols, gridSize * rows);
      }
      if (image) {
        const imageEl = new Image(); // Using optional size for image
        imageEl.onload = drawImageActualSize; // Draw when image has loaded
        imageEl.onerror = clearImage;
        imageEl.src = image;
      } else {
        clearImage();
      }
    }

    if (registerNode) {
      registerNode(idRef.current, draw);
    }
    return () => removeNode(idRef.current);
  }, [image, cols, rows, gridSize]);

  return null;
};
