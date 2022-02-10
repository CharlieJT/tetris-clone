/* eslint-disable array-callback-return */
/* eslint-disable no-loop-func */
import React, {
	useState,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { GiSpeaker, GiSpeakerOff } from "react-icons/gi";
import "./App.css";
import useInterval from "./hooks/useInterval";
import { useRect } from "./hooks/useRect";
import TetrisBlock from "./Components/TetrisBlock/TetrisBlock";
import ScoreDisplay from "./Components/ScoringDisplay/ScoreDisplay";
import Modal from "./Components/Modal/Modal";
import { Howl } from "howler";
import ReactHowler from "react-howler";
import { uniqueCoordsHandler, generatedTetrominoHandler } from "./utils";
import {
	framesPerGridCell,
	gamePoints,
	colours,
	tetrominoes,
} from "./variables";
import {
	TetrisLayout,
	TetrisGrid,
	LeftColumnStyles,
	DisplayContainerStyles,
	NextTetrisGrid,
	ButtonContainerStyles,
	ButtonStyles,
	HighScoreStyles,
} from "./TetrisStyles";

const GRID_SIZE = [12, 22];
const NEXT_GRID_SIZE = [7, 6];
const INITIAL_POSITION = [1, 5];
const GRID_WIDTH = 80;
const INTERVAL_VALUE = (1 / 60) * framesPerGridCell[0] * 1000;

type ShapeProps = any[];

export type OffsetsProps = {
	shape: ShapeProps;
	topOffset: number;
	leftOffset: number;
	rightOffset: number;
	bottomOffset: number;
};

enum KeyboardProps {
	ArrowUp = "ArrowUp",
	ArrowDown = "ArrowDown",
	ArrowLeft = "ArrowLeft",
	ArrowRight = "ArrowRight",
	Space = " ",
}

enum TetrominoProps {
	Z = "Z",
	L = "L",
	T = "T",
	J = "J",
	I = "I",
	S = "S",
	O = "O",
}

export type TetrisCoordProps = number[];
type GridCoordStringProps = [number, number, string];
export type GridCoordsProps = Array<TetrisCoordProps>;
type FilterGeneratorItemProps = Array<GridCoordStringProps>;
type FilterGeneratorProps = Array<FilterGeneratorItemProps>;

const App = (): JSX.Element => {
	const gridSize: TetrisCoordProps = GRID_SIZE;
	const nextGridSize: TetrisCoordProps = NEXT_GRID_SIZE;
	const initialPosition: TetrisCoordProps = INITIAL_POSITION;
	const gridWidth: number = GRID_WIDTH;
	const intervalVal: number = INTERVAL_VALUE;
	const TetrisTheme = require("./Components/Sounds/tetris-theme.mp3");
	const TetrisMove = require("./Components/Sounds/tetris-move.mp3");
	const TetrisPop = require("./Components/Sounds/pop.mp3");
	const TetrisLine = require("./Components/Sounds/tetris-line.mp3");
	const TetrisFlip = require("./Components/Sounds/tetris-flip.mp3");
	const TetrisSet = require("./Components/Sounds/tetris-set.mp3");
	const TetrisGameOver = require("./Components/Sounds/tetris-game-over.mp3");
	let borderCreateArray: GridCoordsProps = [];
	let gameArr: GridCoordsProps = [];
	Array.from(
		{ length: gridSize[1] },
		(_, i) =>
			i > 1 &&
			i < gridSize[1] &&
			Array.from(
				{ length: gridSize[1] },
				(_, j) => j > 1 && j < gridSize[0] && gameArr.push([i, j, 0]),
			),
	);
	const gameGrid: React.MutableRefObject<null> = useRef(null);
	const gameGridSize: any = useRect(gameGrid);
	const [gameActive, setGameActive] = useState<boolean>(false);
	const [gameInitialState, setGameInitialState] = useState<boolean>(false);
	const [tapped, setTapped] = useState<boolean>(true);
	const [disableX, setDisableX] = useState<boolean>(false);
	const [disableY, setDisableY] = useState<boolean>(false);
	const [timestamp, setTimestamp] = useState<number>(0);
	const [timestampSetter, setTimestampSetter] = useState<number>(0);
	const [positionYMoved, setPositionYMoved] = useState<number>(0);
	const [moveTouchSpeed, setTouchMoveSpeed] = useState<number>(0);
	const [windowWidth, setWindowWidth] = useState<number>(
		window.innerWidth || 0,
	);
	const [highScore, setHighScore] = useState<string>(
		localStorage["tetris_high_score"] || "-",
	);
	const [points, setPoints] = useState<number>(0);
	const [lines, setLines] = useState<number>(0);
	const [level, setLevel] = useState<number>(0);
	const [touchStartingPosX, setTouchStartingPosX] = useState<number>(0);
	const [touchStartingPosY, setTouchStartingPosY] = useState<number>(0);
	const [lineAnimation, setLineAnimation] = useState<any>([]);
	const [intervalValue, setIntervalValue] = useState<number>(intervalVal);
	const [gameArray, setGameArray] = useState<GridCoordsProps>(gameArr);
	const [gameOver, setGameOver] = useState<boolean>(false);
	const [musicActive, setMusicActive] = useState<boolean>(true);
	const [nextTetromino, setNextTetromino] = useState<string>(
		Object.keys(tetrominoes)[
			Math.floor(Math.random() * Object.keys(tetrominoes).length)
		],
	);

	const [filterGenerator, setFilterGenerator] = useState<FilterGeneratorProps>(
		[],
	);
	const [flipValue, setFlipValue] = useState<number>(0);
	const [randomTetromino, setRandomTetromino] = useState<string>(
		Object.keys(tetrominoes)[
			Math.floor(Math.random() * Object.keys(tetrominoes).length)
		],
	);

	const [offsets, setOffsets] = useState<OffsetsProps>(
		tetrominoes[`${randomTetromino}`].orientations[flipValue][0],
	);

	const [position, setPosition] = useState<TetrisCoordProps>([
		initialPosition[0] - offsets.topOffset,
		initialPosition[1],
	]);

	const [guidePosition, setGuidePosition] = useState<TetrisCoordProps[]>(
		offsets.shape
			.map(
				(
					row: {
						map: (
							arg0: (el: number, j: number) => false | (string | number)[],
						) => GridCoordsProps;
					},
					i: number,
				): GridCoordsProps =>
					row.map((el: number, j: number): false | (string | number)[] =>
						el !== 0
							? [
									position[0] + i + offsets.leftOffset,
									position[1] + j + 1 + offsets.rightOffset,
									randomTetromino,
							  ]
							: false,
					),
			)
			.reduce((arr: GridCoordsProps, el: GridCoordsProps) => arr.concat(el), [])
			.filter((el: TetrisCoordProps): TetrisCoordProps => el),
	);

	Array.from({ length: gridSize[0] }, (_, i: number): number =>
		borderCreateArray.push([1, i + 1], [gridSize[1], i + 1]),
	);

	Array.from({ length: gridSize[1] }, (_, i: number): number =>
		borderCreateArray.push([i + 1, 0], [i + 1, gridSize[0]]),
	);

	const soundPlay = (src: string): void => {
		const sound = new Howl({ src, volume: 0.5 });
		sound.play();
	};

	const borderArray: GridCoordsProps = uniqueCoordsHandler(
		borderCreateArray.sort(
			(a: TetrisCoordProps, b: TetrisCoordProps): number =>
				a[0] - b[0] || a[1] - b[1],
		),
		[].join,
	);

	useInterval(
		(): void => {
			setGuiderHandler(
				offsets,
				[position[0] + 1, position[1]],
				KeyboardProps.ArrowDown,
				randomTetromino,
				gameArray,
				0,
			);
			checkHandler(
				offsets,
				nextTetromino,
				[position[0] + 1, position[1]],
				KeyboardProps.ArrowDown,
			);
		},
		gameActive ? intervalValue : null,
	);

	const positionHandler = useCallback(
		(offsets: OffsetsProps, position: TetrisCoordProps) => {
			const { leftOffset, rightOffset, shape } = offsets;
			const currentGridSize: TetrisCoordProps = [...gridSize];
			if (position[1] + leftOffset - 1 < 0) {
				return [position[0], 1 - leftOffset];
			} else if (
				position[1] - rightOffset >
				currentGridSize[0] - shape[0].length - 1
			) {
				return [
					position[0],
					currentGridSize[0] - (shape[0].length + 1) + rightOffset,
				];
			} else {
				return position;
			}
		},
		[gridSize],
	);

	const tetrominoSetHandler = useCallback(
		(
			offsets: OffsetsProps,
			position: TetrisCoordProps,
			gameArray: GridCoordsProps,
		): boolean => {
			const { leftOffset, rightOffset } = offsets;
			const currentFilterGenerator: any = [...filterGenerator];
			const updatedPosition = positionHandler(offsets, position);
			const generatedTetromino = generatedTetrominoHandler(
				updatedPosition,
				offsets,
			);
			let tetrominoToSet: boolean = false;
			let newFilterGenerator: any = [...currentFilterGenerator];
			const filteredArray = [...gameArray].filter(
				x => typeof x[2] === "string",
			);

			filteredArray.map((item: TetrisCoordProps): number =>
				newFilterGenerator.push(item),
			);
			newFilterGenerator = uniqueCoordsHandler(newFilterGenerator, [].join);
			if (
				newFilterGenerator.sort().join(",") !==
					currentFilterGenerator.sort().join(",") &&
				currentFilterGenerator.length !== 0
			) {
				setFilterGenerator(newFilterGenerator);
			}
			generatedTetromino.map((el: TetrisCoordProps): void =>
				newFilterGenerator.forEach((item: any): void => {
					if (
						el[0] + 1 - leftOffset === item[0] &&
						el[1] - rightOffset === item[1] &&
						!tetrominoToSet
					) {
						tetrominoToSet = true;
					}
				}),
			);
			return tetrominoToSet;
		},
		[filterGenerator, positionHandler],
	);

	const lineAnimationHandler = useCallback(
		(lines: number[]): void => {
			let lineArray: GridCoordsProps = [];
			const currentGridSize: TetrisCoordProps = [...gridSize];
			lines.map((line: number): void => {
				for (let i = 2; i < currentGridSize[0]; i++) {
					lineArray.push([line, i]);
				}
			});
			setLineAnimation(lineArray);
			setTimeout((): void => {
				setLineAnimation([]);
			}, 500);
		},
		[gridSize],
	);

	const lineCheckHandler = useCallback(
		(gameArray): number => {
			let arrayIndex: number;
			let foundLine: boolean = false;
			let currentGameArray: GridCoordsProps = [...gameArray];
			let lineArray: number[] = [];
			let lineCount: number = 0;
			const currentGridSize: number[] = [...gridSize];
			const currentLevel: number = level;
			const currentActiveBlocks = gameArray.filter(
				(coord: TetrominoProps) => typeof coord[2] === "string",
			);
			for (let i = 0; i < currentGridSize[1]; i++) {
				const rowCount = currentActiveBlocks.reduce(
					(a: number, v: TetrisCoordProps) => (v[0] === i ? a + 1 : a),
					0,
				);
				if (rowCount === currentGridSize[0] - 2) {
					lineArray.push(i);
					foundLine = true;
				}
			}
			if (foundLine) {
				soundPlay(TetrisPop);
				soundPlay(TetrisLine);
				lineAnimationHandler(lineArray);
			}
			while (lineArray.length > 0) {
				lineCount = lineCount + 1;
				let newGameArray = [...currentGameArray];
				currentGameArray.map((el: TetrisCoordProps) => {
					arrayIndex = currentGameArray.findIndex(
						(filteredEl: TetrisCoordProps): boolean =>
							el[0] === filteredEl[0] && el[1] === filteredEl[1],
					);
					if (el[0] < lineArray[0]) {
						newGameArray.splice(arrayIndex, 1, [el[0] + 1, el[1], el[2]]);
					} else if (el[0] === lineArray[0]) {
						newGameArray.splice(arrayIndex, 1, [2, el[1], 0]);
					} else {
						newGameArray.splice(arrayIndex, 1, el);
					}
				});
				currentGameArray = newGameArray;
				lineArray.shift();
			}
			if (foundLine) {
				setPoints(
					(points: number): number =>
						points + gamePoints[lineCount - 1] * (currentLevel + 1),
				);
				setIntervalValue((1 / 60) * framesPerGridCell[currentLevel] * 1000);
				setLines((lines: number): number => {
					setLevel(Math.floor((lines + lineCount) / 10));
					return lines + lineCount;
				});
			}
			setGameArray(currentGameArray);
			return lineCount;
		},
		[TetrisLine, TetrisPop, gridSize, level, lineAnimationHandler],
	);

	const setShapeHandler = useCallback(
		(
			position: TetrisCoordProps,
			offsets: OffsetsProps,
		): { lineCount: number; newGameArray: GridCoordsProps } => {
			let newGameArray: any = [...gameArray];
			let arrayIndex: number;
			const currentRandomTetromino: string = randomTetromino;
			const { leftOffset, rightOffset } = offsets;
			const generatedTetromino = generatedTetrominoHandler(position, offsets);
			generatedTetromino.map((row: TetrisCoordProps): void => {
				arrayIndex = newGameArray.findIndex(
					(newArrayCoord: TetrisCoordProps) => {
						return (
							row[0] - leftOffset === newArrayCoord[0] &&
							row[1] - rightOffset === newArrayCoord[1]
						);
					},
				);
				const updatedArrayVal = [
					row[0] - leftOffset,
					row[1] - rightOffset,
					currentRandomTetromino,
				];
				newGameArray[arrayIndex] = updatedArrayVal;
			});
			const lineCount = lineCheckHandler(newGameArray);
			return { lineCount, newGameArray };
		},
		[gameArray, lineCheckHandler, randomTetromino],
	);

	const gameOverCheckHandler = (newGameArray: GridCoordsProps): boolean => {
		let gameOver: boolean = false;
		newGameArray.map((el: TetrisCoordProps): void => {
			if (el[0] === 1 && typeof el[2] === "string" && !gameOver) {
				gameOver = true;
			}
		});
		return gameOver;
	};

	const setGuiderHandler = useCallback(
		(
			offsets: OffsetsProps,
			position: TetrisCoordProps,
			keyPressed: KeyboardProps,
			randomTetromino: string,
			gameArray: GridCoordsProps,
			lineCount: number,
		) => {
			const { shape, leftOffset, topOffset, bottomOffset, rightOffset } =
				offsets;
			const { ArrowLeft, ArrowRight } = KeyboardProps;
			const generatedTetromino = generatedTetrominoHandler(position, offsets);
			const updatedGuideArray: GridCoordsProps = [];
			const currentGridSize: TetrisCoordProps = [...gridSize];
			let tetrominoToSet: boolean;
			let count: number = lineCount;
			let condition: boolean =
				position[0] + count + shape[0].length ===
				currentGridSize[1] + bottomOffset;
			while (!condition && count < currentGridSize[1]) {
				tetrominoToSet = tetrominoSetHandler(
					offsets,
					[position[0] + count + 1, position[1]],
					gameArray,
				);
				condition =
					position[0] + count + shape[0].length + 1 ===
						currentGridSize[1] + bottomOffset || tetrominoToSet;
				count = count + 1;
			}
			generatedTetromino.map((block: TetrisCoordProps, i: number): number => {
				let currentGuidePosition: any[] = [...guidePosition];
				return updatedGuideArray.push(
					(position[1] + leftOffset - 1 < 0 && keyPressed === ArrowLeft) ||
						(position[1] - rightOffset >
							currentGridSize[0] - shape[0].length - 1 &&
							keyPressed === ArrowRight)
						? currentGuidePosition[i]
						: [
								block[0] + count + lineCount - leftOffset,
								position[1] + leftOffset - 1 < 0
									? block[1] +
									  (shape[0].length === 4 && topOffset === 2 ? 2 : 1) -
									  rightOffset
									: position[1] - rightOffset >
									  currentGridSize[0] - shape[0].length - 1
									? block[1] -
									  (shape[0].length === 4 && bottomOffset === 2 ? 2 : 1) -
									  rightOffset
									: block[1] - rightOffset,
								randomTetromino,
						  ],
				);
			});
			setGuidePosition(updatedGuideArray);
			return { updatedGuideArray, count };
		},
		[gridSize, guidePosition, tetrominoSetHandler],
	);

	const topOffsetHandler = useCallback(
		(position: TetrisCoordProps, offsets: OffsetsProps) => {
			const currentNextTetromino: string = nextTetromino;
			const { lineCount, newGameArray } = setShapeHandler(position, offsets);
			const checkGameOver = gameOverCheckHandler(newGameArray);
			let offsetCount: number = 0;
			const generatedTetromino = generatedTetrominoHandler(
				[
					1 -
						tetrominoes[`${currentNextTetromino}`].orientations[0][0].topOffset,
					5,
				],
				tetrominoes[`${currentNextTetromino}`].orientations[0][0],
			);
			let condition = false;
			do {
				condition = false;
				newGameArray.map((block: TetrisCoordProps): void[] =>
					generatedTetromino.map((el: TetrisCoordProps): void => {
						if (
							block[0] === el[0] - offsetCount + 1 &&
							block[1] === el[1] &&
							typeof block[2] === "string"
						) {
							condition = true;
						}
					}),
				);
				offsetCount = offsetCount + 1;
			} while (condition);
			return { offsetCount, checkGameOver, lineCount, newGameArray };
		},
		[nextTetromino, setShapeHandler],
	);

	const highScoreHandler = useCallback((): void => {
		const currentPoints: number = points;
		const stringScore = String(currentPoints);
		var highScore = localStorage["tetris_high_score"] || 0;
		if (!highScore && currentPoints > 0) {
			localStorage.setItem("tetris_high_score", stringScore);
			setHighScore(stringScore);
		} else {
			if (currentPoints > parseInt(highScore)) {
				console.log("Should set");
				localStorage.setItem("tetris_high_score", stringScore);
				setHighScore(stringScore);
			}
		}
	}, [points]);

	const checkHandler = useCallback(
		(
			offsets: OffsetsProps,
			nextTetromino: string,
			position: TetrisCoordProps,
			keyPressed: KeyboardProps,
			keyPressedTetrominoToSet?: boolean,
		): void => {
			const currentGameArray: any = [...gameArray];
			const currentGridSize: TetrisCoordProps = [...gridSize];
			const currentLevel: number = level;
			const { shape, leftOffset, rightOffset, bottomOffset } = offsets;
			const { ArrowDown, ArrowLeft, ArrowRight } = KeyboardProps;
			const tetrominoToSet =
				keyPressed === ArrowDown
					? tetrominoSetHandler(offsets, position, currentGameArray)
					: false;
			if (
				position[0] + shape[0].length === currentGridSize[1] + bottomOffset ||
				tetrominoToSet
			) {
				soundPlay(TetrisSet);
				setIntervalValue((1 / 60) * framesPerGridCell[currentLevel] * 1000);
				setTapped(true);
				const { offsetCount, checkGameOver, lineCount, newGameArray } =
					topOffsetHandler(position, offsets);
				if (newGameArray[-1] !== undefined || checkGameOver) {
					soundPlay(TetrisGameOver);
					const gameOverArray = newGameArray.filter(
						(el: TetrisCoordProps) => el[0] > 1,
					);
					setGameOver(true);
					setGameActive(false);
					setGuidePosition([]);
					setPosition([1, 5]);
					setGameArray(gameOverArray);
					highScoreHandler();
				} else {
					const newInitialPosition: TetrisCoordProps = [
						1 -
							tetrominoes[`${nextTetromino}`].orientations[0][0].topOffset -
							(offsetCount - 1),
						5,
					];
					setFilterGenerator([]);
					setFlipValue(0);
					setRandomTetromino(nextTetromino);
					setOffsets(tetrominoes[`${nextTetromino}`].orientations[0][0]);
					setNextTetromino(
						Object.keys(tetrominoes)[
							Math.floor(Math.random() * Object.keys(tetrominoes).length)
						],
					);
					setPosition(newInitialPosition);
					setGuiderHandler(
						tetrominoes[`${nextTetromino}`].orientations[0][0],
						newInitialPosition,
						ArrowDown,
						nextTetromino,
						newGameArray,
						lineCount,
					);
				}
			} else if (position[1] + leftOffset - 1 < 0) {
				setPosition(
					(position: TetrisCoordProps): TetrisCoordProps => [
						position[0],
						1 - leftOffset,
					],
				);
			} else if (
				position[1] - rightOffset >
				currentGridSize[0] - shape[0].length - 1
			) {
				setPosition(
					(position: TetrisCoordProps): TetrisCoordProps => [
						position[0],
						currentGridSize[0] - (shape[0].length + 1) + rightOffset,
					],
				);
			} else {
				if (
					(keyPressed === ArrowLeft || keyPressed === ArrowRight) &&
					!keyPressedTetrominoToSet
				) {
					soundPlay(TetrisMove);
				}
				setPosition(position);
			}
		},
		[
			gameArray,
			gridSize,
			level,
			tetrominoSetHandler,
			TetrisSet,
			topOffsetHandler,
			TetrisGameOver,
			highScoreHandler,
			setGuiderHandler,
			TetrisMove,
		],
	);

	const keyPressedHandler = useCallback(
		(e: KeyboardEvent): void => {
			e.preventDefault();
			const currentRandomTetromino: string = randomTetromino;
			const currentNextTetromino: string = nextTetromino;
			const currentOffsets: OffsetsProps = offsets;
			const currentPosition: TetrisCoordProps = [...position];
			const currentGameArray: TetrisCoordProps[] = [...gameArray];
			const { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Space } =
				KeyboardProps;
			let tetrominoToSet: boolean;
			switch (e.key) {
				case ArrowUp:
					let flipVal: number = flipValue;
					const updatedFlipValue = flipValue === 3 ? 0 : flipValue + 1;
					tetrominoToSet = tetrominoSetHandler(
						tetrominoes[`${currentRandomTetromino}`].orientations[
							updatedFlipValue
						][0],
						currentPosition,
						currentGameArray,
					);
					if (!tetrominoToSet) {
						soundPlay(TetrisFlip);
						flipVal = updatedFlipValue;
					}
					setFlipValue(flipVal);
					setOffsets(
						tetrominoes[`${currentRandomTetromino}`].orientations[flipVal][0],
					);
					setGuiderHandler(
						tetrominoes[`${currentRandomTetromino}`].orientations[flipVal][0],
						currentPosition,
						ArrowUp,
						currentRandomTetromino,
						currentGameArray,
						0,
					);
					checkHandler(
						tetrominoes[`${currentRandomTetromino}`].orientations[flipVal][0],
						currentNextTetromino,
						currentPosition,
						ArrowUp,
					);
					break;
				case ArrowDown:
					setIntervalValue(50);
					setGuiderHandler(
						currentOffsets,
						[currentPosition[0] + 1, currentPosition[1]],
						ArrowDown,
						currentRandomTetromino,
						currentGameArray,
						0,
					);
					checkHandler(
						currentOffsets,
						currentNextTetromino,
						[currentPosition[0] + 1, currentPosition[1]],
						ArrowDown,
					);
					break;
				case ArrowLeft:
					tetrominoToSet = tetrominoSetHandler(
						currentOffsets,
						[currentPosition[0], currentPosition[1] - 1],
						currentGameArray,
					);
					setGuiderHandler(
						currentOffsets,
						[currentPosition[0], currentPosition[1] - (tetrominoToSet ? 0 : 1)],
						ArrowLeft,
						currentRandomTetromino,
						currentGameArray,
						0,
					);
					checkHandler(
						currentOffsets,
						currentNextTetromino,
						[currentPosition[0], currentPosition[1] - (tetrominoToSet ? 0 : 1)],
						ArrowLeft,
						tetrominoToSet,
					);
					break;
				case ArrowRight:
					tetrominoToSet = tetrominoSetHandler(
						currentOffsets,
						[currentPosition[0], currentPosition[1] + 1],
						currentGameArray,
					);
					setGuiderHandler(
						currentOffsets,
						[currentPosition[0], currentPosition[1] + (tetrominoToSet ? 0 : 1)],
						ArrowRight,
						currentRandomTetromino,
						currentGameArray,
						0,
					);
					checkHandler(
						currentOffsets,
						currentNextTetromino,
						[currentPosition[0], currentPosition[1] + (tetrominoToSet ? 0 : 1)],
						ArrowRight,
						tetrominoToSet,
					);
					break;
				case Space:
					const { count } = setGuiderHandler(
						currentOffsets,
						currentPosition,
						ArrowDown,
						currentRandomTetromino,
						currentGameArray,
						0,
					);
					checkHandler(
						currentOffsets,
						currentNextTetromino,
						[currentPosition[0] + count, currentPosition[1]],
						ArrowDown,
					);
					break;
				default:
					return;
			}
		},
		[
			flipValue,
			tetrominoSetHandler,
			randomTetromino,
			position,
			gameArray,
			setGuiderHandler,
			checkHandler,
			nextTetromino,
			offsets,
			TetrisFlip,
		],
	);

	useEffect(() => {
		const currentGameActive: boolean = gameActive;
		if (currentGameActive) {
			const currentLevel: number = level;
			document.addEventListener("keydown", keyPressedHandler);
			document.addEventListener(
				"keyup",
				(e: KeyboardEvent): false | void =>
					e.key === KeyboardProps.ArrowDown &&
					setIntervalValue((1 / 60) * framesPerGridCell[level] * 1000),
			);
			return (): void => {
				document.removeEventListener("keydown", keyPressedHandler);
				document.removeEventListener(
					"keyup",
					(e: KeyboardEvent): false | void =>
						e.key === KeyboardProps.ArrowDown &&
						setIntervalValue((1 / 60) * framesPerGridCell[currentLevel] * 1000),
				);
			};
		}
	}, [keyPressedHandler, setIntervalValue, level, gameActive]);

	const getWindowWidth = () => {
		const windowWidth = window.innerWidth || 0;
		setWindowWidth(windowWidth);
	};

	useEffect(() => {
		window.addEventListener("resize", getWindowWidth);
		return () => window.removeEventListener("resize", getWindowWidth);
	}, []);

	const startGameHandler = useCallback((): void => {
		const currentGridSize: TetrisCoordProps = [...gridSize];
		const startGameRandomTetromino: string =
			Object.keys(tetrominoes)[
				Math.floor(Math.random() * Object.keys(tetrominoes).length)
			];
		const startGameNextRandomTetromino: string =
			Object.keys(tetrominoes)[
				Math.floor(Math.random() * Object.keys(tetrominoes).length)
			];
		const startOffsets: OffsetsProps =
			tetrominoes[`${startGameRandomTetromino}`].orientations[0][0];
		let startGameArr: GridCoordsProps = [];
		Array.from(
			{ length: currentGridSize[1] },
			(_, i) =>
				i > 1 &&
				i < currentGridSize[1] &&
				Array.from(
					{ length: currentGridSize[1] },
					(_, j) =>
						j > 1 && j < currentGridSize[0] && startGameArr.push([i, j, 0]),
				),
		);
		setGameInitialState(true);
		setGameActive(true);
		setGameOver(false);
		setPoints(0);
		setLines(0);
		setLevel(0);
		setIntervalValue(intervalVal);
		setGameArray(startGameArr);
		setNextTetromino(startGameNextRandomTetromino);
		setFilterGenerator([]);
		setFlipValue(0);
		setRandomTetromino(startGameRandomTetromino);
		setOffsets(startOffsets);
		setPosition([
			initialPosition[0] - startOffsets.topOffset,
			initialPosition[1],
		]);
		setGuiderHandler(
			startOffsets,
			[initialPosition[0] - startOffsets.topOffset, initialPosition[1]],
			KeyboardProps.ArrowDown,
			startGameRandomTetromino,
			startGameArr,
			0,
		);
	}, [gridSize, initialPosition, intervalVal, setGuiderHandler]);

	const touchStartHandler = useCallback(
		(e: React.TouchEvent<HTMLDivElement>) => {
			const currentGameGridSize = gameGridSize;
			const currentGridSize: TetrisCoordProps = gridSize;
			const touchPositionX = Math.ceil(
				((e.touches[0].clientX - currentGameGridSize.current.offsetLeft) /
					currentGameGridSize.current.clientWidth) *
					currentGridSize[0],
			);
			const touchPositionY = Math.ceil(
				((e.touches[0].clientY - currentGameGridSize.current.offsetTop) /
					currentGameGridSize.current.clientHeight) *
					currentGridSize[1],
			);
			setTouchStartingPosY(touchPositionY);
			setTouchStartingPosX(touchPositionX);
		},
		[gameGridSize, gridSize],
	);

	const touchMoveHandler = useCallback(
		(e: React.TouchEvent<HTMLDivElement>): void => {
			const currentDisableX: boolean = disableX;
			const currentDisableY: boolean = disableY;
			const currentGameActive: boolean = gameActive;
			const currentGameArray: any = [...gameArray];
			const currentGridSize: TetrisCoordProps = [...gridSize];
			const currentLevel: number = level;
			const currentNextTetromino: string = nextTetromino;
			const currentOffsets: OffsetsProps = offsets;
			const currentPosition: TetrisCoordProps = [...position];
			const currentPositionYMoved: number = positionYMoved;
			const currentRandomTetromino: string = randomTetromino;
			const currentTapped: boolean = tapped;
			const currentTimestamp: number = timestamp;
			const currentTouchStartingPosX: number = touchStartingPosX;
			const currentTouchStartingPosY: number = touchStartingPosY;
			setTimestamp(Date.now());
			setPositionYMoved(e.changedTouches[0].clientY);
			const dt = Date.now() - currentTimestamp;
			const dy = e.changedTouches[0].clientY - currentPositionYMoved;
			setTouchMoveSpeed(Math.round((dy / dt) * 100));
			if (currentGameActive) {
				const { ArrowLeft, ArrowRight } = KeyboardProps;
				let tetrominoToSet: boolean;
				const touchMovePositionX = Math.ceil(
					((e.touches[0].clientX - gameGridSize.current.offsetLeft) /
						gameGridSize.current.clientWidth) *
						currentGridSize[0],
				);
				const touchMovePositionY = Math.ceil(
					((e.touches[0].clientY - gameGridSize.current.offsetTop) /
						gameGridSize.current.clientHeight) *
						currentGridSize[1],
				);
				if (
					(touchMovePositionY > currentTouchStartingPosY ||
						touchMovePositionY < currentTouchStartingPosY) &&
					!currentDisableX &&
					!currentDisableY
				) {
					setDisableX(true);
				}
				if (
					(touchMovePositionX > currentTouchStartingPosX ||
						touchMovePositionX > currentTouchStartingPosX) &&
					!currentDisableX &&
					!currentDisableY
				) {
					setDisableY(true);
				}
				if (currentTapped) {
					setTapped(false);
				}
				if (!currentDisableY) {
					if (touchMovePositionY < currentTouchStartingPosY) {
						setTouchStartingPosY(touchMovePositionY);
						setIntervalValue((1 / 60) * framesPerGridCell[currentLevel] * 1000);
					} else if (touchMovePositionY - currentTouchStartingPosY > 3) {
						if (!currentTapped) {
							setTouchStartingPosY(touchMovePositionY);
							setIntervalValue(
								((1 / 60) * framesPerGridCell[currentLevel] * 1000) /
									(touchMovePositionY - currentTouchStartingPosY + 2),
							);
						}
					}
				}
				if (!currentDisableX && Math.round((dy / dt) * 100) < 5) {
					setTimestampSetter(Date.now());
					if (currentTouchStartingPosX > touchMovePositionX) {
						setDisableY(true);
					}
					if (
						currentTouchStartingPosX > touchMovePositionX &&
						currentTouchStartingPosX > 1
					) {
						tetrominoToSet = tetrominoSetHandler(
							currentOffsets,
							[currentPosition[0], currentPosition[1] - 1],
							currentGameArray,
						);
						setGuiderHandler(
							currentOffsets,
							[
								currentPosition[0],
								currentPosition[1] - (tetrominoToSet ? 0 : 1),
							],
							ArrowLeft,
							currentRandomTetromino,
							currentGameArray,
							0,
						);
						checkHandler(
							currentOffsets,
							currentNextTetromino,
							[
								currentPosition[0],
								currentPosition[1] - (tetrominoToSet ? 0 : 1),
							],
							ArrowLeft,
							tetrominoToSet,
						);
						setTouchStartingPosX(touchMovePositionX);
					} else if (
						currentTouchStartingPosX < touchMovePositionX &&
						currentTouchStartingPosX < currentGridSize[0]
					) {
						tetrominoToSet = tetrominoSetHandler(
							currentOffsets,
							[currentPosition[0], currentPosition[1] + 1],
							currentGameArray,
						);
						setGuiderHandler(
							currentOffsets,
							[
								currentPosition[0],
								currentPosition[1] + (tetrominoToSet ? 0 : 1),
							],
							ArrowRight,
							currentRandomTetromino,
							currentGameArray,
							0,
						);
						checkHandler(
							currentOffsets,
							currentNextTetromino,
							[
								currentPosition[0],
								currentPosition[1] + (tetrominoToSet ? 0 : 1),
							],
							ArrowRight,
							tetrominoToSet,
						);
						setTouchStartingPosX(touchMovePositionX);
					} else {
						return;
					}
				}
			}
		},
		[
			checkHandler,
			disableX,
			disableY,
			gameActive,
			gameArray,
			gameGridSize,
			gridSize,
			level,
			nextTetromino,
			offsets,
			position,
			positionYMoved,
			randomTetromino,
			setGuiderHandler,
			tapped,
			tetrominoSetHandler,
			timestamp,
			touchStartingPosX,
			touchStartingPosY,
		],
	);

	const touchEndHandler = useCallback(() => {
		const currentFlipValue: number = flipValue;
		const currentGameActive: boolean = gameActive;
		const currentGameArray: any = [...gameArray];
		const currentLevel: number = level;
		const currentMoveTouchSpeed: number = moveTouchSpeed;
		const currentNextTetromino: string = nextTetromino;
		const currentOffsets: OffsetsProps = offsets;
		const currentPosition: TetrisCoordProps = [...position];
		const currentRandomTetromino: string = randomTetromino;
		const currentTapped: boolean = tapped;
		const currentTimestampSetter: number = timestampSetter;
		if (currentGameActive) {
			const { ArrowUp, ArrowDown } = KeyboardProps;
			let tetrominoToSet: boolean;
			if (currentMoveTouchSpeed > 20 && Date.now() - currentTimestampSetter) {
				const { count } = setGuiderHandler(
					currentOffsets,
					currentPosition,
					ArrowDown,
					currentRandomTetromino,
					currentGameArray,
					0,
				);
				checkHandler(
					currentOffsets,
					currentNextTetromino,
					[currentPosition[0] + count, currentPosition[1]],
					ArrowDown,
				);
				setIntervalValue((1 / 60) * framesPerGridCell[currentLevel] * 1000);
				setTouchMoveSpeed(0);
			}
			if (currentTapped) {
				let flipVal: number = currentFlipValue;
				const updatedFlipValue =
					currentFlipValue === 3 ? 0 : currentFlipValue + 1;
				tetrominoToSet = tetrominoSetHandler(
					tetrominoes[`${currentRandomTetromino}`].orientations[
						updatedFlipValue
					][0],
					currentPosition,
					currentGameArray,
				);
				if (!tetrominoToSet) {
					soundPlay(TetrisFlip);
					flipVal = updatedFlipValue;
				}
				setFlipValue(flipVal);
				setOffsets(
					tetrominoes[`${currentRandomTetromino}`].orientations[flipVal][0],
				);
				setGuiderHandler(
					tetrominoes[`${currentRandomTetromino}`].orientations[flipVal][0],
					currentPosition,
					ArrowUp,
					currentRandomTetromino,
					currentGameArray,
					0,
				);
				checkHandler(
					tetrominoes[`${currentRandomTetromino}`].orientations[flipVal][0],
					currentNextTetromino,
					currentPosition,
					ArrowUp,
				);
			} else {
				setDisableX(false);
				setDisableY(false);
			}
			setTapped(true);
		}
	}, [
		TetrisFlip,
		checkHandler,
		flipValue,
		gameActive,
		gameArray,
		level,
		moveTouchSpeed,
		nextTetromino,
		offsets,
		position,
		randomTetromino,
		setGuiderHandler,
		tapped,
		tetrominoSetHandler,
		timestampSetter,
	]);

	const themeTuneHandler = (): void =>
		setMusicActive((musicActive: boolean): boolean => !musicActive);

	const gameActiveHandler = (): void =>
		setGameActive((gameActive: boolean): boolean => !gameActive);

	return (
		<div style={{ touchAction: "none" }}>
			{useMemo(
				(): false | React.ReactElement =>
					!gameOver && (
						<ReactHowler
							src={TetrisTheme}
							loop={true}
							playing={musicActive && gameActive}
						/>
					),
				[gameOver, TetrisTheme, musicActive, gameActive],
			)}
			<HighScoreStyles>
				High Score:{" "}
				{highScore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "-"}
			</HighScoreStyles>
			<TetrisLayout
				windowWidth={windowWidth}
				onTouchStart={(e: React.TouchEvent<HTMLDivElement>) =>
					touchStartHandler(e)
				}
				onTouchMove={(e: React.TouchEvent<HTMLDivElement>) =>
					touchMoveHandler(e)
				}
				onTouchEnd={() => touchEndHandler()}
			>
				<div ref={gameGridSize}>
					<TetrisGrid
						gridSize={gridSize}
						gridWidth={gridWidth}
						windowWidth={windowWidth}
					>
						{useMemo(
							(): false | React.ReactElement =>
								gameOver && (
									<Modal
										text="Game Over!"
										text2={`Score: ${
											points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ||
											"-"
										}`}
									/>
								),
							[gameOver, points],
						)}
						{useMemo(
							(): false | React.ReactElement =>
								gameInitialState &&
								!gameActive &&
								!gameOver && <Modal text="Paused" />,
							[gameActive, gameInitialState, gameOver],
						)}
						{useMemo(
							(): false | React.ReactElement =>
								!gameInitialState &&
								!gameActive &&
								!gameOver && (
									<Modal text="Press 'Start Game' to play" initial />
								),
							[gameActive, gameInitialState, gameOver],
						)}
						{useMemo(
							(): void =>
								gameInitialState &&
								!gameOver &&
								tetrominoes[`${randomTetromino}`].orientations[
									flipValue
								][0].shape.map(
									(
										block: TetrisCoordProps,
										i: number,
									): (
										| false
										| React.ReactElement<
												TetrisCoordProps,
												string | React.JSXElementConstructor<TetrisCoordProps>
										  >
									)[] =>
										block.map(
											(coord: number, j: number): false | React.ReactElement =>
												coord !== 0 && (
													<TetrisBlock
														key={`${i}, ${j}`}
														colour={tetrominoes[`${randomTetromino}`].colour}
														tetrisCoordX={position[0] + i + 1}
														tetrisCoordY={position[1] + j + 1}
													/>
												),
										),
								),
							[
								gameInitialState,
								gameOver,
								randomTetromino,
								flipValue,
								position,
							],
						)}
						{useMemo(
							(): React.ReactElement[] =>
								borderArray.map(
									(block: TetrisCoordProps): JSX.Element => (
										<TetrisBlock
											key={`${block[0]}, ${block[1]}`}
											colour={colours.grey}
											tetrisCoordX={block[0]}
											tetrisCoordY={block[1]}
										/>
									),
								),
							[borderArray],
						)}
						{useMemo(
							(): React.ReactElement[] =>
								lineAnimation.length > 0 &&
								lineAnimation.map((block: TetrisCoordProps): JSX.Element => {
									return (
										<TetrisBlock
											animation={true}
											key={`${block[0]}, ${block[1]}`}
											colour={colours.white}
											tetrisCoordX={block[0]}
											tetrisCoordY={block[1]}
										/>
									);
								}),
							[lineAnimation],
						)}
						{useMemo(
							():
								| false
								| (
										| false
										| React.ReactElement<
												TetrisCoordProps,
												| string
												| ((
														props: TetrisCoordProps,
												  ) => React.ReactElement<
														TetrisCoordProps,
														| string
														| React.JSXElementConstructor<TetrisCoordProps>
												  > | null)
												| (new (props: TetrisCoordProps) => React.Component<
														TetrisCoordProps,
														TetrisCoordProps,
														TetrisCoordProps
												  >)
										  >
								  )[] =>
								gameInitialState &&
								gameArray.map(
									(
										block: TetrisCoordProps,
										id: number,
									): false | React.ReactElement =>
										block[2] !== 0 && (
											<TetrisBlock
												key={id}
												colour={tetrominoes[`${block[2]}`].colour}
												tetrisCoordX={block[0]}
												tetrisCoordY={block[1]}
											/>
										),
								),
							[gameArray, gameInitialState],
						)}
						{useMemo(
							(): false | (false | JSX.Element)[] =>
								gameInitialState &&
								!gameOver &&
								guidePosition.map(
									(block: TetrisCoordProps): false | JSX.Element =>
										block[0] > 1 && (
											<TetrisBlock
												key={`${block[0]}, ${block[1]}`}
												colour={tetrominoes[`${block[2]}`].colour}
												tetrisCoordX={block[0]}
												tetrisCoordY={block[1]}
												border
											/>
										),
								),
							[gameOver, guidePosition, gameInitialState],
						)}
					</TetrisGrid>
				</div>

				<LeftColumnStyles windowWidth={windowWidth}>
					{musicActive ? (
						<GiSpeaker
							style={{ cursor: "pointer", color: "#fff" }}
							size="5vmin"
							onClick={() => themeTuneHandler()}
						/>
					) : (
						<GiSpeakerOff
							style={{ cursor: "pointer", color: "#fff" }}
							size="5vmin"
							onClick={() => themeTuneHandler()}
						/>
					)}
					<NextTetrisGrid
						gridSize={nextGridSize}
						gridWidth={(gridWidth / gridSize[1]) * nextGridSize[1]}
						windowWidth={windowWidth}
					>
						{useMemo(
							(): false | React.ReactElement =>
								gameInitialState &&
								tetrominoes[`${nextTetromino}`].orientations[0][0].shape.map(
									(
										row: TetrisCoordProps,
										i: number,
									): (
										| false
										| React.ReactElement<
												TetrisCoordProps,
												string | React.JSXElementConstructor<TetrisCoordProps>
										  >
									)[] =>
										row.map(
											(el: number, j: number): false | React.ReactElement =>
												el !== 0 && (
													<TetrisBlock
														key={`${i}, ${j}`}
														colour={tetrominoes[`${nextTetromino}`].colour}
														tetrisCoordX={
															i +
															Math.floor(
																(nextGridSize[1] +
																	(tetrominoes[`${nextTetromino}`]
																		.orientations[0][0].shape[0].length === 2
																		? 2
																		: 0) -
																	(tetrominoes[`${nextTetromino}`]
																		.orientations[0][0].shape[0].length -
																		tetrominoes[`${nextTetromino}`]
																			.orientations[0][0].topOffset -
																		tetrominoes[`${nextTetromino}`]
																			.orientations[0][0].bottomOffset)) /
																	2,
															)
														}
														tetrisCoordY={
															j +
															1 +
															Math.floor(
																(nextGridSize[0] -
																	tetrominoes[`${nextTetromino}`]
																		.orientations[0][0].shape[0].length) /
																	2,
															)
														}
													/>
												),
										),
								),
							[gameInitialState, nextTetromino, nextGridSize],
						)}
					</NextTetrisGrid>
					<DisplayContainerStyles windowWidth={windowWidth}>
						<ScoreDisplay
							title="Points"
							value={points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
							windowWidth={windowWidth}
						/>
						<ScoreDisplay
							title="Lines"
							value={lines}
							windowWidth={windowWidth}
						/>
						<ScoreDisplay
							title="Level"
							value={level}
							windowWidth={windowWidth}
						/>
					</DisplayContainerStyles>
				</LeftColumnStyles>
			</TetrisLayout>
			<ButtonContainerStyles>
				<ButtonStyles
					colour={colours.green}
					onClick={(): void => startGameHandler()}
					windowWidth={windowWidth}
				>
					{gameInitialState && !gameOver
						? "Restart"
						: gameInitialState && gameOver
						? "Play Again"
						: "Start Game"}
				</ButtonStyles>
				{!gameOver && gameInitialState && (
					<ButtonStyles
						colour={colours.red}
						onClick={() => gameActiveHandler()}
						windowWidth={windowWidth}
					>
						{gameActive ? "Pause" : "Resume"}
					</ButtonStyles>
				)}
			</ButtonContainerStyles>
		</div>
	);
};

export default App;
