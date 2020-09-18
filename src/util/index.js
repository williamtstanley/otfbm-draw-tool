export function ID() {
  return '_' + Math.random().toString(36).substr(2, 9);
}


export const round = (n, step) => Math.round(n / step) * step;
export const getNearestPoint = (x, y, gridSize) => {
  return [round(x, gridSize), round(y, gridSize)];
};

export const getColName = (n) => {
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

export const renderWallString = (walls, step, xAxis, image) => {
  if (walls.length < 1) return;
  const doorKeys = {
    'secret-door': '-s',
    door: '-d',
    'double-door': '-b',
    'open-door': '-o',
  };
  const wallString = walls
    .map((wall) => {
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

  return image ? wallString + `?bg=${image}` : wallString;
};

