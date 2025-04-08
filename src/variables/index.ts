import {
  ShapeItem,
  Tetrominoes,
  TetrominoesBuilder,
  TetrominoInfo,
} from "../interfaces";
import { findLastIndex } from "../utils/index";

export const MAX_FLIP_VALUE = 3;

const framesPerGridCell: number[] = [
  48, 43, 38, 33, 28, 23, 18, 13, 8, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 2, 1,
];

const gamePoints = [40, 100, 300, 1200];

const colours = {
  red: "#f00001",
  beige: "#f09f02",
  purple: "#9f02f0",
  blue: "#0034ef",
  lightblue: "#0deff0",
  green: "#00f000",
  yellow: "#f0f000",
  grey: "#5e5e5e",
  white: "#fff",
};

const tetrominoesInformation = [
  {
    intialShape: [
      [0, 0, 0],
      ["Z", "Z", 0],
      [0, "Z", "Z"],
    ],
    letter: "Z",
    colour: colours.red,
  },
  {
    intialShape: [
      [0, 0, 0],
      ["L", "L", "L"],
      ["L", 0, 0],
    ],
    letter: "L",
    colour: colours.beige,
  },
  {
    intialShape: [
      [0, 0, 0],
      ["T", "T", "T"],
      [0, "T", 0],
    ],
    letter: "T",
    colour: colours.purple,
  },
  {
    intialShape: [
      [0, 0, 0],
      ["J", "J", "J"],
      [0, 0, "J"],
    ],
    letter: "J",
    colour: colours.blue,
  },
  {
    intialShape: [
      [0, 0, 0, 0],
      ["I", "I", "I", "I"],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    letter: "I",
    colour: colours.lightblue,
  },
  {
    intialShape: [
      [0, 0, 0],
      [0, "S", "S"],
      ["S", "S", 0],
    ],
    letter: "S",
    colour: colours.green,
  },
  {
    intialShape: [
      ["O", "O"],
      ["O", "O"],
    ],
    letter: "O",
    colour: colours.yellow,
  },
];

export const getOffsets = (shape: ShapeItem[], letter: string) => {
  const topOffset = shape.findIndex((items) => items.includes(letter));
  const leftOffset = Math.min(
    ...shape
      .map((items) => items.findIndex((item) => item === letter))
      .filter((index) => index >= 0)
  );
  const rightOffset =
    shape.length -
    Math.max(
      ...shape
        .map((items) => findLastIndex(items, (item) => item === letter) + 1)
        .filter((index) => index >= 0)
    );
  const bottomOffset =
    shape.length -
    (findLastIndex(shape, (items) => items.includes(letter)) + 1);
  return { topOffset, bottomOffset, leftOffset, rightOffset };
};

export const getShapeInfo = (brandNewShape: ShapeItem[], letter: string) => [
  { shape: brandNewShape, ...getOffsets(brandNewShape, letter) },
];

export const getTetrominoesHandler = (tetrominoesInfo: TetrominoInfo[]) => {
  const tetrominoesBuilder: TetrominoesBuilder = {};
  tetrominoesInfo.forEach(({ intialShape, letter, colour }) => {
    const orientations = [getShapeInfo(intialShape, letter)];
    for (let i = 0; i < MAX_FLIP_VALUE; i++) {
      const newShape: ShapeItem[] = intialShape.map((row) => row.map(() => 0));
      for (let row = 0; row < intialShape.length; row++) {
        for (let col = 0; col < intialShape[row].length; col++) {
          newShape[row][col] = intialShape[intialShape.length - 1 - col][row];
        }
      }
      intialShape = newShape;
      orientations.push(getShapeInfo(intialShape, letter));
    }
    tetrominoesBuilder[letter] = { orientations, colour };
  });

  return tetrominoesBuilder;
};

const tetrominoes: Tetrominoes = getTetrominoesHandler(tetrominoesInformation);

export { framesPerGridCell, gamePoints, colours, tetrominoes };
