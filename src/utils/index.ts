import { ShapeInfo, TetrisCoordProps } from "../interfaces";

export const filterUniqueItems = <ArrayType>(
  items: ArrayType[],
  keyExtractor?: (item: ArrayType) => string
): ArrayType[] => {
  const set = new Set<string>();
  return items.filter((item) => {
    const key = keyExtractor ? keyExtractor(item) : JSON.stringify(item);
    if (set.has(key)) return false;
    set.add(key);
    return true;
  });
};

export const generatedTetrominoHandler = (
  [positionX, positionY]: TetrisCoordProps,
  { shape, leftOffset, rightOffset }: ShapeInfo,
  randomTetromino?: string
) =>
  shape
    .map((row, i) =>
      (Array.isArray(row) ? (row as number[]) : []).map(
        (el: number, j: number) =>
          el !== 0
            ? [
                positionX + i + leftOffset,
                positionY + j + 1 + rightOffset,
                ...(randomTetromino ? [randomTetromino] : []),
              ]
            : false
      )
    )
    .reduce((arr, el) => arr.concat(el), [])
    .filter((el): el is TetrisCoordProps => el !== false);

export const findLastIndex = <Type>(
  array: Type[],
  predicate: (item: Type) => boolean
) => {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) return i;
  }
  return -1;
};
