import React from "react";
import ReactDOM from "react-dom";

// @ts-ignore
import classes from "./Modal.module.css"

interface IModalOverlay {
    children?: JSX.Element;
}

interface IModal extends IModalOverlay{
    onClick?: () => void;
}


const ModalOverlay = (props:IModalOverlay) => {
  return (
    <div className={classes.modal}>
      <div className={classes.content}>{props.children}</div>
    </div>
  );
};

const Modal = (props:IModal) => {
  return (
    <>
      {ReactDOM.createPortal(
        <div className={classes.backdrop} onClick={props.onClick}/>,
        // @ts-ignore
        document.getElementById("backdrop-root")
      )}
      {ReactDOM.createPortal(
        <ModalOverlay>{props.children}</ModalOverlay>,
        // @ts-ignore
        document.getElementById("modal-root")
      )}
    </>
  );
};


export default Modal