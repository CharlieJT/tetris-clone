import {
  BlockProps,
  BlockStyles,
  BorderStyles,
  AnimationStyles,
  InnerBlockTopStyles,
  InnerBlockLeftStyles,
  InnerBlockRightStyles,
  InnerBlockBottomStyles,
} from "./TetrisBlockStyles";

const TetrisBlock = ({
  colour,
  border,
  animation,
  tetrisCoordX,
  tetrisCoordY,
}: BlockProps): JSX.Element => {
  return (
    <>
      {animation ? (
        <AnimationStyles
          colour={colour}
          tetrisCoordX={tetrisCoordX}
          tetrisCoordY={tetrisCoordY}
        />
      ) : border ? (
        <BorderStyles
          colour={colour}
          tetrisCoordX={tetrisCoordX}
          tetrisCoordY={tetrisCoordY}
        />
      ) : (
        <BlockStyles
          colour={colour}
          tetrisCoordX={tetrisCoordX}
          tetrisCoordY={tetrisCoordY}
        >
          <InnerBlockTopStyles colour={colour} />
          <InnerBlockLeftStyles colour={colour} />
          <InnerBlockRightStyles colour={colour} />
          <InnerBlockBottomStyles colour={colour} />
        </BlockStyles>
      )}
    </>
  );
};

export default TetrisBlock;
