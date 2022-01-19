import { ModalStyles, ModalTextStyles } from "./ModalStyles";

type ModalProps = {
  text: string;
  initial?: boolean;
};

const Modal: React.FC<ModalProps> = ({
  text,
  initial = false,
}): React.ReactElement => (
  <ModalStyles initial={initial}>
    <ModalTextStyles initial={initial}>{text}</ModalTextStyles>
  </ModalStyles>
);

export default Modal;
