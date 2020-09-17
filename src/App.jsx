import * as React from 'react';
import { Details, DetailItem } from './details';
import Canvas, { getColName } from './canvas';

const round = (n, step) => Math.round(n / step) * step;
const getNearestPoint = (x, y) => {
  return [round(x, 20), round(y, 20)];
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

function App() {
  const ref = React.useRef();
  const gridSize = 20;
  const [cols, setCols] = React.useState(26);
  const [rows, setRows] = React.useState(14);
  const [door, setDoor] = React.useState('');
  const dotRef = React.useRef();
  const [context, setContext] = React.useState();
  const [walls, setWalls] = React.useState([]);
  const [currentWall, setCurrentWall] = React.useState([]);

  const gridCanvas = Canvas(context, gridSize, Number(cols), Number(rows));
  const xAxis = [...Array(Number(cols))].map((_, i) => getColName(i));

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
    gridCanvas.clearCanvas(ref.current.height, ref.current.width);
    context.strokeRect(gridSize, gridSize, cols * gridSize, rows * gridSize);
    context.font = '14px sans-serif';
    gridCanvas.drawXAxis(cols, gridSize);
    gridCanvas.drawYAxis(rows, gridSize);
    gridCanvas.drawGrid(rows, cols);
    if (currentWall.length) {
      context.strokeStyle = 'red';
      gridCanvas.drawWall(currentWall);

      if (currentWall.length > 3) {
        // triangle 4 clicks to close
        let first = currentWall[0].slice(0, 2).join('');
        let last = currentWall[currentWall.length - 1].slice(0, 2).join('');
        if (first === last) {
          // closed the loop
          setWalls(s => [...s, currentWall]);
          setCurrentWall([]);
        }
      }
    }
    if (walls.length) {
      context.strokeStyle = 'black';
      gridCanvas.drawWalls(walls);
    }
  }, [context, walls, rows, cols, currentWall]);

  const renderInProgressWall = (x, y) => {
    context.strokeStyle = 'red';
    gridCanvas.drawWall([currentWall[currentWall.length - 1], [x, y]]);
  };

  React.useEffect(() => {
    const saveWall = e => {
      if (currentWall.length) {
        if (currentWall.length > 1 && e.code === 'Enter') {
          setWalls(s => [...s, currentWall]);
          setCurrentWall([]);
        } else if (e.code === 'Escape') {
          setCurrentWall([]);
        }
      }
    };

    document.addEventListener('keydown', saveWall);
    return () => {
      document.removeEventListener('keydown', saveWall);
    };
  });

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
        x <= gridSize * (Number(cols) + 1) &&
        y >= gridSize &&
        y <= gridSize * (Number(rows) + 1)
      ) {
        renderCanvas();
        if (currentWall.length) {
          renderInProgressWall(x, y);
        } else {
          gridCanvas.addDot(x, y);
        }
        dotRef.current = [x, y];
      }
    };

    const mouseOut = () => {
      renderCanvas();
    };

    if (context) {
      ref.current.addEventListener('mouseleave', mouseOut);
      ref.current.addEventListener('mousemove', handleMouseOver);
      ref.current.addEventListener('click', handleClick);
      renderCanvas();
    }
    const canvas = ref.current;
    return () => {
      canvas.removeEventListener('mousemove', handleMouseOver);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mouseleave', mouseOut);
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
      <div>
        <div style={{ minHeight: '30px' }}>
          <div
            style={{
              textAlign: 'left',
              width: cols * gridSize,
              margin: '0 auto',
            }}
          >
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
            paddingBottom: '15px',
            display: 'flex',
            justifyContent: 'center',
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
        </div>
      </div>
      <Details>
        <DetailItem>Click on the grid to add walls</DetailItem>
        <DetailItem>Hit escape to cancel an in progress wall</DetailItem>
        <DetailItem>Hit enter to save/confirm an in progress wall</DetailItem>
        <DetailItem>
          Copy button will quick copies the generated wall string to your
          clipboard
        </DetailItem>
      </Details>
    </div>
  );
}

export default App;
