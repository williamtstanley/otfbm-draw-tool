import * as React from 'react';
import { Details, DetailItem } from './details';
import Canvas, { getColName } from './canvas';

const round = (n, step) => Math.round(n / step) * step;
const getNearestPoint = (x, y, gridSize) => {
  return [round(x, gridSize), round(y, gridSize)];
};

const renderWallString = (walls, step, xAxis) => {
  if (walls.length < 1) return;
  const doorKeys = {
    'secret-door': '-s',
    'door': '-d',
    'double-door': '-b',
    'open-door': '-o'
  }
  return walls
    .map(wall => {
      return wall.length
        ? `_${wall
            .map(({x, y, icon}) => {
              const xLetter = xAxis[x];
              return `${icon ? doorKeys[icon] : ''}${xLetter}${y+1}`;
            })
            .join('')}`
        : '';
    })
    .join('');
};

function App() {
  const ref = React.useRef();
  const gridSize = 40;
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
        setCurrentWall(s => [...s, dotRef.current]);
        setDoor('');
      } else {
        setCurrentWall(s => [...s, dotRef.current]);
      }
    },
    [setCurrentWall, currentWall],
  );

  const renderCanvas = React.useCallback(() => {
    ref.current.height = (rows * gridSize) + 80;
    ref.current.width = (cols * gridSize) + 80;
    gridCanvas.clearCanvas(ref.current.height, ref.current.width);
    context.strokeRect(gridSize, gridSize, cols * gridSize, rows * gridSize);
    context.font = '14px sans-serif';
    gridCanvas.drawXAxis();
    gridCanvas.drawYAxis();
    gridCanvas.drawGrid();
    if (currentWall.length) {
      context.strokeStyle = 'red';
      gridCanvas.drawWall(currentWall);

      if (currentWall.length > 3) {
        // triangle 4 clicks to close
        let {x: x1, y: y1} = currentWall[0];
        let {x: x2, y: y2} = currentWall[currentWall.length - 1];
        if (x1 === x2 && y1 === y2) {
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
    gridCanvas.drawWall([currentWall[currentWall.length - 1], {x, y, icon: door}]);
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
      let _x = e.clientX - canvasOffsetLeft;
      let _y = e.clientY - canvasOffsetTop;

      [_x, _y] = getNearestPoint(_x, _y, gridSize);

      const x = _x / gridSize;
      const y = _y / gridSize;
      if (
        x >= 0 &&
        x <= (Number(cols) + 1) &&
        y >= 0 &&
        y <= (Number(rows) + 1)
      ) {
        renderCanvas();
        if (currentWall.length) {
          renderInProgressWall(x, y);
        } else {
          gridCanvas.addDot(x, y);
        }
        dotRef.current = {x, y, icon: door};
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
          <button style={getButtonStyle('-o')} onClick={toggleDoor('open-door')}>
            -o open door
          </button>
          <button style={getButtonStyle('-d')} onClick={toggleDoor('door')}>
            -d closed door
          </button>
          <button style={getButtonStyle('-b')} onClick={toggleDoor('double-door')}>
            -b double door
          </button>
          <button style={getButtonStyle('-s')} onClick={toggleDoor('secret-door')}>
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
