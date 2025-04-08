import { ShapeInfo } from "../interfaces";
import {
  filterUniqueItems,
  generatedTetrominoHandler,
  findLastIndex,
} from "./index";

describe("filterUniqueItems", () => {
  it("should filter out duplicate items based on JSON.stringify by default", () => {
    const items = [
      { x: 1, y: 2 },
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ];
    const result = filterUniqueItems(items);
    expect(result).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]);
  });

  it("should filter out duplicate items based on a custom keyExtractor", () => {
    const items = [
      { id: 1, value: "a" },
      { id: 2, value: "b" },
      { id: 1, value: "c" },
    ];
    const result = filterUniqueItems(items, (item) => item.id.toString());
    expect(result).toEqual([
      { id: 1, value: "a" },
      { id: 2, value: "b" },
    ]);
  });
});

describe("generatedTetrominoHandler", () => {
  it("should generate tetromino coordinates correctly", () => {
    const position = [0, 0];
    const shapeInfo: ShapeInfo = {
      shape: [
        [1, 0],
        [1, 1],
      ],
      leftOffset: 0,
      rightOffset: 0,
      topOffset: 0,
      bottomOffset: 0,
    };

    const randomTetromino = "T";
    const result = generatedTetrominoHandler(
      position,
      shapeInfo,
      randomTetromino
    );
    expect(result).toEqual([
      [0, 1, "T"],
      [1, 1, "T"],
      [1, 2, "T"],
    ]);
  });

  it("should return an empty array if the shape is empty", () => {
    const position = [0, 0];
    const shapeInfo = {
      shape: [],
      leftOffset: 0,
      rightOffset: 0,
      topOffset: 0,
      bottomOffset: 0,
    };
    const result = generatedTetrominoHandler(position, shapeInfo);
    expect(result).toEqual([]);
  });
});

describe("findLastIndex", () => {
  it("should return the last index of an item that matches the predicate", () => {
    const array = [1, 2, 3, 4, 3];
    const result = findLastIndex(array, (item) => item === 3);
    expect(result).toBe(4);
  });

  it("should return -1 if no item matches the predicate", () => {
    const array = [1, 2, 3, 4];
    const result = findLastIndex(array, (item) => item === 5);
    expect(result).toBe(-1);
  });
});
