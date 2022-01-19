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

const tetrominoes: any = {
  Z: {
    orientations: [
      [
        {
          shape: [
            [0, 0, 0],
            ["Z", "Z", 0],
            [0, "Z", "Z"],
          ],
          topOffset: 1,
          leftOffset: 0,
          rightOffset: 0,
          bottomOffset: 0,
        },
      ],
      [
        {
          shape: [
            [0, 0, "Z"],
            [0, "Z", "Z"],
            [0, "Z", 0],
          ],
          topOffset: 0,
          leftOffset: 1,
          rightOffset: 0,
          bottomOffset: 0,
        },
      ],
      [
        {
          shape: [
            ["Z", "Z", 0],
            [0, "Z", "Z"],
            [0, 0, 0],
          ],
          topOffset: 0,
          leftOffset: 0,
          rightOffset: 0,
          bottomOffset: 1,
        },
      ],
      [
        {
          shape: [
            [0, "Z", 0],
            ["Z", "Z", 0],
            ["Z", 0, 0],
          ],
          topOffset: 0,
          leftOffset: 0,
          rightOffset: 1,
          bottomOffset: 0,
        },
      ],
    ],
    colour: colours.red,
  },
  L: {
    orientations: [
      [
        {
          shape: [
            [0, 0, 0],
            ["L", "L", "L"],
            ["L", 0, 0],
          ],
          topOffset: 1,
          leftOffset: 0,
          rightOffset: 0,
          bottomOffset: 0,
        },
      ],
      [
        {
          shape: [
            ["L", "L", 0],
            [0, "L", 0],
            [0, "L", 0],
          ],
          topOffset: 0,
          leftOffset: 0,
          rightOffset: 1,
          bottomOffset: 0,
        },
      ],
      [
        {
          shape: [
            [0, 0, "L"],
            ["L", "L", "L"],
            [0, 0, 0],
          ],
          topOffset: 0,
          leftOffset: 0,
          rightOffset: 0,
          bottomOffset: 1,
        },
      ],
      [
        {
          shape: [
            [0, "L", 0],
            [0, "L", 0],
            [0, "L", "L"],
          ],
          topOffset: 0,
          leftOffset: 1,
          rightOffset: 0,
          bottomOffset: 0,
        },
      ],
    ],
    colour: colours.beige,
  },
  T: {
    orientations: [
      [
        {
          shape: [
            [0, 0, 0],
            ["T", "T", "T"],
            [0, "T", 0],
          ],
          topOffset: 1,
          leftOffset: 0,
          rightOffset: 0,
          bottomOffset: 0,
        },
      ],
      [
        {
          shape: [
            [0, "T", 0],
            ["T", "T", 0],
            [0, "T", 0],
          ],
          topOffset: 0,
          leftOffset: 0,
          rightOffset: 1,
          bottomOffset: 0,
        },
      ],
      [
        {
          shape: [
            [0, "T", 0],
            ["T", "T", "T"],
            [0, 0, 0],
          ],
          topOffset: 0,
          leftOffset: 0,
          rightOffset: 0,
          bottomOffset: 1,
        },
      ],
      [
        {
          shape: [
            [0, "T", 0],
            [0, "T", "T"],
            [0, "T", 0],
          ],
          topOffset: 0,
          leftOffset: 1,
          rightOffset: 0,
          bottomOffset: 0,
        },
      ],
    ],
    colour: colours.purple,
  },
  J: {
    orientations: [
      [
        {
          shape: [
            [0, 0, 0],
            ["J", "J", "J"],
            [0, 0, "J"],
          ],
          topOffset: 1,
          leftOffset: 0,
          rightOffset: 0,
          bottomOffset: 0,
        },
      ],
      [
        {
          shape: [
            [0, "J", 0],
            [0, "J", 0],
            ["J", "J", 0],
          ],
          topOffset: 0,
          leftOffset: 0,
          rightOffset: 1,
          bottomOffset: 0,
        },
      ],
      [
        {
          shape: [
            ["J", 0, 0],
            ["J", "J", "J"],
            [0, 0, 0],
          ],
          topOffset: 0,
          leftOffset: 0,
          rightOffset: 0,
          bottomOffset: 1,
        },
      ],
      [
        {
          shape: [
            [0, "J", "J"],
            [0, "J", 0],
            [0, "J", 0],
          ],
          topOffset: 0,
          leftOffset: 1,
          rightOffset: 0,
          bottomOffset: 0,
        },
      ],
    ],
    colour: colours.blue,
  },
  I: {
    orientations: [
      [
        {
          shape: [
            [0, 0, 0, 0],
            ["I", "I", "I", "I"],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ],
          topOffset: 1,
          leftOffset: 0,
          rightOffset: 0,
          bottomOffset: 2,
        },
      ],
      [
        {
          shape: [
            [0, 0, "I", 0],
            [0, 0, "I", 0],
            [0, 0, "I", 0],
            [0, 0, "I", 0],
          ],
          topOffset: 0,
          leftOffset: 2,
          rightOffset: 1,
          bottomOffset: 0,
        },
      ],
      [
        {
          shape: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            ["I", "I", "I", "I"],
            [0, 0, 0, 0],
          ],
          topOffset: 2,
          leftOffset: 0,
          rightOffset: 0,
          bottomOffset: 1,
        },
      ],
      [
        {
          shape: [
            [0, "I", 0, 0],
            [0, "I", 0, 0],
            [0, "I", 0, 0],
            [0, "I", 0, 0],
          ],
          topOffset: 0,
          leftOffset: 1,
          rightOffset: 2,
          bottomOffset: 0,
        },
      ],
    ],
    colour: colours.lightblue,
  },
  S: {
    orientations: [
      [
        {
          shape: [
            [0, 0, 0],
            [0, "S", "S"],
            ["S", "S", 0],
          ],
          topOffset: 1,
          leftOffset: 0,
          rightOffset: 0,
          bottomOffset: 0,
        },
      ],
      [
        {
          shape: [
            ["S", 0, 0],
            ["S", "S", 0],
            [0, "S", 0],
          ],
          topOffset: 0,
          leftOffset: 0,
          rightOffset: 1,
          bottomOffset: 0,
        },
      ],
      [
        {
          shape: [
            [0, "S", "S"],
            ["S", "S", 0],
            [0, 0, 0],
          ],
          topOffset: 0,
          leftOffset: 0,
          rightOffset: 0,
          bottomOffset: 1,
        },
      ],
      [
        {
          shape: [
            [0, "S", 0],
            [0, "S", "S"],
            [0, 0, "S"],
          ],
          topOffset: 0,
          leftOffset: 1,
          rightOffset: 0,
          bottomOffset: 0,
        },
      ],
    ],
    colour: colours.green,
  },
  O: {
    orientations: [
      [
        {
          shape: [
            ["O", "O"],
            ["O", "O"],
          ],
          topOffset: 0,
          leftOffset: 0,
          rightOffset: 0,
          bottomOffset: 0,
        },
      ],
      [
        {
          shape: [
            ["O", "O"],
            ["O", "O"],
          ],
          topOffset: 0,
          leftOffset: 0,
          rightOffset: 0,
          bottomOffset: 0,
        },
      ],
      [
        {
          shape: [
            ["O", "O"],
            ["O", "O"],
          ],
          topOffset: 0,
          leftOffset: 0,
          rightOffset: 0,
          bottomOffset: 0,
        },
      ],
      [
        {
          shape: [
            ["O", "O"],
            ["O", "O"],
          ],
          topOffset: 0,
          leftOffset: 0,
          rightOffset: 0,
          bottomOffset: 0,
        },
      ],
    ],
    colour: colours.yellow,
  },
};

export { framesPerGridCell, gamePoints, colours, tetrominoes };
