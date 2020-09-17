import Line from './line';

export const getColName = n => {
  var ordA = 'a'.charCodeAt(0);
  var ordZ = 'z'.charCodeAt(0);
  var len = ordZ - ordA + 1;

  var s = '';
  while (n >= 0) {
    s = String.fromCharCode((n % len) + ordA) + s;
    n = Math.floor(n / len) - 1;
  }
  return s.toUpperCase();
};

export default function Canvas(ctx, gridSize, cols, rows, bg) {
  function drawLine(start, end) {
    const [x, y] = start;
    const [x1, y1] = end;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  function drawWall(wall) {
    const line = new Line([...wall], bg ? '#ffffff' : '#07031a', '#f4f6ff');
    line.draw(ctx, gridSize);
  }

  return {
    drawXAxis() {
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
    },
    drawYAxis() {
      ctx.textAlign = 'center';
      for (let i = 0; i < rows; i++) {
        ctx.fillText(i + 1, gridSize / 2, gridSize + 25 + gridSize * i);
      }
    },
    addDot(x, y) {
      ctx.beginPath();
      ctx.fillStyle = '#ff7f50';
      ctx.arc(x * gridSize, y * gridSize, 3, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.closePath();
    },
    clearCanvas(width, height) {
      ctx.clearRect(0, 0, width, height);
    },
    drawLine,
    drawGrid() {
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
    },
    drawWall,
    drawWalls(walls) {
      walls.forEach(wall => {
        drawWall(wall);
      });
    },
  };
}
