import { getOffsets, getShapeInfo, getTetrominoesHandler } from "./index";
import { TetrominoInfo, ShapeItem } from "../interfaces";

describe("getOffsets", () => {
  it("should calculate the correct offsets for a given shape and letter", () => {
    const shape: ShapeItem[] = [
      [0, 0, 0],
      ["T", "T", "T"],
      [0, "T", 0],
    ];
    const letter = "T";
    const result = getOffsets(shape, letter);

    expect(result).toEqual({
      topOffset: 1,
      bottomOffset: 0,
      leftOffset: 0,
      rightOffset: 0,
    });
  });

  it("should handle shapes with no matching letter", () => {
    const shape: ShapeItem[] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    const letter = "X";
    const result = getOffsets(shape, letter);

    expect(result).toEqual({
      topOffset: -1,
      bottomOffset: 3,
      leftOffset: Infinity,
      rightOffset: 3,
    });
  });
});

describe("getShapeInfo", () => {
  it("should return shape information with offsets", () => {
    const shape: ShapeItem[] = [
      [0, 0, 0],
      ["L", "L", "L"],
      ["L", 0, 0],
    ];
    const letter = "L";
    const result = getShapeInfo(shape, letter);

    expect(result).toEqual([
      {
        shape,
        topOffset: 1,
        bottomOffset: 0,
        leftOffset: 0,
        rightOffset: 0,
      },
    ]);
  });
});

describe("getTetrominoesHandler", () => {
  it("should generate tetrominoes with all orientations", () => {
    const tetrominoesInfo: TetrominoInfo[] = [
      {
        intialShape: [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        letter: "I",
        colour: "#0deff0",
      },
    ];

    const result = getTetrominoesHandler(tetrominoesInfo);

    expect(result).toStrictEqual({
      I: {
        colour: "#0deff0",
        orientations: [
          [
            {
              bottomOffset: 2,
              leftOffset: 0,
              rightOffset: 0,
              shape: [
                [0, 0, 0, 0],
                ["I", "I", "I", "I"],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
              ],
              topOffset: 1,
            },
          ],
          [
            {
              bottomOffset: 0,
              leftOffset: 2,
              rightOffset: 1,
              shape: [
                [0, 0, "I", 0],
                [0, 0, "I", 0],
                [0, 0, "I", 0],
                [0, 0, "I", 0],
              ],
              topOffset: 0,
            },
          ],
          [
            {
              bottomOffset: 1,
              leftOffset: 0,
              rightOffset: 0,
              shape: [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                ["I", "I", "I", "I"],
                [0, 0, 0, 0],
              ],
              topOffset: 2,
            },
          ],
          [
            {
              bottomOffset: 0,
              leftOffset: 1,
              rightOffset: 2,
              shape: [
                [0, "I", 0, 0],
                [0, "I", 0, 0],
                [0, "I", 0, 0],
                [0, "I", 0, 0],
              ],
              topOffset: 0,
            },
          ],
        ],
      },
    });
  });

  it("should handle an empty tetrominoesInfo array", () => {
    const tetrominoesInfo: TetrominoInfo[] = [];
    const result = getTetrominoesHandler(tetrominoesInfo);

    expect(result).toEqual({});
  });
});

describe("getTetrominoesHandler with multiple shapes", () => {
  it("should generate tetrominoes with all orientations", () => {
    const tetrominoesInfo: TetrominoInfo[] = [
      {
        intialShape: [0, 0, 0, 1, 1, 1, 0, 0, 1],
        letter: "J",
        colour: "#0034ef",
      },
      {
        intialShape: [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        letter: "I",
        colour: "#0deff0",
      },
      {
        intialShape: [0, 0, 0, 0, 1, 1, 1, 1, 0],
        letter: "S",
        colour: "#00f000",
      },
    ];

    const result = getTetrominoesHandler(tetrominoesInfo);

    expect(result).toStrictEqual({
      I: {
        colour: "#0deff0",
        orientations: [
          [
            {
              bottomOffset: 2,
              leftOffset: 0,
              rightOffset: 0,
              shape: [
                [0, 0, 0, 0],
                ["I", "I", "I", "I"],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
              ],
              topOffset: 1,
            },
          ],
          [
            {
              bottomOffset: 0,
              leftOffset: 2,
              rightOffset: 1,
              shape: [
                [0, 0, "I", 0],
                [0, 0, "I", 0],
                [0, 0, "I", 0],
                [0, 0, "I", 0],
              ],
              topOffset: 0,
            },
          ],
          [
            {
              bottomOffset: 1,
              leftOffset: 0,
              rightOffset: 0,
              shape: [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                ["I", "I", "I", "I"],
                [0, 0, 0, 0],
              ],
              topOffset: 2,
            },
          ],
          [
            {
              bottomOffset: 0,
              leftOffset: 1,
              rightOffset: 2,
              shape: [
                [0, "I", 0, 0],
                [0, "I", 0, 0],
                [0, "I", 0, 0],
                [0, "I", 0, 0],
              ],
              topOffset: 0,
            },
          ],
        ],
      },
      J: {
        colour: "#0034ef",
        orientations: [
          [
            {
              bottomOffset: 0,
              leftOffset: 0,
              rightOffset: 0,
              shape: [
                [0, 0, 0],
                ["J", "J", "J"],
                [0, 0, "J"],
              ],
              topOffset: 1,
            },
          ],
          [
            {
              bottomOffset: 0,
              leftOffset: 0,
              rightOffset: 1,
              shape: [
                [0, "J", 0],
                [0, "J", 0],
                ["J", "J", 0],
              ],
              topOffset: 0,
            },
          ],
          [
            {
              bottomOffset: 1,
              leftOffset: 0,
              rightOffset: 0,
              shape: [
                ["J", 0, 0],
                ["J", "J", "J"],
                [0, 0, 0],
              ],
              topOffset: 0,
            },
          ],
          [
            {
              bottomOffset: 0,
              leftOffset: 1,
              rightOffset: 0,
              shape: [
                [0, "J", "J"],
                [0, "J", 0],
                [0, "J", 0],
              ],
              topOffset: 0,
            },
          ],
        ],
      },
      S: {
        colour: "#00f000",
        orientations: [
          [
            {
              bottomOffset: 0,
              leftOffset: 0,
              rightOffset: 0,
              shape: [
                [0, 0, 0],
                [0, "S", "S"],
                ["S", "S", 0],
              ],
              topOffset: 1,
            },
          ],
          [
            {
              bottomOffset: 0,
              leftOffset: 0,
              rightOffset: 1,
              shape: [
                ["S", 0, 0],
                ["S", "S", 0],
                [0, "S", 0],
              ],
              topOffset: 0,
            },
          ],
          [
            {
              bottomOffset: 1,
              leftOffset: 0,
              rightOffset: 0,
              shape: [
                [0, "S", "S"],
                ["S", "S", 0],
                [0, 0, 0],
              ],
              topOffset: 0,
            },
          ],
          [
            {
              bottomOffset: 0,
              leftOffset: 1,
              rightOffset: 0,
              shape: [
                [0, "S", 0],
                [0, "S", "S"],
                [0, 0, "S"],
              ],
              topOffset: 0,
            },
          ],
        ],
      },
    });
  });
});
