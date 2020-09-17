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

export default function Canvas(ctx, gridSize, rows, cols) {
  function drawLine(start, end) {
    const [x, y] = start;
    const [x1, y1] = end;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  function drawDoor(type, start, end) {
    // left / right / up / down / angle
    const direction =
      start[1] === end[1]
        ? 'horizontal'
        : start[0] === end[0]
        ? 'vertical'
        : 'angle';
    const vert = direction === 'vertical';
    const horizontal = direction === 'horizontal';
    let x, y, width, height, offsetX, offsetY;
    if (horizontal) {
      y = start[1];
      const diff = Math.max(start[0], end[0]) - Math.min(start[0], end[0]);
      x = Math.min(start[0], end[0]) + diff / 2;
      width = 16;
      height = 6;
      offsetX = x - 8;
      offsetY = y - 3;
    }

    if (vert) {
      x = start[0];
      const diff = Math.max(start[1], end[1]) - Math.min(start[1], end[1]);
      y = Math.min(start[1], end[1]) + diff / 2;
      width = 6;
      height = 16;
      offsetX = x - 3;
      offsetY = y - 8;
    }

    ctx.lineWidth = 1;
    const renderDoor = {
      '-o': () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(offsetX, offsetY, width, height);
      },
      '-d': () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(offsetX, offsetY, width, height);
        ctx.strokeRect(offsetX, offsetY, width, height);
      },
      '-b': () => {
        ctx.fillStyle = '#ffffff';
        if (vert) {
          ctx.fillRect(offsetX, y - 8, width, height / 2);
          ctx.strokeRect(offsetX, y - 8, width, height / 2);
          ctx.fillRect(offsetX, y, width, height / 2);
          ctx.strokeRect(offsetX, y, width, height / 2);
        } else if (horizontal) {
          ctx.fillRect(x - 8, offsetY, width / 2, height);
          ctx.strokeRect(x - 8, offsetY, width / 2, height);
          ctx.fillRect(x, offsetY, width / 2, height);
          ctx.strokeRect(x, offsetY, width / 2, height);
        }
      },
      '-s': () => {
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(offsetX, offsetY, width, height);
        ctx.fillStyle = '#000';
        ctx.fillText('$', x, y + 6);
      },
    }[type];

    renderDoor();
  }

  const drawDoors = wall => {
    const [start, ...rest] = wall;
    let previous = start;
    rest.forEach(section => {
      if (section.length === 3) {
        const [, , door] = section;
        drawDoor(door, previous, section);
      }
      previous = section;
    });
  };

  function drawWall(wall) {
    const [start, ...rest] = wall;
    ctx.beginPath();
    ctx.moveTo(...start);
    let previous = start;
    rest.forEach(section => {
      ctx.lineTo(...section);
      if (section.length === 3) {
        const [, , door] = section;
        drawDoor(door, previous, section);
      }
      previous = section;
    });
    ctx.lineWidth = 2;
    ctx.stroke();
    drawDoors(wall);
  }

  return {
    drawXAxis(count, step) {
      ctx.textAlign = 'center';
      for (let i = 0; i < count; i++) {
        const code = getColName(i);
        let offset = 10;
        if (code.length > 1) {
          ctx.font = '12px sans-serif';
        } else {
          ctx.font = '14px sans-serif';
        }
        ctx.fillText(code, step + offset + step * i, 15);
      }
    },
    drawYAxis(count, step) {
      ctx.textAlign = 'center';
      for (let i = 0; i < count; i++) {
        ctx.fillText(i + 1, 7, step + 15 + step * i);
      }
    },
    addDot(x, y) {
      ctx.beginPath();
      ctx.fillStyle = '#ff7f50';
      ctx.arc(x, y, 3, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.closePath();
    },
    clearCanvas(width, height) {
      ctx.clearRect(0, 0, width, height);
    },
    drawLine,
    drawGrid(rows, cols) {
      rows = Number(rows);
      cols = Number(cols);
      ctx.strokeStyle = 'grey';
      // cols
      for (let i = 1; i <= cols + 1; i++) {
        drawLine([20 * i, 20], [20 * i, (rows + 1) * 20]);
      }
      for (let j = 1; j <= rows + 1; j++) {
        drawLine([20, 20 * j], [(cols + 1) * 20, 20 * j]);
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
