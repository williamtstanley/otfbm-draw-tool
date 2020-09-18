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
import {ToggleViewModeBtn} from './components/ToggleViewModeBtn';
import { getNearestPoint, getColName, renderWallString } from './util';

const gridSize = 40;
function App() {
  const canvasRef = React.useRef();
  const imageRef = React.useRef();
  const [pointer, setPointer] = React.useState({ x: 0, y: 0, icon: '' });
  const [cols, setCols] = React.useState(26);
  const [rows, setRows] = React.useState(14);
  const [icon, setIcon] = React.useState('');
  const [image, setImage] = React.useState('');
  const [walls, setWalls] = React.useState([]);
  const [currentWall, setCurrentWall] = React.useState([]);

  const xAxis = [...Array(Number(cols))].map((_, i) => getColName(i));

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
          setPointer(({x, y}) => ({x, y, icon: ''}))
          return;
        }
      }

      setCurrentWall((s) => [...s, pointer]);
      setIcon('');
      setPointer(({x, y}) => ({x, y, icon: ''}))
    },
    [setCurrentWall, currentWall, pointer],
  );

  const handleMouseOut = () => {
    setPointer({});
  };

  const getButtonStyle = (n) => {
    return {
      backgroundColor: n === icon ? 'lightgreen' : '',
    };
  };

  const handleMouseMove = React.useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    let canvasOffsetLeft = rect.x;
    let canvasOffsetTop = rect.y;
    let _x = e.clientX - canvasOffsetLeft;
    let _y = e.clientY - canvasOffsetTop;

    [_x, _y] = getNearestPoint(_x, _y, gridSize);

    const x = _x / gridSize;
    const y = _y / gridSize;
    if (x > 0 && x <= Number(cols) + 1 && y > 0 && y <= Number(rows) + 1) {
      setPointer({ x, y, icon });
    }
  }, [setPointer, icon, gridSize, cols, rows]);

  return (
    <div
      style={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <ToggleViewModeBtn/>
      <h1>OTFBM Draw Tool</h1>
      <div>
        <div style={{ minHeight: '30px' }}>
          {walls.length ? (
            <a
              className="link"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://otfbm.io/${cols}x${rows}${
                image ? '/@c60' : ''
              }/${renderWallString(walls, gridSize, xAxis, image)}`}
            >
              Open in OTFBM
            </a>
          ) : null}
        </div>
        <div
          style={{
            width: gridSize * cols + gridSize * 2,
            height: gridSize * rows + gridSize * 2,
          }}
          className="canvas-container"
        >
          <Canvas
            id="canvas"
            ref={canvasRef}
            width={gridSize * cols + gridSize * 2}
            height={gridSize * rows + gridSize * 2}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onMouseOut={handleMouseOut}
          >
            <XAxis cols={cols} gridSize={gridSize} />
            <YAxis rows={rows} gridSize={gridSize} />
            <Grid rows={rows} cols={cols} gridSize={gridSize} />
            <Dot x={pointer.x} y={pointer.y} gridSize={gridSize} />
            <Line
              points={[...currentWall, pointer]}
              gridSize={gridSize}
              bg={image}
            />
            {walls.map((points, i) => (
              <Line key={i} points={points} gridSize={gridSize} 
                bg={image}
              />
            ))}
          </Canvas>
          <Canvas
            id="image-canvas"
            ref={imageRef}
            width={gridSize * cols + gridSize * 2}
            height={gridSize * rows + gridSize * 2}
          >
            <Image image={image} rows={rows} cols={cols} gridSize={gridSize} />
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
          <button
            style={{ maxWidth: '100px' }}
            onClick={() => {
              setWalls([]);
              setCurrentWall([]);
              setIcon('');
              setImage('');
              setPointer({});
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
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
          }}
        >
          <label>Cols:</label>
          <input
            type="number"
            value={cols}
            onChange={(e) => {
              setCols(Number(e.target.value));
            }}
          />
          <label>Rows:</label>
          <input
            type="number"
            value={rows}
            onChange={(e) => {
              setRows(Number(e.target.value));
            }}
          />
          <label>ImageUrl:</label>
          <input
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
                gridSize,
                xAxis,
                image,
              )}{' '}
              <button
                onClick={(e) => {
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
          Copy button quick copies the generated paramstring to your
          clipboard
        </DetailItem>
        <DetailItem>Door hotkeys (o, d, b, s)</DetailItem>
      </Details>
    </div>
  );
}

export default App;
