import React, { useState } from "react";
import { FormGroup, Input } from "./SFormFields";
import Button from "../Button";
import Loader from "../Loader";
import Modal from "../UI/Modal";

import styled from "styled-components";

export interface IAddBookState {
  price: string;
  copies: number;
  title: string;
}

interface ILTokensGroup {
  isFetching: boolean;
  onToggleAddBookHandler: () => void;
  onAddBookHandler: (data: IAddBookState) => void;
}

const InitialAddBooksState: IAddBookState = {
  price: "0.1",
  copies: 1,
  title: "",
};

const SDiv = styled.div`
  display: -webkit-flex;
  display: flex;
  padding: 0;
  justify-content: flex-end;
`;

const FormComonent = (props: ILTokensGroup) => {
  const [userInputPrice, setUserInputPriece] = useState(
    InitialAddBooksState.price
  );
  const [userInputCopies, setUserInputCopies] = useState(
    InitialAddBooksState.copies
  );
  const [userInputTitle, setUserInputTitle] = useState(
    InitialAddBooksState.title
  );

 

  const inputPriceHandler = (event: any) => {
    setUserInputPriece(event.target.value);
  };

  const inputCopiesHandler = (event: any) => {
    setUserInputCopies(event.target.value);
  };

  const inputTitleHandler = (event: any) => {
    setUserInputTitle(event.target.value);
  };

  const onTransactHandler = async () => {
    if (
      +userInputCopies === 0 ||
      +userInputCopies === 0 ||
      userInputTitle === ""
    ) {
      alert("Set value to approve");
      return;
    }
    const AddBooksState: IAddBookState = {
      price: userInputPrice,
      copies: +userInputCopies,
      title: userInputTitle,
    };
    props.onAddBookHandler(AddBooksState);

    setUserInputPriece(InitialAddBooksState.price);
    setUserInputCopies(InitialAddBooksState.copies);
    setUserInputTitle(InitialAddBooksState.title);
  };

  const onToggleAddBookHandler = () => {
    props.onToggleAddBookHandler();
  };

  return (
    <Modal onClick={props.onToggleAddBookHandler}>
      <>
        {!props.isFetching && (
          <FormGroup>
            <h5>Book price</h5>
            <Input
              id="price"
              onChange={inputPriceHandler}
              value={userInputPrice}
              step="0.01"
              min="0"
              type="number"
            />
            <h5>Book copies</h5>
            <Input
              id="copies"
              onChange={inputCopiesHandler}
              value={userInputCopies}
              step="1"
              type="number"
              min="1"
            />
            <h5>Book title</h5>
            <Input
              id="title"
              onChange={inputTitleHandler}
              value={userInputTitle}
              type="text"
            />
          </FormGroup>
        )}
        <div>
          {props.isFetching && (
            <div>
              <Loader />
              <h5> Adding Book </h5>
            </div>
          )}
          <SDiv>
            {!props.isFetching && (
              <Button onClick={onTransactHandler} type="button">
                Add Book
              </Button>
            )}
            <Button onClick={onToggleAddBookHandler} type="button">
              Close
            </Button>
          </SDiv>
        </div>
      </>
    </Modal>
  );
};

export default FormComonent;
