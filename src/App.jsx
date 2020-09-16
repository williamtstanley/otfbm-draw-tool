import * as React from 'react';

const drawLine = (ctx, start, end) => {
  const [x, y] = start;
  const [x1, y1] = end;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x1, y1);
  ctx.stroke();
};

const drawGrid = (context, rows, cols) => {
  rows = Number(rows);
  cols = Number(cols);
  context.strokeStyle = 'grey';
  // cols
  for (let i = 1; i <= cols + 1; i++) {
    drawLine(context, [20 * i, 20], [20 * i, (rows + 1) * 20]);
  }
  for (let j = 1; j <= rows + 1; j++) {
    drawLine(context, [20, 20 * j], [(cols + 1) * 20, 20 * j]);
  }
};

const clearCanvas = (ctx, width, height) => {
  ctx.clearRect(0, 0, width, height);
};

const addDot = (context, x, y) => {
  context.beginPath();
  context.fillStyle = '#ff7f50';
  context.arc(x, y, 3, 0, Math.PI * 2, true);
  context.fill();
  context.fillStyle = '#000';
  context.closePath();
};

const round = (n, step) => Math.round(n / step) * step;
const getNearestPoint = (x, y) => {
  return [round(x, 20), round(y, 20)];
};

const drawWall = (ctx, wall) => {
  const [start, ...rest] = wall;
  if (start.length > 2) {
    // console.log("we got a door?");
  }
  ctx.beginPath();
  ctx.moveTo(...start);
  rest.forEach(section => {
    ctx.lineTo(...section);
  });
  ctx.stroke();
};

const drawWalls = (ctx, walls) => {
  walls.forEach(wall => {
    drawWall(ctx, wall);
  });
};

const renderWallString = (walls, step, xAxis) => {
  if (walls.length < 1) return;
  return walls
    .map(wall => {
      return wall.length
        ? `_${wall
            .map(point => {
              const door = point[2];
              const [_x, _y] = point.map(n => {
                return (n - step) / step;
              });
              const x = xAxis[_x];
              const y = _y + 1;
              return `${door ? door : ''}${x}${y}`;
            })
            .join('')}`
        : '';
    })
    .join('');
};

