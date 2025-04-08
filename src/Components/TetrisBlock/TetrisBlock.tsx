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
  const styles = { colour, tetrisCoordX, tetrisCoordY };

  const InnerBlockComponents = [
    InnerBlockTopStyles,
    InnerBlockLeftStyles,
    InnerBlockRightStyles,
    InnerBlockBottomStyles,
  ];

  return (
    <>
      {animation ? (
        <AnimationStyles {...styles} />
      ) : border ? (
        <BorderStyles {...styles} />
      ) : (
        <BlockStyles {...styles}>
          {InnerBlockComponents.map((Component, index) => (
            <Component key={index} colour={colour} />
          ))}
        </BlockStyles>
      )}
    </>
  );
};

export default TetrisBlock;
