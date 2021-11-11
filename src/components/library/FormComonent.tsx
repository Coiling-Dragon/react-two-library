import React, { useState } from "react";
import { FormGroup, Input } from "./SFormFields";
import Button from "../Button";
import Loader from "../Loader";

interface ILTokensGroup {
  id: string;
  btnText: string;
  inpitFieldType: any;
  isFetching: boolean;
  onTransactHandler: (input: string) => void;
  children?: JSX.Element;
}

const FormComonent = (props: ILTokensGroup) => {
  const [userInput, setUserInput] = useState("");

  const inputHandler = (event: any) => {
    setUserInput(event?.target.value);
  };

  const onTransactHandler = async () => {
    if (userInput === "") {
      alert("Set value to approve");
      return;
    }
    props.onTransactHandler(userInput);
    setUserInput("");
  };

  return (
    <>
      <FormGroup>
        {props.children}
        <Input
          id={props.id}
          onChange={inputHandler}
          value={userInput}
          type={props.inpitFieldType}
        />
        {props.isFetching ? (
          <Loader />
        ) : (
          <Button onClick={onTransactHandler} type="button">
            {props.btnText}
          </Button>
        )}
      </FormGroup>
      
    </>
  );
};

export default FormComonent;
