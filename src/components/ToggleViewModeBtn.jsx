import * as React from 'react';

const modeMachine = (mode) => {
  return {
    light: 'dark',
    dark: 'light'
  }[mode]
}

const usePersistentState = (key, initialState = '') => {
  let storedValue;

  try {
    storedValue = JSON.parse(localStorage.getItem(key));
  } catch (e) {
    //do nothing
  }

  const [state, setState] = React.useState(storedValue || initialState);

  const wrappedSetState = React.useCallback(
    (getNextValue, cb) => {
      const nextValue =
        typeof getNextValue === 'function' ? getNextValue(state) : getNextValue;
      localStorage.setItem(key, JSON.stringify(nextValue));
      setState(nextValue);
      cb && cb();
    },
    [state, key]
  );

  return [state, wrappedSetState];
};

export const ToggleViewModeBtn = () => {
  const [mode, setMode] = usePersistentState('mode', 'dark');

  const toggleMode = () => setMode(s => modeMachine(s))

  React.useEffect(() => {
    const removeMode = modeMachine(mode);
    document.body.classList.add(mode)
    document.body.classList.remove(removeMode)
  }, [mode])


  return <button className="toggle-mode-button" onClick={toggleMode}>{mode}</button>
};
