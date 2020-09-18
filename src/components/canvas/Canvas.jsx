import * as React from 'react';

const CanvasContext = React.createContext({
  registerElement: () => {},
  scheduleRender: () => {},
});

export const Canvas = React.forwardRef((props, ref) => {
  const [ctx, setCtx] = React.useState();
  const nodes = React.useRef({});

  const registerNode = (id, fn) => {
    nodes.current[id] = fn;
    drawFn();
  };

  const removeNode = (id) => {
    delete nodes.current[id];
    drawFn();
  };

  const drawFn = () => {
    if (ctx) {
      ctx.clearRect(0, 0, props.width, props.height);
      Object.keys(nodes.current).forEach((k) => {
        const draw = nodes.current[k];
        ctx.save();
        draw(ctx);
        ctx.restore();
      });
    }
  };

  React.useEffect(() => {
    const node = ref.current;
    if (node) {
      const renderCtx = node.getContext('2d');

      if (renderCtx && !ctx) {
        setCtx(renderCtx);
      }
    }
  }, [ctx, setCtx]);
  const {children, ...rest} = props;

  return (
    <CanvasContext.Provider value={{ registerNode, removeNode }}>
      <canvas ref={ref} {...props}/>
    </CanvasContext.Provider>
  );
});

export const useCanvas = () => {
  const ctx = React.useContext(CanvasContext);
  return ctx;
};
