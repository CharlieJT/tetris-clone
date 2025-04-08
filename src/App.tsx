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
import { generatedTetrominoHandler, filterUniqueItems } from "./utils";
import {
  framesPerGridCell,
  gamePoints,
  colours,
  tetrominoes,
  MAX_FLIP_VALUE,
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
import {
  FilterGeneratorItemProps,
  FilterGeneratorProps,
  GridCoordsProps,
  GridCoordStringProps,
  ShapeInfo,
  TetrisCoordProps,
} from "./interfaces";

const GRID_SIZE = [12, 22];
const NEXT_GRID_SIZE = [7, 6];
const INITIAL_POSITION = [1, 5];
const GRID_WIDTH = 80;
const INTERVAL_VALUE = (1 / 60) * framesPerGridCell[0] * 1000;

type ScoreState = {
  title: string;
  value: string | number;
}[];

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

const App = (): JSX.Element => {
  const [gridSizeX, gridSizeY]: TetrisCoordProps = GRID_SIZE;
  const [nextGridSizeX, nextGridSizeY]: TetrisCoordProps = NEXT_GRID_SIZE;
  const [initialPositionX, initialPositionY]: TetrisCoordProps =
    INITIAL_POSITION;
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
    { length: gridSizeY },
    (_, i) =>
      i > 1 &&
      i < gridSizeY &&
      Array.from(
        { length: gridSizeY },
        (_, j) => j > 1 && j < gridSizeX && gameArr.push([i, j, 0])
      )
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
    window.innerWidth || 0
  );
  const [highScore, setHighScore] = useState<string>(
    localStorage["tetris_high_score"] || "-"
  );
  const [points, setPoints] = useState<number>(0);
  const [lines, setLines] = useState<number>(0);
  const [level, setLevel] = useState<number>(0);
  const [touchStartingPosX, setTouchStartingPosX] = useState<number>(0);
  const [touchStartingPosY, setTouchStartingPosY] = useState<number>(0);
  const [lineAnimation, setLineAnimation] = useState<GridCoordsProps>([]);
  const [intervalValue, setIntervalValue] = useState<number>(intervalVal);
  const [gameArray, setGameArray] = useState<GridCoordsProps>(gameArr);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [musicActive, setMusicActive] = useState<boolean>(true);
  const [nextTetromino, setNextTetromino] = useState<string>(
    Object.keys(tetrominoes)[
      Math.floor(Math.random() * Object.keys(tetrominoes).length)
    ]
  );

  const [filterGenerator, setFilterGenerator] = useState<FilterGeneratorProps>(
    []
  );
  const [flipValue, setFlipValue] = useState<number>(0);
  const [randomTetromino, setRandomTetromino] = useState<string>(
    Object.keys(tetrominoes)[
      Math.floor(Math.random() * Object.keys(tetrominoes).length)
    ]
  );

  const { colour: currentColour, orientations: randomOrientations } =
    tetrominoes[`${randomTetromino}`];

  const [offsets, setOffsets] = useState<ShapeInfo>(
    randomOrientations[flipValue][0]
  );

  const [position, setPosition] = useState<TetrisCoordProps>([
    initialPositionX - offsets.topOffset,
    initialPositionY,
  ]);

  const [guidePosition, setGuidePosition] = useState<TetrisCoordProps[]>(
    generatedTetrominoHandler(position, offsets, randomTetromino)
  );

  Array.from({ length: gridSizeX }, (_, i) =>
    borderCreateArray.push([1, i + 1], [gridSizeY, i + 1])
  );

  Array.from({ length: gridSizeY }, (_, i) =>
    borderCreateArray.push([i + 1, 0], [i + 1, gridSizeX])
  );

  const { colour: nextColour, orientations } = tetrominoes[`${nextTetromino}`];
  const { shape, topOffset, bottomOffset } = orientations[0][0];
  const [shapeFirstRow] = shape;

  const soundPlay = (src: string) => {
    const sound = new Howl({ src, volume: 0.5 });
    sound.play();
  };

  const borderArray: GridCoordsProps = filterUniqueItems(
    borderCreateArray.sort(
      ([aX, aY]: TetrisCoordProps, [bX, bY]: TetrisCoordProps): number =>
        aX - bX || aY - bY
    ),
    (item: TetrisCoordProps) => item.join(",")
  );

  useInterval(
    () => {
      setGuiderHandler(
        offsets,
        [position[0] + 1, position[1]],
        KeyboardProps.ArrowDown,
        randomTetromino,
        gameArray,
        0
      );
      checkHandler(
        offsets,
        nextTetromino,
        [position[0] + 1, position[1]],
        KeyboardProps.ArrowDown
      );
    },
    gameActive ? intervalValue : null
  );

  const positionHandler = useCallback(
    (offsets: ShapeInfo, position: TetrisCoordProps) => {
      const { leftOffset, rightOffset, shape } = offsets;
      const [positionX, positionY] = position;
      if (positionY + leftOffset - 1 < 0) {
        return [positionX, 1 - leftOffset];
      } else if (positionY - rightOffset > gridSizeX - shape[0].length - 1) {
        return [positionX, gridSizeX - (shape[0].length + 1) + rightOffset];
      } else {
        return position;
      }
    },
    [gridSizeX]
  );

  const tetrominoSetHandler = useCallback(
    (
      offsets: ShapeInfo,
      position: TetrisCoordProps,
      gameArray: GridCoordsProps
    ): boolean => {
      const { leftOffset, rightOffset } = offsets;
      const updatedPosition = positionHandler(offsets, position);
      const generatedTetromino = generatedTetrominoHandler(
        updatedPosition,
        offsets
      );
      let tetrominoToSet: boolean = false;
      let newFilterGenerator = [...filterGenerator];
      const filteredArray = [...gameArray].filter(
        (x) => typeof x[2] === "string"
      ) as unknown as FilterGeneratorProps;

      filteredArray.forEach((item: FilterGeneratorItemProps) =>
        newFilterGenerator.push(item)
      );

      newFilterGenerator = filterUniqueItems(
        newFilterGenerator,
        (item: FilterGeneratorItemProps) => item.join(",")
      );
      if (
        newFilterGenerator.sort().join(",") !==
          filterGenerator.sort().join(",") &&
        filterGenerator.length !== 0
      ) {
        setFilterGenerator(newFilterGenerator);
      }
      generatedTetromino.forEach(([generatedTetrominoX, generatedTetrominoY]) =>
        newFilterGenerator.forEach(
          ([filterGeneratorX, filterGeneratorY]: GridCoordStringProps[]) => {
            if (
              generatedTetrominoX + 1 - leftOffset === +filterGeneratorX &&
              generatedTetrominoY - rightOffset === +filterGeneratorY &&
              !tetrominoToSet
            ) {
              tetrominoToSet = true;
            }
          }
        )
      );
      return tetrominoToSet;
    },
    [filterGenerator, positionHandler]
  );

  const lineAnimationHandler = useCallback(
    (lines: TetrisCoordProps) => {
      let lineArray: GridCoordsProps = [];
      lines.forEach((line) => {
        for (let i = 2; i < gridSizeX; i++) lineArray.push([line, i]);
      });
      setLineAnimation(lineArray);
      setTimeout(() => {
        setLineAnimation([]);
      }, 500);
    },
    [gridSizeX]
  );

  const lineCheckHandler = useCallback(
    (gameArray) => {
      let arrayIndex: number;
      let foundLine = false;
      let currentGameArray: GridCoordsProps = [...gameArray];
      let lineArray: TetrisCoordProps = [];
      let lineCount: number = 0;
      const currentActiveBlocks = gameArray.filter(
        (coord: TetrominoProps) => typeof coord[2] === "string"
      );
      for (let i = 0; i < gridSizeY; i++) {
        const rowCount = currentActiveBlocks.reduce(
          (acc: number, [valX]: TetrisCoordProps) =>
            valX === i ? acc + 1 : acc,
          0
        );
        if (rowCount === gridSizeX - 2) {
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
        currentGameArray.forEach((el) => {
          const [elX, elY, elZ] = el;
          arrayIndex = currentGameArray.findIndex(
            ([filteredElX, filteredElY]) =>
              elX === filteredElX && elY === filteredElY
          );
          if (elX < lineArray[0]) {
            newGameArray.splice(arrayIndex, 1, [elX + 1, elY, elZ]);
          } else if (elX === lineArray[0]) {
            newGameArray.splice(arrayIndex, 1, [2, elY, 0]);
          } else {
            newGameArray.splice(arrayIndex, 1, el);
          }
        });
        currentGameArray = newGameArray;
        lineArray.shift();
      }
      if (foundLine) {
        setPoints((points) => points + gamePoints[lineCount - 1] * (level + 1));
        setIntervalValue((1 / 60) * framesPerGridCell[level] * 1000);
        setLines((lines) => {
          setLevel(Math.floor((lines + lineCount) / 10));
          return lines + lineCount;
        });
      }
      setGameArray(currentGameArray);
      return lineCount;
    },
    [gridSizeX, gridSizeY, TetrisLine, TetrisPop, level, lineAnimationHandler]
  );

  const setShapeHandler = useCallback(
    (
      position: TetrisCoordProps,
      offsets: ShapeInfo
    ): { lineCount: number; newGameArray: GridCoordsProps } => {
      let newGameArray = [...gameArray];
      let arrayIndex: number;
      const { leftOffset, rightOffset } = offsets;
      const generatedTetromino = generatedTetrominoHandler(position, offsets);
      generatedTetromino.forEach(([rowX, rowY]: TetrisCoordProps) => {
        const rowXWithOffset = rowX - leftOffset;
        const rowYWithOffset = rowY - rightOffset;
        arrayIndex = newGameArray.findIndex(
          ([arrayCoordX, arrayCoordY]) =>
            rowXWithOffset === arrayCoordX && rowYWithOffset === arrayCoordY
        );
        const updatedArrayVal = [
          rowXWithOffset,
          rowYWithOffset,
          randomTetromino as unknown as number,
        ];
        newGameArray[arrayIndex] = updatedArrayVal;
      });
      const lineCount = lineCheckHandler(newGameArray);
      return { lineCount, newGameArray };
    },
    [gameArray, lineCheckHandler, randomTetromino]
  );

  const gameOverCheckHandler = (newGameArray: GridCoordsProps) => {
    let gameOver = false;
    newGameArray.forEach(([elX, , elZ]) => {
      if (elX === 1 && typeof elZ === "string" && !gameOver) {
        gameOver = true;
      }
    });
    return gameOver;
  };

  const setGuiderHandler = useCallback(
    (
      offsets: ShapeInfo,
      position: TetrisCoordProps,
      keyPressed: KeyboardProps,
      randomTetromino: string,
      gameArray: GridCoordsProps,
      lineCount: number
    ) => {
      const {
        shape: [shapeFirstRow],
        leftOffset,
        topOffset,
        bottomOffset,
        rightOffset,
      } = offsets;
      const { ArrowLeft, ArrowRight } = KeyboardProps;
      const [positionX, positionY] = position;
      const generatedTetromino = generatedTetrominoHandler(position, offsets);
      const updatedGuideArray: GridCoordsProps = [];
      let tetrominoToSet: boolean;
      let count = lineCount;
      let condition =
        positionX + count + shapeFirstRow.length === gridSizeY + bottomOffset;
      while (!condition && count < gridSizeY) {
        tetrominoToSet = tetrominoSetHandler(
          offsets,
          [positionX + count + 1, positionY],
          gameArray
        );
        condition =
          positionX + count + shapeFirstRow.length + 1 ===
            gridSizeY + bottomOffset || tetrominoToSet;
        count = count + 1;
      }
      generatedTetromino.forEach(
        ([blockX, blockY]: TetrisCoordProps, i: number) =>
          updatedGuideArray.push(
            (positionY + leftOffset - 1 < 0 && keyPressed === ArrowLeft) ||
              (positionY - rightOffset > gridSizeX - shapeFirstRow.length - 1 &&
                keyPressed === ArrowRight)
              ? (guidePosition as any)[i]
              : [
                  blockX + count + lineCount - leftOffset,
                  positionY + leftOffset - 1 < 0
                    ? blockY +
                      (shapeFirstRow.length === 4 && topOffset === 2 ? 2 : 1) -
                      rightOffset
                    : positionY - rightOffset >
                      gridSizeX - shapeFirstRow.length - 1
                    ? blockY -
                      (shapeFirstRow.length === 4 && bottomOffset === 2
                        ? 2
                        : 1) -
                      rightOffset
                    : blockY - rightOffset,
                  randomTetromino,
                ]
          )
      );
      setGuidePosition(updatedGuideArray);
      return { updatedGuideArray, count };
    },
    [gridSizeX, gridSizeY, guidePosition, tetrominoSetHandler]
  );

  const topOffsetHandler = useCallback(
    (position: TetrisCoordProps, offsets: ShapeInfo) => {
      const { lineCount, newGameArray } = setShapeHandler(position, offsets);
      const checkGameOver = gameOverCheckHandler(newGameArray);
      let offsetCount = 0;
      const generatedTetromino = generatedTetrominoHandler(
        [1 - topOffset, 5],
        orientations[0][0]
      );
      let condition = false;
      do {
        condition = false;
        newGameArray.forEach(([blockX, blockY, blockZ]) =>
          generatedTetromino.forEach(
            ([generatedTetrominoX, generatedTetrominoY]) => {
              if (
                blockX === generatedTetrominoX - offsetCount + 1 &&
                blockY === generatedTetrominoY &&
                typeof blockZ === "string"
              ) {
                condition = true;
              }
            }
          )
        );
        offsetCount = offsetCount + 1;
      } while (condition);
      return { offsetCount, checkGameOver, lineCount, newGameArray };
    },
    [setShapeHandler, orientations, topOffset]
  );

  const highScoreHandler = useCallback(() => {
    const stringScore = String(points);
    var highScore = localStorage["tetris_high_score"] || 0;
    if (!highScore && points > 0) {
      localStorage.setItem("tetris_high_score", stringScore);
      setHighScore(stringScore);
    } else {
      if (points > parseInt(highScore)) {
        localStorage.setItem("tetris_high_score", stringScore);
        setHighScore(stringScore);
      }
    }
  }, [points]);

  const checkHandler = useCallback(
    (
      offsets: ShapeInfo,
      nextTetromino: string,
      position: TetrisCoordProps,
      keyPressed: KeyboardProps,
      keyPressedTetrominoToSet?: boolean
    ) => {
      const {
        shape: [shapeFirstRow],
        leftOffset,
        rightOffset,
        bottomOffset,
      } = offsets;
      const { ArrowDown, ArrowLeft, ArrowRight } = KeyboardProps;
      const [positionX, positionY] = position;
      const tetrominoToSet =
        keyPressed === ArrowDown
          ? tetrominoSetHandler(offsets, position, gameArray)
          : false;
      if (
        positionX + shapeFirstRow.length === gridSizeY + bottomOffset ||
        tetrominoToSet
      ) {
        soundPlay(TetrisSet);
        setIntervalValue((1 / 60) * framesPerGridCell[level] * 1000);
        setTapped(true);
        const { offsetCount, checkGameOver, lineCount, newGameArray } =
          topOffsetHandler(position, offsets);
        if (newGameArray[-1] !== undefined || checkGameOver) {
          soundPlay(TetrisGameOver);
          const gameOverArray = newGameArray.filter(([elX]) => elX > 1);
          setGameOver(true);
          setGameActive(false);
          setGuidePosition([]);
          setPosition([1, 5]);
          setGameArray(gameOverArray);
          highScoreHandler();
        } else {
          const newInitialPosition = [1 - topOffset - (offsetCount - 1), 5];
          setFilterGenerator([]);
          setFlipValue(0);
          setRandomTetromino(nextTetromino);
          setOffsets(orientations[0][0]);
          setNextTetromino(
            Object.keys(tetrominoes)[
              Math.floor(Math.random() * Object.keys(tetrominoes).length)
            ]
          );
          setPosition(newInitialPosition);
          setGuiderHandler(
            orientations[0][0],
            newInitialPosition,
            ArrowDown,
            nextTetromino,
            newGameArray,
            lineCount
          );
        }
      } else if (positionY + leftOffset - 1 < 0) {
        setPosition([positionX, 1 - leftOffset]);
      } else if (
        positionY - rightOffset >
        gridSizeX - shapeFirstRow.length - 1
      ) {
        setPosition([
          positionX,
          gridSizeX - (shapeFirstRow.length + 1) + rightOffset,
        ]);
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
      gridSizeX,
      gridSizeY,
      gameArray,
      level,
      tetrominoSetHandler,
      TetrisSet,
      topOffsetHandler,
      TetrisGameOver,
      highScoreHandler,
      setGuiderHandler,
      TetrisMove,
      orientations,
      topOffset,
    ]
  );

  const upHandler = useCallback(
    (ArrowUp: KeyboardProps.ArrowUp) => {
      let flipVal = flipValue;

      const updatedFlipValue = (flipValue + 1) % (MAX_FLIP_VALUE + 1);
      const tetrominoToSet = tetrominoSetHandler(
        randomOrientations[updatedFlipValue][0],
        position,
        gameArray
      );
      if (!tetrominoToSet) {
        soundPlay(TetrisFlip);
        flipVal = updatedFlipValue;
      }
      const [newFlipValue] = randomOrientations[flipVal];
      setFlipValue(flipVal);
      setOffsets(newFlipValue);
      setGuiderHandler(
        newFlipValue,
        position,
        ArrowUp,
        randomTetromino,
        gameArray,
        0
      );
      checkHandler(newFlipValue, nextTetromino, position, ArrowUp);
    },
    [
      TetrisFlip,
      flipValue,
      randomOrientations,
      gameArray,
      nextTetromino,
      position,
      randomTetromino,
      setGuiderHandler,
      tetrominoSetHandler,
      checkHandler,
    ]
  );

  const downHandler = useCallback(
    (
      positionX: number,
      positionY: number,
      ArrowDown: KeyboardProps.ArrowDown
    ) => {
      setIntervalValue(50);
      setGuiderHandler(
        offsets,
        [positionX + 1, positionY],
        ArrowDown,
        randomTetromino,
        gameArray,
        0
      );
      checkHandler(
        offsets,
        nextTetromino,
        [positionX + 1, positionY],
        ArrowDown
      );
    },
    [
      checkHandler,
      gameArray,
      nextTetromino,
      offsets,
      randomTetromino,
      setGuiderHandler,
    ]
  );

  const leftHandler = useCallback(
    (
      positionX: number,
      positionY: number,
      ArrowLeft: KeyboardProps.ArrowLeft
    ) => {
      const tetrominoToSet: boolean = tetrominoSetHandler(
        offsets,
        [positionX, positionY - 1],
        gameArray
      );
      setGuiderHandler(
        offsets,
        [positionX, positionY - (tetrominoToSet ? 0 : 1)],
        ArrowLeft,
        randomTetromino,
        gameArray,
        0
      );
      checkHandler(
        offsets,
        nextTetromino,
        [positionX, positionY - (tetrominoToSet ? 0 : 1)],
        ArrowLeft,
        tetrominoToSet
      );
    },
    [
      checkHandler,
      gameArray,
      nextTetromino,
      offsets,
      randomTetromino,
      setGuiderHandler,
      tetrominoSetHandler,
    ]
  );

  const rightHandler = useCallback(
    (
      positionX: number,
      positionY: number,
      ArrowRight: KeyboardProps.ArrowRight
    ) => {
      const tetrominoToSet = tetrominoSetHandler(
        offsets,
        [positionX, positionY + 1],
        gameArray
      );
      setGuiderHandler(
        offsets,
        [positionX, positionY + (tetrominoToSet ? 0 : 1)],
        ArrowRight,
        randomTetromino,
        gameArray,
        0
      );
      checkHandler(
        offsets,
        nextTetromino,
        [positionX, positionY + (tetrominoToSet ? 0 : 1)],
        ArrowRight,
        tetrominoToSet
      );
    },
    [
      checkHandler,
      gameArray,
      nextTetromino,
      offsets,
      randomTetromino,
      setGuiderHandler,
      tetrominoSetHandler,
    ]
  );

  const spaceHandler = useCallback(
    (
      positionX: number,
      positionY: number,
      ArrowDown: KeyboardProps.ArrowDown
    ) => {
      const { count } = setGuiderHandler(
        offsets,
        position,
        ArrowDown,
        randomTetromino,
        gameArray,
        0
      );
      checkHandler(
        offsets,
        nextTetromino,
        [positionX + count, positionY],
        ArrowDown
      );
    },
    [
      checkHandler,
      gameArray,
      nextTetromino,
      offsets,
      position,
      randomTetromino,
      setGuiderHandler,
    ]
  );

  const keyPressedHandler = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      const { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Space } =
        KeyboardProps;
      const [positionX, positionY] = position;
      switch (e.key) {
        case ArrowUp:
          upHandler(ArrowUp);
          break;
        case ArrowDown:
          downHandler(positionX, positionY, ArrowDown);
          break;
        case ArrowLeft:
          leftHandler(positionX, positionY, ArrowLeft);
          break;
        case ArrowRight:
          rightHandler(positionX, positionY, ArrowRight);
          break;
        case Space:
          spaceHandler(positionX, positionY, ArrowDown);
          break;
        default:
          return;
      }
    },
    [position, downHandler, leftHandler, rightHandler, upHandler, spaceHandler]
  );

  useEffect(() => {
    if (gameActive) {
      document.addEventListener("keydown", keyPressedHandler);
      document.addEventListener(
        "keyup",
        (e) =>
          e.key === KeyboardProps.ArrowDown &&
          setIntervalValue((1 / 60) * framesPerGridCell[level] * 1000)
      );
      return () => {
        document.removeEventListener("keydown", keyPressedHandler);
        document.removeEventListener(
          "keyup",
          (e) =>
            e.key === KeyboardProps.ArrowDown &&
            setIntervalValue((1 / 60) * framesPerGridCell[level] * 1000)
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

  const startGameHandler = useCallback(() => {
    const startGameRandomTetromino =
      Object.keys(tetrominoes)[
        Math.floor(Math.random() * Object.keys(tetrominoes).length)
      ];
    const startGameNextRandomTetromino =
      Object.keys(tetrominoes)[
        Math.floor(Math.random() * Object.keys(tetrominoes).length)
      ];
    const startOffsets =
      tetrominoes[`${startGameRandomTetromino}`].orientations[0][0];
    let startGameArr: GridCoordsProps = [];
    Array.from(
      { length: gridSizeY },
      (_, i) =>
        i > 1 &&
        i < gridSizeY &&
        Array.from(
          { length: gridSizeY },
          (_, j) => j > 1 && j < gridSizeX && startGameArr.push([i, j, 0])
        )
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
    setPosition([initialPositionX - startOffsets.topOffset, initialPositionY]);
    setGuiderHandler(
      startOffsets,
      [initialPositionX - startOffsets.topOffset, initialPositionY],
      KeyboardProps.ArrowDown,
      startGameRandomTetromino,
      startGameArr,
      0
    );
  }, [
    gridSizeX,
    gridSizeY,
    initialPositionX,
    initialPositionY,
    intervalVal,
    setGuiderHandler,
  ]);

  const touchStartHandler = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const { clientX, clientY } = e.touches[0];
      const { offsetLeft, offsetTop, clientWidth, clientHeight } =
        gameGridSize.current;
      const touchPositionX = Math.ceil(
        ((clientX - offsetLeft) / clientWidth) * gridSizeX
      );
      const touchPositionY = Math.ceil(
        ((clientY - offsetTop) / clientHeight) * gridSizeY
      );
      setTouchStartingPosY(touchPositionY);
      setTouchStartingPosX(touchPositionX);
    },
    [gridSizeX, gridSizeY, gameGridSize]
  );

  const touchMoveHandler = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const [positionX, positionY] = position;
      const { clientY } = e.touches[0];
      setTimestamp(Date.now());
      setPositionYMoved(clientY);
      const dt = Date.now() - timestamp;
      const dy = clientY - positionYMoved;
      setTouchMoveSpeed(Math.round((dy / dt) * 100));
      if (gameActive) {
        const { ArrowLeft, ArrowRight } = KeyboardProps;
        const { offsetLeft, offsetTop, clientWidth, clientHeight } =
          gameGridSize.current;
        const { clientX, clientY } = e.touches[0];
        const touchMovePositionX = Math.ceil(
          ((clientX - offsetLeft) / clientWidth) * gridSizeX
        );
        const touchMovePositionY = Math.ceil(
          ((clientY - offsetTop) / clientHeight) * gridSizeY
        );
        if (
          (touchMovePositionY > touchStartingPosY ||
            touchMovePositionY < touchStartingPosY) &&
          !disableX &&
          !disableY
        ) {
          setDisableX(true);
        }
        if (
          (touchMovePositionX > touchStartingPosX ||
            touchMovePositionX > touchStartingPosX) &&
          !disableX &&
          !disableY
        ) {
          setDisableY(true);
        }
        if (tapped) {
          setTapped(false);
        }
        if (!disableY) {
          if (touchMovePositionY < touchStartingPosY) {
            setTouchStartingPosY(touchMovePositionY);
            setIntervalValue((1 / 60) * framesPerGridCell[level] * 1000);
          } else if (touchMovePositionY - touchStartingPosY > 3) {
            if (!tapped) {
              setTouchStartingPosY(touchMovePositionY);
              setIntervalValue(
                ((1 / 60) * framesPerGridCell[level] * 1000) /
                  (touchMovePositionY - touchStartingPosY + 2)
              );
            }
          }
        }
        if (!disableX && Math.round((dy / dt) * 100) < 5) {
          setTimestampSetter(Date.now());
          if (touchStartingPosX > touchMovePositionX) {
            setDisableY(true);
          }
          if (touchStartingPosX > touchMovePositionX && touchStartingPosX > 1) {
            leftHandler(positionX, positionY, ArrowLeft);
            setTouchStartingPosX(touchMovePositionX);
          } else if (
            touchStartingPosX < touchMovePositionX &&
            touchStartingPosX < gridSizeX
          ) {
            rightHandler(positionX, positionY, ArrowRight);
            setTouchStartingPosX(touchMovePositionX);
          } else {
            return;
          }
        }
      }
    },
    [
      leftHandler,
      rightHandler,
      gridSizeX,
      gridSizeY,
      disableX,
      disableY,
      gameActive,
      gameGridSize,
      level,
      position,
      positionYMoved,
      tapped,
      timestamp,
      touchStartingPosX,
      touchStartingPosY,
    ]
  );

  const touchEndHandler = useCallback(() => {
    const [positionX, positionY] = position;
    if (gameActive) {
      const { ArrowUp, ArrowDown } = KeyboardProps;
      if (moveTouchSpeed > 20 && Date.now() - timestampSetter) {
        spaceHandler(positionX, positionY, ArrowDown);
        setIntervalValue((1 / 60) * framesPerGridCell[level] * 1000);
        setTouchMoveSpeed(0);
      }
      if (tapped) {
        upHandler(ArrowUp);
      } else {
        setDisableX(false);
        setDisableY(false);
      }
      setTapped(true);
    }
  }, [
    spaceHandler,
    upHandler,
    gameActive,
    level,
    moveTouchSpeed,
    position,
    tapped,
    timestampSetter,
  ]);

  const themeTuneHandler = () => setMusicActive((musicActive) => !musicActive);

  const gameActiveHandler = () => setGameActive((gameActive) => !gameActive);

  const GiSpeakerComponent = musicActive ? GiSpeaker : GiSpeakerOff;

  const scoreState: ScoreState = [
    {
      title: "Points",
      value: points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    },
    { title: "Lines", value: lines },
    { title: "Level", value: level },
  ];

  return (
    <div style={{ touchAction: "none" }}>
      {useMemo(
        () =>
          !gameOver && (
            <ReactHowler
              src={TetrisTheme}
              playing={musicActive && gameActive}
              loop
            />
          ),
        [gameOver, TetrisTheme, musicActive, gameActive]
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
            gridSize={GRID_SIZE}
            gridWidth={gridWidth}
            windowWidth={windowWidth}
          >
            {useMemo(
              () =>
                gameOver && (
                  <Modal
                    text="Game Over!"
                    text2={`Score: ${
                      points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ||
                      "-"
                    }`}
                  />
                ),
              [gameOver, points]
            )}
            {useMemo(
              () =>
                gameInitialState &&
                !gameActive &&
                !gameOver && <Modal text="Paused" />,
              [gameActive, gameInitialState, gameOver]
            )}
            {useMemo(
              () =>
                !gameInitialState &&
                !gameActive &&
                !gameOver && (
                  <Modal text="Press 'Start Game' to play" initial />
                ),
              [gameActive, gameInitialState, gameOver]
            )}
            {gameInitialState &&
              !gameOver &&
              randomOrientations[flipValue][0].shape.map((block, i) =>
                block.map(
                  (coord, j) =>
                    coord !== 0 && (
                      <TetrisBlock
                        key={`${i}, ${j}`}
                        colour={currentColour}
                        tetrisCoordX={position[0] + i + 1}
                        tetrisCoordY={position[1] + j + 1}
                      />
                    )
                )
              )}
            {useMemo(
              () =>
                borderArray.map(([blockX, blockY]) => (
                  <TetrisBlock
                    key={`${blockX}, ${blockY}`}
                    colour={colours.grey}
                    tetrisCoordX={blockX}
                    tetrisCoordY={blockY}
                  />
                )),
              [borderArray]
            )}
            {useMemo(
              () =>
                lineAnimation.length > 0 &&
                lineAnimation.map(([blockX, blockY]) => {
                  return (
                    <TetrisBlock
                      animation={true}
                      key={`${blockX}, ${blockY}`}
                      colour={colours.white}
                      tetrisCoordX={blockX}
                      tetrisCoordY={blockY}
                    />
                  );
                }),
              [lineAnimation]
            )}
            {useMemo(
              () =>
                gameInitialState &&
                gameArray.map(
                  ([blockX, blockY, blockZ], id) =>
                    blockZ !== 0 && (
                      <TetrisBlock
                        key={id}
                        colour={tetrominoes[`${blockZ}`].colour}
                        tetrisCoordX={blockX}
                        tetrisCoordY={blockY}
                      />
                    )
                ),
              [gameArray, gameInitialState]
            )}
            {gameInitialState &&
              !gameOver &&
              guidePosition.map(
                ([blockX, blockY, blockZ]) =>
                  blockX > 1 && (
                    <TetrisBlock
                      key={`${blockX}, ${blockY}`}
                      colour={tetrominoes[`${blockZ}`].colour}
                      tetrisCoordX={blockX}
                      tetrisCoordY={blockY}
                      border
                    />
                  )
              )}
          </TetrisGrid>
        </div>

        <LeftColumnStyles windowWidth={windowWidth}>
          <GiSpeakerComponent
            style={{ cursor: "pointer", color: "#fff" }}
            size="5vmin"
            onClick={() => themeTuneHandler()}
          />
          <NextTetrisGrid
            gridSize={NEXT_GRID_SIZE}
            gridWidth={(gridWidth / gridSizeY) * nextGridSizeY}
            windowWidth={windowWidth}
          >
            {gameInitialState &&
              shape.map((row, i) =>
                row.map(
                  (el, j) =>
                    el !== 0 && (
                      <TetrisBlock
                        key={`${i}, ${j}`}
                        colour={nextColour}
                        tetrisCoordX={
                          i +
                          Math.floor(
                            (nextGridSizeY +
                              (shapeFirstRow.length === 2 ? 2 : 0) -
                              (shapeFirstRow.length -
                                topOffset -
                                bottomOffset)) /
                              2
                          )
                        }
                        tetrisCoordY={
                          j +
                          1 +
                          Math.floor((nextGridSizeX - shapeFirstRow.length) / 2)
                        }
                      />
                    )
                )
              )}
          </NextTetrisGrid>
          <DisplayContainerStyles windowWidth={windowWidth}>
            {scoreState.map(({ title, value }) => (
              <ScoreDisplay
                key={title}
                title={title}
                value={value}
                windowWidth={windowWidth}
              />
            ))}
          </DisplayContainerStyles>
        </LeftColumnStyles>
      </TetrisLayout>
      <ButtonContainerStyles>
        <ButtonStyles
          colour={colours.green}
          onClick={() => startGameHandler()}
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
