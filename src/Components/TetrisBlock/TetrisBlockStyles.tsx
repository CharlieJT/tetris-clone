import styled, { keyframes } from "styled-components";

export type BlockProps = {
	colour?: string;
	border?: boolean;
	animation?: boolean;
	zIndex?: number | string;
	tetrisCoordX?: number;
	tetrisCoordY?: number;
};

const BorderStyles = styled.div.attrs<BlockProps>(
	({ colour, tetrisCoordX, tetrisCoordY }) => ({
		style: {
			gridRowStart: tetrisCoordX,
			gridColumnStart: tetrisCoordY,
			boxShadow: `inset 0px 0px 2px 0px`,
			backgroundColor: colour,
		},
	}),
)<BlockProps>`
	position: relative;
	border-radius: 2px;
	width: 100%;
	height: 100%;
	opacity: 0.5;
	box-sizing: border-box;
`;

const disappear = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
    border-radius: 0;
  }
  to {
    opacity: 0;
    transform: scale(1.5);
    border-radius: 50%;
  }
`;

const AnimationStyles = styled.div.attrs<BlockProps>(
	({ colour, tetrisCoordX, tetrisCoordY }) => ({
		style: {
			gridRowStart: tetrisCoordX,
			gridColumnStart: tetrisCoordY,
			backgroundColor: colour,
		},
	}),
)<BlockProps>`
	position: relative;
	box-sizing: border-box;
	opacity: 0;
	animation: ${disappear} 0.5s 1 linear;
	z-index: 2;
`;

const BlockStyles = styled.div.attrs<BlockProps>(
	({ colour, tetrisCoordX, tetrisCoordY }) => ({
		style: {
			gridRowStart: tetrisCoordX,
			gridColumnStart: tetrisCoordY,
			backgroundColor: colour,
		},
	}),
)<BlockProps>`
	position: relative;
	width: 100%;
	height: 100%;
	box-sizing: border-box;
	z-index: 1;
`;

const InnerBlockTopStyles = styled.div<BlockProps>`
	position: absolute;
	clip-path: polygon(0 0, 100% 0, 85% 50%, 15% 50%);
	${({ colour }) => `
		background-color: ${colour};
  `}
	filter: brightness(140%);
	width: 100%;
	height: 30%;
`;

const InnerBlockLeftStyles = styled(InnerBlockTopStyles)`
	transform: rotate(-90deg);
	filter: brightness(100%);
	${({ colour }) => `
		background-color: ${colour};
  `}
	filter: brightness(90%);
	top: 35%;
	left: -35%;
`;

const InnerBlockRightStyles = styled(InnerBlockTopStyles)`
	transform: rotate(90deg);
	top: 35%;
	${({ colour }) => `
		background-color: ${colour};
  `}
	filter: brightness(90%);
	right: -35%;
`;

const InnerBlockBottomStyles = styled(InnerBlockTopStyles)`
	${({ colour }) => `
		background-color: ${colour};
  `}
	transform: rotate(180deg);
	filter: brightness(60%);
	bottom: 0;
`;

export {
	BlockStyles,
	BorderStyles,
	AnimationStyles,
	InnerBlockTopStyles,
	InnerBlockLeftStyles,
	InnerBlockRightStyles,
	InnerBlockBottomStyles,
};
