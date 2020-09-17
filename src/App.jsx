import * as React from 'react';
import { Details, DetailItem } from './details';
import Canvas, { getColName } from './canvas';

const round = (n, step) => Math.round(n / step) * step;
const getNearestPoint = (x, y, gridSize) => {
  return [round(x, gridSize), round(y, gridSize)];
};

const renderWallString = (walls, step, xAxis, image) => {
  if (walls.length < 1) return;
  const doorKeys = {
    'secret-door': '-s',
    door: '-d',
    'double-door': '-b',
    'open-door': '-o',
  };
  const wallString = walls
    .map(wall => {
      return wall.length
        ? `_${wall
            .map(({ x, y, icon }) => {
              const xLetter = xAxis[x - 1];
              return `${icon ? doorKeys[icon] : ''}${xLetter}${y}`;
            })
            .join('')}`
        : '';
    })
    .join('');

  return image ? wallString + `?bg=${image}` : wallString
};

function App() {
  const gridRef = React.useRef();
  const imageRef = React.useRef();
  const gridSize = 40;
  const [cols, setCols] = React.useState(26);
  const [rows, setRows] = React.useState(14);
  const [door, setDoor] = React.useState('');
  const [image, setImage] = React.useState('');
  const dotRef = React.useRef();
  const [context, setContext] = React.useState();
  const [imageContext, setImageContext] = React.useState();
  const [walls, setWalls] = React.useState([]);
  const [currentWall, setCurrentWall] = React.useState([]);

  const gridCanvas = Canvas(context, gridSize, Number(cols), Number(rows));
  const xAxis = [...Array(Number(cols))].map((_, i) => getColName(i));

  const toggleDoor = name => {
    return () => setDoor(s => (s === name ? '' : name));
  };
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
    gridRef.current.height = rows * gridSize + 80;
    gridRef.current.width = cols * gridSize + 80;
    gridCanvas.clearCanvas(gridRef.current.height, gridRef.current.width);
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
        let { x: x1, y: y1 } = currentWall[0];
        let { x: x2, y: y2 } = currentWall[currentWall.length - 1];
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
    gridCanvas.drawWall([
      currentWall[currentWall.length - 1],
      { x, y, icon: door },
    ]);
  };

  React.useEffect(() => {
    const handleKeyDown = e => {
      if (currentWall.length) {
        if (currentWall.length > 1 && e.code === 'Enter') {
          setWalls(s => [...s, currentWall]);
          setCurrentWall([]);
        } else if (e.code === 'Escape') {
          setCurrentWall([]);
        }
      }
      switch (e.keyCode) {
        case 79: {
          // o
          toggleDoor('open-door')();
          break;
        }
        case 83: {
          // s
          toggleDoor('secret-door')();
          break;
        }
        case 68: {
          // d
          toggleDoor('door')();
          break;
        }
        case 66: {
          // b
          toggleDoor('double-door')();
          break;
        }
        default: {
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });

  React.useEffect(() => {
    if (imageRef.current) {


      const renderCtx = imageRef.current.getContext('2d');

      if (renderCtx && !imageContext) {
        setImageContext(renderCtx);
      }
      
      function drawImageActualSize() {
        imageContext.drawImage(this, gridSize, gridSize, gridSize * cols, gridSize * rows);
      }
      if (image) {
        const imageEl = new Image(); // Using optional size for image
        imageEl.onload = drawImageActualSize; // Draw when image has loaded
        imageEl.src = image;
      }
    }

  }, [image, imageContext, setImageContext])

  React.useEffect(() => {
    if (gridRef.current) {
      const renderCtx = gridRef.current.getContext('2d');

      if (renderCtx && !context) {
        setContext(renderCtx);
      }
    }

    const handleMouseOver = e => {
      const rect = gridRef.current.getBoundingClientRect();

      let canvasOffsetLeft = rect.x;
      let canvasOffsetTop = rect.y;
      let _x = e.clientX - canvasOffsetLeft;
      let _y = e.clientY - canvasOffsetTop;

      [_x, _y] = getNearestPoint(_x, _y, gridSize);

      const x = _x / gridSize;
      const y = _y / gridSize;
      if (x >= 0 && x <= Number(cols) + 1 && y >= 0 && y <= Number(rows) + 1) {
        renderCanvas();
        if (currentWall.length) {
          renderInProgressWall(x, y);
        } else {
          gridCanvas.addDot(x, y);
        }
        dotRef.current = { x, y, icon: door };
      }
    };

    const mouseOut = () => {
      renderCanvas();
    };

    if (context) {
      gridRef.current.addEventListener('mouseleave', mouseOut);
      gridRef.current.addEventListener('mousemove', handleMouseOver);
      gridRef.current.addEventListener('click', handleClick);
      renderCanvas();
    }
    const canvas = gridRef.current;
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
          {walls.length ? (
            <a
              className="link"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://otfbm.io/${cols}x${rows}/@dc60/${renderWallString(
                walls,
                gridSize,
                xAxis,
                image
              )}`}
            >
              Open in OTFBM
            </a>
          ) : null}
        </div>
        <div 
          style={{
            width:gridSize * cols + gridSize * 2,
            height:gridSize * rows + gridSize * 2
          }}
          className="canvas-container">
          <canvas
            id="canvas"
            ref={gridRef}
            width={gridSize * cols + gridSize * 2}
            height={gridSize * rows + gridSize * 2}
            style={{
              marginTop: 10,
            }}
          ></canvas>
          <canvas
            id="image-canvas"
            ref={imageRef}
            width={gridSize * cols + gridSize * 2}
            height={gridSize * rows + gridSize * 2}
            style={{
              marginTop: 10,
            }}
          ></canvas>
        </div>
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
          <button
            style={getButtonStyle('open-door')}
            onClick={toggleDoor('open-door')}
          >
            -o open door
          </button>
          <button style={getButtonStyle('door')} onClick={toggleDoor('door')}>
            -d closed door
          </button>
          <button
            style={getButtonStyle('double-door')}
            onClick={toggleDoor('double-door')}
          >
            -b double door
          </button>
          <button
            style={getButtonStyle('secret-door')}
            onClick={toggleDoor('secret-door')}
          >
            -s secret door
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px',
          }}
        >
          <label>Cols:</label>
          <input
            type="number"
            value={cols}
            onChange={e => {
              setCols(Number(e.target.value));
            }}
          />
          <label>Rows:</label>
          <input
            type="number"
            value={rows}
            onChange={e => {
              setRows(Number(e.target.value));
            }}
          />
          <label>ImageUrl:</label>
          <input
            type="text"
            value={image}
            onChange={e => {
              setImage(e.target.value);
            }}
          />
        </div>
        <div
          style={{
            padding: '16px',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          WallString:{' '}
          {currentWall.length || walls.length ? (
            <>
              {renderWallString([...walls, currentWall], gridSize, xAxis, image)}{' '}
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
      </div>
      <Details>
        <DetailItem>Click on the grid to add walls</DetailItem>
        <DetailItem>Hit escape to cancel an in progress wall</DetailItem>
        <DetailItem>Hit enter to save/confirm an in progress wall</DetailItem>
        <DetailItem>
          Copy button will quick copies the generated wall string to your
          clipboard
        </DetailItem>
        <DetailItem>Door hotkeys (o, d, b, s)</DetailItem>
      </Details>
    </div>
  );
}

export default App;
