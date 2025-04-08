import { useLayoutEffect, useCallback, useState } from "react";

export type RectResult = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

const getRect = <Type extends HTMLElement>(element?: Type): RectResult => ({
  bottom: element?.getBoundingClientRect().bottom || 0,
  height: element?.getBoundingClientRect().height || 0,
  left: element?.getBoundingClientRect().left || 0,
  right: element?.getBoundingClientRect().right || 0,
  top: element?.getBoundingClientRect().top || 0,
  width: element?.getBoundingClientRect().width || 0,
});

export const useRect = <Type extends HTMLElement>(
  ref: React.RefObject<Type>
) => {
  const [rect, setRect] = useState(
    ref && ref.current ? getRect(ref.current) : getRect()
  );

  const handleResize = useCallback(() => {
    if (!ref.current) return;
    setRect(getRect(ref.current));
  }, [ref]);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    handleResize();

    if (typeof ResizeObserver === "function") {
      const resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(element);
      return () => resizeObserver.disconnect();
    } else {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [handleResize, ref]);

  return rect;
};
