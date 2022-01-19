import styled from "styled-components";

type GridSizeProps = {
	gridSize: number[];
	gridWidth: number;
};

type ButtonProps = {
	colour: string;
};

type ButtonStyleProps = {
	style: {
		backgroundColor: string;
	};
};

type GridStyleProps = {
	style: {
		gridTemplateColumns: string;
		gridTemplateRows: string;
		width: string;
		height: string;
	};
};

const TetrisLayout = styled.div`
	display: flex;
	justify-content: center;
	background-color: #000;
	padding: 2vmin;
`;

const TetrisGrid = styled.div.attrs<GridSizeProps>(
	({ gridSize, gridWidth }): GridStyleProps => ({
		style: {
			gridTemplateColumns: `repeat(${gridSize[0]}, 1fr)`,
			gridTemplateRows: `repeat(${gridSize[1]}, 1fr)`,
			width: `${(gridWidth / gridSize[1]) * gridSize[0]}vmin`,
			height: `${gridWidth}vmin`,
		},
	}),
)<GridSizeProps>`
	display: grid;
	position: relative;
	background-color: #000;
`;

const NextTetrisGrid = styled(TetrisGrid)`
	border: 3px solid #5e5e5e;
`;

const LeftColumnStyles = styled.div`
	display: flex;
	flex-direction: column;
	padding: 0 1vmin;
	gap: 2vmin;
`;

const DisplayContainerStyles = styled.div`
	display: flex;
	flex-direction: column;
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
	({ colour }): ButtonStyleProps => ({
		style: {
			backgroundColor: colour,
		},
	}),
)<ButtonProps>`
	font-family: "Orbitron", sans-serif;
	width: 12vmin;
	height: 12vmin;
	border-radius: 50%;
	color: #000;
	font-size: 2.2vmin;
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