const getColName = n => {
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

const drawXAxis = (ctx, count, step) => {
  ctx.textAlign = 'center';
  for (let i = 0; i < count; i++) {
    const code = getColName(i);
    let offset = 10;
    if (code.length > 1) {
      ctx.font = '12px sans-serif';
      offset = 2;
    } else {
      ctx.font = '14px sans-serif';
    }
    ctx.fillText(code, step + offset + step * i, 15);
  }
};

const drawYAxis = (ctx, count, step) => {
  ctx.textAlign = 'center';
  for (let i = 0; i < count; i++) {
    ctx.fillText(i + 1, 7, step + 15 + step * i);
  }
};

function App() {
  const ref = React.useRef();
  const gridSize = 20;
  const [cols, setCols] = React.useState(20);
  const [rows, setRows] = React.useState(15);
  const [door, setDoor] = React.useState('');

  const [context, setContext] = React.useState();
  const dotRef = React.useRef();
  const [walls, setWalls] = React.useState([]);
  const [currentWall, setCurrentWall] = React.useState([]);

  const handleClick = React.useCallback(
    e => {
      if (currentWall.length) {
        setCurrentWall(s => [...s, [...dotRef.current, door].filter(Boolean)]);
        setDoor('');
      } else {
        setCurrentWall(s => [...s, dotRef.current]);
      }
    },
    [setCurrentWall, door, currentWall],
  );

  const renderCanvas = React.useCallback(() => {
    ref.current.height = rows * gridSize + 40;
    ref.current.width = cols * gridSize + 40;
    clearCanvas(context, ref.current.height, ref.current.width);
    context.strokeRect(gridSize, gridSize, cols * gridSize, rows * gridSize);
    context.font = '14px sans-serif';
    drawXAxis(context, cols, gridSize);
    drawYAxis(context, rows, gridSize);
    drawGrid(context, rows, cols);
    if (currentWall.length) {
      context.strokeStyle = 'red';
      drawWall(context, currentWall);

      if (currentWall.length > 3) {
        // triangle 4 clicks to close
        let first = currentWall[0].join('');
        let last = currentWall[currentWall.length - 1].join('');
        if (first === last) {
          // closed the loop
          setWalls(s => [...s, currentWall]);
          setCurrentWall([]);
        }
      }
    }
    if (walls.length) {
      context.strokeStyle = 'black';
      drawWalls(context, walls);
    }
  }, [context, walls, rows, cols, currentWall]);

  React.useEffect(() => {
    if (ref.current) {
      const renderCtx = ref.current.getContext('2d');

      if (renderCtx && !context) {
        setContext(renderCtx);
      }
    }

    const handleMouseOver = e => {
      let canvasOffsetLeft = ref.current.offsetLeft;
      let canvasOffsetTop = ref.current.offsetTop;
      const _x = e.clientX - canvasOffsetLeft;
      const _y = e.clientY - canvasOffsetTop;

      const [x, y] = getNearestPoint(_x, _y);

      if (
        x >= gridSize &&
        x <= gridSize * (cols + 1) &&
        y >= gridSize &&
        y <= gridSize * (rows + 1)
      ) {
        renderCanvas();
        addDot(context, x, y);
        dotRef.current = [x, y];
      }
    };

    if (context) {
      ref.current.addEventListener('mousemove', handleMouseOver);
      ref.current.addEventListener('click', handleClick);
      renderCanvas();
    }
    const canvas = ref.current;
    return () => {
      canvas.removeEventListener('mousemove', handleMouseOver);
      canvas.removeEventListener('click', handleClick);
    };
  });
  const getButtonStyle = n => {
    return {
      backgroundColor: n === door ? 'lightgreen' : '',
    };
  };

  const toggleDoor = name => {
    return () => setDoor(s => (s === name ? '' : name));
  };
  const xAxis = [...Array(Number(cols))].map((_, i) => getColName(i));
  return (
    <div
      style={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1>OTFBM Draw Tool</h1>
      <div
        style={{
          display: 'flex',
        }}
      >
        <div>
          <div style={{ minHeight: '30px' }}>
            <div style={{maxWidth: '400px'}}>
              WallString:{' '}
              {currentWall.length || walls.length ? (
                <>
                  {renderWallString([...walls, currentWall], gridSize, xAxis)}{' '}
                  <button
                    onClick={e => {
                      var textField = document.createElement('textarea');
                      textField.innerText = renderWallString(
                        [...walls, currentWall],
                        gridSize,
                        xAxis,
                      );
                      document.body.appendChild(textField);
                      textField.select();
                      document.execCommand('copy');
                      textField.remove();
                      alert('wall string copied!');
                    }}
                  >
                    Copy
                  </button>
                </>
              ) : null}
            </div>
            {walls.length ? (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://otfbm.io/${cols}x${rows}/${renderWallString(
                  walls,
                  gridSize,
                  xAxis,
                )}`}
              >
                Open in OTFBM
              </a>
            ) : null}
          </div>
          <div style={{ display: 'flex' }}>
            <canvas
              id="canvas"
              ref={ref}
              width={500}
              height={500}
              style={{
                marginTop: 10,
              }}
            ></canvas>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <button
                style={{ maxWidth: '100px' }}
                onClick={() => {
                  setWalls([]);
                  setCurrentWall([]);
                  setDoor('');
                }}
              >
                Reset
              </button>
              <button style={getButtonStyle('-o')} onClick={toggleDoor('-o')}>
                -o open door
              </button>
              <button style={getButtonStyle('-d')} onClick={toggleDoor('-d')}>
                -d closed door
              </button>
              <button style={getButtonStyle('-b')} onClick={toggleDoor('-b')}>
                -b double door
              </button>
              <button style={getButtonStyle('-s')} onClick={toggleDoor('-s')}>
                -s secret door
              </button>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              padding: '8px',
            }}
          >
            <label>
              Cols:
              <input
                type="number"
                value={cols}
                onChange={e => {
                  setCols(e.target.value);
                }}
              />
            </label>
            <label>
              Rows:
              <input
                type="number"
                value={rows}
                onChange={e => {
                  setRows(e.target.value);
                }}
              />
            </label>
            Click to add walls
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
