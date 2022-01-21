import { useState, useEffect } from "react";

type Size = {
	width: number | undefined;
	height: number | undefined;
};

export const useWindowSize = (): Size => {
	const [windowSize, setWindowSize] = useState<Size>({
		width: undefined,
		height: undefined,
	});
	useEffect(() => {
		const handleResize = (): void => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};
		window.addEventListener("resize", handleResize);
		handleResize();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return () => window.removeEventListener("resize", handleResize);
	}, []);
	return windowSize;
};
