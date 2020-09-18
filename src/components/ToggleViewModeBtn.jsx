import * as React from 'react';
import classnames from 'classnames';
function SunIcon(props) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      {...props}
    >
      <path d="M17 12 A5 5 0 0 1 12 17 A5 5 0 0 1 7 12 A5 5 0 0 1 17 12 z" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

export default SunIcon;

function MoonIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 15 15" height="1em" width="1em" {...props}>
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        d="M1.66 11.362A6.5 6.5 0 007.693.502a7 7 0 11-6.031 10.86z"
      />
    </svg>
  );
}

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
  const Icon = {
    dark: SunIcon,
    light: MoonIcon,
  }[mode]

  const toggleMode = () => setMode(s => modeMachine(s))

  React.useEffect(() => {
    const removeMode = modeMachine(mode);
    document.body.classList.add(mode)
    document.body.classList.remove(removeMode)
  }, [mode])


  return <button className={classnames("toggle-mode-button", {light: mode === 'light', dark: mode === 'dark'})} onClick={toggleMode}>{<Icon/>}</button>
};
