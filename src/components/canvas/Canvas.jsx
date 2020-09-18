import * as React from 'react';

const CanvasContext = React.createContext(null);

export const Canvas = React.forwardRef(({ children, ...props }, ref) => {
  const [ctx, setCtx] = React.useState();

  React.useEffect(() => {
    const node = ref.current;
    if (node) {
      const renderCtx = node.getContext('2d');

      if (renderCtx && !ctx) {
        setCtx(renderCtx);
      }
    }
    if (ctx) {
      ctx.clearRect(0, 0, props.width, props.height);
    }
  }, [ctx, setCtx]);

  return (
    <CanvasContext.Provider value={ctx}>
      <canvas ref={ref} {...props}>
        {children}
      </canvas>
    </CanvasContext.Provider>
  );
});

export const useCanvas = () => {
  const ctx = React.useContext(CanvasContext);
  return ctx;
};
