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

export const tetrominoesInformation = [
  {
    intialShape: [0, 0, 0, 1, 1, 0, 0, 1, 1],
    letter: "Z",
    colour: colours.red,
  },
  {
    intialShape: [0, 0, 0, 1, 1, 1, 1, 0, 0],
    letter: "L",
    colour: colours.beige,
  },
  {
    intialShape: [0, 0, 0, 1, 1, 1, 0, 1, 0],
    letter: "T",
    colour: colours.purple,
  },
  {
    intialShape: [0, 0, 0, 1, 1, 1, 0, 0, 1],
    letter: "J",
    colour: colours.blue,
  },
  {
    intialShape: [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    letter: "I",
    colour: colours.lightblue,
  },
  {
    intialShape: [0, 0, 0, 0, 1, 1, 1, 1, 0],
    letter: "S",
    colour: colours.green,
  },
  {
    intialShape: [1, 1, 1, 1],
    letter: "O",
    colour: colours.yellow,
  },
];

const arrayChunks = (
  array: number[],
  size: number,
  letter: string
): ShapeItem[] => {
  let count = 0;
  const buildArray = [];
  for (let i = 0; i < size; i++) {
    const newArray = array
      .slice(count, count + size)
      .map((item) => (Boolean(item) ? letter : 0));
    if (newArray.length) buildArray.push(newArray);
    count += size;
  }
  return buildArray;
};

export const getOffsets = (shape: ShapeItem[], letter: string) => {
  const itemEqualsLetter = (item: string | number) => item === letter;
  const topOffset = shape.findIndex((items) => items.includes(letter));
  const filterByPositives = (indexArray: number[]) =>
    indexArray.filter((index) => index >= 0);
  const leftOffset = Math.min(
    ...filterByPositives(
      shape.map((items) => items.findIndex(itemEqualsLetter))
    )
  );
  const rightOffset =
    shape.length -
    Math.max(
      ...filterByPositives(
        shape.map((items) => findLastIndex(items, itemEqualsLetter) + 1)
      )
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
    let updatedShape = arrayChunks(
      intialShape,
      Math.sqrt(intialShape.length),
      letter
    );
    const orientations = [getShapeInfo(updatedShape, letter)];

    for (let i = 0; i < MAX_FLIP_VALUE; i++) {
      const newShape: ShapeItem[] = updatedShape.map((row) => row.map(() => 0));
      for (let row = 0; row < updatedShape.length; row++) {
        for (let col = 0; col < updatedShape[row].length; col++) {
          newShape[row][col] = updatedShape[updatedShape.length - 1 - col][row];
        }
      }
      updatedShape = newShape;
      orientations.push(getShapeInfo(updatedShape, letter));
    }
    tetrominoesBuilder[letter] = { orientations, colour };
  });

  return tetrominoesBuilder;
};

const tetrominoes: Tetrominoes = getTetrominoesHandler(tetrominoesInformation);

export { framesPerGridCell, gamePoints, colours, tetrominoes };
