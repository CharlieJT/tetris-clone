import { ModalStyles, ModalTextStyles } from "./ModalStyles";

type ModalProps = {
  text: string;
  text2?: string;
  initial?: boolean;
};

const Modal = ({
  text,
  text2,
  initial = false,
}: ModalProps): React.ReactElement => (
  <ModalStyles initial={initial}>
    <ModalTextStyles initial={initial}>{text}</ModalTextStyles>
    {text2 && <ModalTextStyles initial={initial}>{text2}</ModalTextStyles>}
  </ModalStyles>
);

export default Modal;
