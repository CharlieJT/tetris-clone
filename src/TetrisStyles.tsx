import styled from "styled-components";

type GridSizeProps = {
	gridSize: number[];
	gridWidth: number;
	windowWidth?: number;
};

type NextGridSizeProps = {
	gridSize: number[];
	gridWidth: number;
	windowWidth?: number;
};

type NextGridStyleProps = {
	style: {
		gridTemplateColumns: string;
		gridTemplateRows: string;
		width: string;
		height: string;
		margin: string;
	};
};

type ButtonProps = {
	colour: string;
	windowWidth?: number;
};

type MediaProps = {
	windowWidth?: number;
};

type ButtonStyleProps = {
	style: {
		backgroundColor: string;
		height: string;
		width: string;
		fontSize: string;
	};
};

type GridStyleProps = {
	style: {
		gridTemplateColumns: string;
		gridTemplateRows: string;
		width: string;
		height: string;
		margin: string;
	};
};

const TetrisLayout = styled.div.attrs<MediaProps>(
	({
		windowWidth,
	}): {
		style: {
			display: string;
		};
	} => ({
		style: {
			display: (windowWidth ?? 0) < 600 ? "block" : "flex",
		},
	}),
)<MediaProps>`
	justify-content: center;
	background-color: #000;
	padding: 2vmin;
`;

const TetrisGrid = styled.div.attrs<GridSizeProps>(
	({ gridSize, gridWidth, windowWidth }): GridStyleProps => ({
		style: {
			gridTemplateColumns: `repeat(${gridSize[0]}, 1fr)`,
			gridTemplateRows: `repeat(${gridSize[1]}, 1fr)`,
			width: `${
				(gridWidth / gridSize[1]) *
				gridSize[0] *
				((windowWidth ?? 0) < 600 ? 1.4 : 1)
			}vmin`,
			height: `${gridWidth * ((windowWidth ?? 0) < 600 ? 1.4 : 1)}vmin`,
			margin: (windowWidth ?? 0) < 600 ? "auto" : "0",
		},
	}),
)<GridSizeProps>`
	display: grid;
	position: relative;
	background-color: #000;
`;

const NextTetrisGrid = styled.div.attrs<NextGridSizeProps>(
	({ gridSize, gridWidth, windowWidth }): NextGridStyleProps => ({
		style: {
			gridTemplateColumns: `repeat(${gridSize[0]}, 1fr)`,
			gridTemplateRows: `repeat(${gridSize[1]}, 1fr)`,
			width: `${
				(gridWidth / gridSize[1]) *
				gridSize[0] *
				((windowWidth ?? 0) < 600 ? 1 : 1.2)
			}vmin`,
			height: `${gridWidth * ((windowWidth ?? 0) < 600 ? 1 : 1.2)}vmin`,
			margin: (windowWidth ?? 0) < 600 ? "auto" : "0",
		},
	}),
)<NextGridSizeProps>`
	display: grid;
	position: relative;
	background-color: #000;
	border: 3px solid #5e5e5e;
`;

const LeftColumnStyles = styled.div.attrs<MediaProps>(
	({
		windowWidth,
	}): {
		style: {
			flexDirection: string;
			margin: string;
		};
	} => ({
		style: {
			flexDirection: (windowWidth ?? 0) < 600 ? "row" : "column",
			margin: (windowWidth ?? 0) < 600 ? "2vmin" : "0",
		},
	}),
)<MediaProps>`
	display: flex;
	padding: 0 1vmin;
	gap: 2vmin;
`;

const DisplayContainerStyles = styled.div.attrs<MediaProps>(
	({
		windowWidth,
	}): {
		style: {
			flexDirection: string;
		};
	} => ({
		style: {
			flexDirection: (windowWidth ?? 0) < 600 ? "row" : "column",
		},
	}),
)<MediaProps>`
	display: flex;
	flex-direction: row;
	align-items: center;
	flex-grow: 1;
	color: #fff;
	gap: 2vmin;
	> div {
		width: 100%;
		box-sizing: border-box;
		height: calc(100% / 3);
		border: 3px solid #5e5e5e;
		border-radius: 2vmin;
	}
`;

const ButtonContainerStyles = styled.div`
	display: flex;
	justify-content: center;
	background-color: #000;
`;

const ButtonStyles = styled.button.attrs<ButtonProps>(
	({ colour, windowWidth }): ButtonStyleProps => ({
		style: {
			backgroundColor: colour,
			height: `${(windowWidth ?? 0) < 600 ? 20 : 12}vmin`,
			width: `${(windowWidth ?? 0) < 600 ? 20 : 12}vmin`,
			fontSize: `${(windowWidth ?? 0) < 600 ? 3 : 2}vmin`,
		},
	}),
)<ButtonProps>`
	font-family: "Orbitron", sans-serif;
	border-radius: 50%;
	color: #000;
	font-size: 2vmin;
	margin: 2vmin;
	cursor: pointer;
`;

export {
	TetrisLayout,
	TetrisGrid,
	LeftColumnStyles,
	DisplayContainerStyles,
	NextTetrisGrid,
	ButtonContainerStyles,
	ButtonStyles,
};
