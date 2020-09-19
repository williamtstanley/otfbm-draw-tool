import * as React from 'react';
import { Details, DetailItem } from './components/Details';
import {
  Canvas,
  Grid,
  Dot,
  Line,
  XAxis,
  YAxis,
  Img as Image,
} from './components/canvas';
import { ToggleViewModeBtn } from './components/ToggleViewModeBtn';
import { Button } from './components/Button';
import { getNearestPoint, getColName, renderWallString } from './util';

const gridSize = 40;
function App() {
  const canvasRef = React.useRef();
  const imageRef = React.useRef();
  const [pointer, setPointer] = React.useState({ x: 0, y: 0, icon: '' });
  const [zoom, setZoom] = React.useState(1);
  const [cols, setCols] = React.useState(26);
  const [rows, setRows] = React.useState(14);
  const [icon, setIcon] = React.useState('');
  const [image, setImage] = React.useState('');
  const [walls, setWalls] = React.useState([]);
  const [currentWall, setCurrentWall] = React.useState([]);

  const xAxis = [...Array(Number(cols))].map((_, i) => getColName(i));

  const calcDims = (n) => {
    const calculatedGridSize = gridSize / zoom;
    return calculatedGridSize * n + calculatedGridSize * 2;
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentWall.length) {
        if (currentWall.length > 1 && e.code === 'Enter') {
          setWalls((s) => [...s, currentWall]);
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

  const toggleDoor = (name) => {
    return () => {
      setIcon((s) => (s === name ? '' : name));
      if (currentWall.length) {
        setPointer((s) => ({ ...s, icon: name }));
      }
    };
  };

  const handleClick = React.useCallback(
    (e) => {
      if (currentWall.length > 3) {
        // triangle 4 clicks to close
        let { x: x1, y: y1 } = currentWall[0];
        let { x: x2, y: y2 } = pointer;
        if (x1 === x2 && y1 === y2) {
          setWalls((s) => [...s, [...currentWall, pointer]]);
          setCurrentWall([]);
          setIcon('');
          setPointer(({ x, y }) => ({ x, y, icon: '' }));
          return;
        }
      }

      setCurrentWall((s) => [...s, pointer]);
      setIcon('');
      setPointer(({ x, y }) => ({ x, y, icon: '' }));
    },
    [setCurrentWall, currentWall, pointer],
  );

  const handleMouseOut = () => {
    setPointer({});
  };

  const handleMouseMove = React.useCallback(
    (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      let canvasOffsetLeft = rect.x;
      let canvasOffsetTop = rect.y;
      let _x = e.clientX - canvasOffsetLeft;
      let _y = e.clientY - canvasOffsetTop;

      [_x, _y] = getNearestPoint(_x, _y, gridSize / zoom);

      const x = _x / (gridSize / zoom);
      const y = _y / (gridSize / zoom);
      if (x > 0 && x <= Number(cols) + 1 && y > 0 && y <= Number(rows) + 1) {
        setPointer({ x, y, icon });
      }
    },
    [setPointer, icon, gridSize, zoom, cols, rows],
  );

  const isActive = React.useCallback(
    (n) => {
      return n === icon;
    },
    [icon],
  );

  return (
    <div className="app-container">
      <ToggleViewModeBtn />
      <h1>OTFBM Draw Tool</h1>
      <div>
        <div className="zoom-controls">
          <Button onClick={() => setZoom((z) => (z > 1 ? z - 1 : 1))}>
            Zoom In
          </Button>
          {walls.length ? (
            <a
              className="link"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://otfbm.io/${cols}x${rows}${
                image ? '/@c60' : ''
              }/${renderWallString(walls, gridSize / zoom, xAxis, image)}`}
            >
              Open in OTFBM
            </a>
          ) : null}
          <Button onClick={() => setZoom((z) => z + 1)}>Zoom Out</Button>
        </div>
        <div
          style={{
            width: calcDims(cols),
            height: calcDims(rows),
          }}
          className="canvas-container"
        >
          <Canvas
            id="canvas"
            ref={canvasRef}
            width={calcDims(cols)}
            height={calcDims(rows)}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onMouseOut={handleMouseOut}
          >
            <XAxis cols={cols} gridSize={gridSize / zoom} />
            <YAxis rows={rows} gridSize={gridSize / zoom} />
            <Grid rows={rows} cols={cols} gridSize={gridSize / zoom} />
            <Dot x={pointer.x} y={pointer.y} gridSize={gridSize / zoom} />
            <Line
              points={[...currentWall, pointer]}
              gridSize={gridSize / zoom}
              bg={image}
            />
            {walls.map((points, i) => (
              <Line
                key={i}
                points={points}
                gridSize={gridSize / zoom}
                bg={image}
              />
            ))}
          </Canvas>
          <Canvas
            width={calcDims(cols)}
            height={calcDims(rows)}
            id="image-canvas"
            ref={imageRef}
          >
            <Image
              image={image}
              rows={rows}
              cols={cols}
              gridSize={gridSize / zoom}
            />
          </Canvas>
        </div>
        <div
          style={{
            paddingBottom: '15px',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Button
            onClick={() => {
              setWalls([]);
              setCurrentWall([]);
              setIcon('');
              setImage('');
              setPointer({});
              setZoom(1);
            }}
          >
            Reset
          </Button>
          <Button
            active={isActive('open-door')}
            onClick={toggleDoor('open-door')}
          >
            -o open door
          </Button>
          <Button
            name="door"
            onClick={toggleDoor('door')}
            active={isActive('door')}
          >
            -d closed door
          </Button>
          <Button
            active={isActive('double-door')}
            onClick={toggleDoor('double-door')}
          >
            -b double door
          </Button>
          <Button
            active={isActive('secret-door')}
            onClick={toggleDoor('secret-door')}
          >
            -s secret door
          </Button>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
          }}
        >
          <label htmlFor="cols">Cols:</label>
          <input
            id="cols"
            type="number"
            value={cols}
            onChange={(e) => {
              setCols(Number(e.target.value));
            }}
          />
          <label htmlFor="rows">Rows:</label>
          <input
            id="rows"
            type="number"
            value={rows}
            onChange={(e) => {
              setRows(Number(e.target.value));
            }}
          />
          <label htmlFor="image-url">ImageUrl:</label>
          <input
            id="image-url"
            type="text"
            value={image}
            onChange={(e) => {
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
            alignItems: 'center',
          }}
        >
          urlparams:{' '}
          {currentWall.length || walls.length ? (
            <>
              {renderWallString(
                [...walls, currentWall],
                gridSize / zoom,
                xAxis,
                image,
              )}{' '}
              <Button
                name="Copy String"
                onClick={(e) => {
                  var textField = document.createElement('textarea');
                  textField.innerText = renderWallString(
                    [...walls, currentWall],
                    gridSize / zoom,
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
              </Button>
            </>
          ) : null}
        </div>
      </div>
      <Details>
        <DetailItem>Click on the grid to add walls</DetailItem>
        <DetailItem>Hit escape to cancel an in progress wall</DetailItem>
        <DetailItem>Hit enter to save/confirm an in progress wall</DetailItem>
        <DetailItem>
          Copy button quick copies the generated paramstring to your clipboard
        </DetailItem>
        <DetailItem>Door hotkeys (o, d, b, s)</DetailItem>
      </Details>
    </div>
  );
}

export default App;
