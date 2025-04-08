export interface Tetrominoes {
  [key: string]: {
    orientations: {
      shape: (string | number)[][];
      topOffset: number;
      leftOffset: number;
      rightOffset: number;
      bottomOffset: number;
    }[][];
    colour: string;
  };
}

export type ShapeItem = (string | number)[];

export interface TetrominoInfo {
  intialShape: ShapeItem[];
  letter: string;
  colour: string;
}

export interface ShapeOffsets {
  topOffset: number;
  bottomOffset: number;
  leftOffset: number;
  rightOffset: number;
}

export interface ShapeInfo extends ShapeOffsets {
  shape: ShapeItem[];
}

export type TetrominoesBuilder = Record<
  string,
  { orientations: ShapeInfo[][]; colour: string }
>;

export type TetrisCoordProps = number[];
export type GridCoordStringProps = [number, number, string];
export type GridCoordsProps = TetrisCoordProps[];
export type FilterGeneratorItemProps = GridCoordStringProps[];
export type FilterGeneratorProps = FilterGeneratorItemProps[];
