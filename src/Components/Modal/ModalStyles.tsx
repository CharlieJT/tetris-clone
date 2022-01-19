import styled from "styled-components";

export type ModalProps = {
  initial?: boolean;
};

const ModalStyles = styled.div.attrs<ModalProps>(({ initial }) => ({
  style: {
    backgroundColor: !initial && "#fff",
    opacity: !initial && 0.7,
  },
}))<ModalProps>`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 2;
`;

const ModalTextStyles = styled.div.attrs<ModalProps>(({ initial }) => ({
  style: {
    color: initial ? "#fff" : "#000",
    padding: initial ? "3vmin" : "0",
  },
}))<ModalProps>`
  font-size: 4vmin;
  font-weight: 700;
  color: white;
  text-align: center;
`;

export { ModalStyles, ModalTextStyles };
