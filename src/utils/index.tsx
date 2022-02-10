import { GridCoordsProps, TetrisCoordProps, OffsetsProps } from "../App";

export const uniqueCoordsHandler = (
	items: GridCoordsProps,
	key: {
		(separator?: string | undefined): string;
		(separator?: string | undefined): string;
		apply?: any;
	},
): GridCoordsProps => {
	let set: any = {};
	return items.filter((item: TetrisCoordProps) => {
		let k = key ? key.apply(item) : item;
		return k in set ? false : (set[k] = true);
	});
};

export const generatedTetrominoHandler = (
	position: TetrisCoordProps,
	offsets: OffsetsProps,
) => {
	return offsets.shape
		.map(
			(row: TetrisCoordProps, i: number): GridCoordsProps =>
				row.map((el: number, j: number): any =>
					el !== 0
						? [
								position[0] + i + offsets.leftOffset,
								position[1] + j + 1 + offsets.rightOffset,
						  ]
						: false,
				),
		)
		.reduce((arr: GridCoordsProps, el: GridCoordsProps) => arr.concat(el), [])
		.filter((el: TetrisCoordProps): TetrisCoordProps => el);
};
