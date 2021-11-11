import React, { useState, useEffect } from "react";
import FormComonent from "./FormComonent";
import Button from "../Button";
import AddBookForm, { IAddBookState } from "./AddBookForm";

// import { BigNumber } from "@ethersproject/bignumber";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { TypedDataEncoder } from "@ethersproject/hash/lib/typed-data";
const utils = ethers.utils;

interface ILibrary {
  connected: boolean;
  library: any;
  address: string;
  BOOK_LIBRARY_ADDRESS: string;
  tokenContract: any;
  libraryContract: any;
}

interface IFormState {
  fetching: boolean;
  allowance: string;
  isFetchingAllowance: boolean;
  isAddingBook: boolean;
  isBorrowingBook: boolean;
  isReturningBook: boolean;
  toggleAddBooks: boolean;
  owner: string;
  isOwner: boolean;
}
const Library = (props: ILibrary) => {
  const [formState, setFormState] = useState<IFormState>({
    fetching: false,
    allowance: "",
    isFetchingAllowance: false,
    isAddingBook: false,
    isBorrowingBook: false,
    isReturningBook: false,
    toggleAddBooks: false,
    owner: "",
    isOwner: false,
  });

  const getAllowenceForUser = async () => {
    let allowance = await props.tokenContract.allowance(
      props.address,
      props.BOOK_LIBRARY_ADDRESS
    );
    allowance = formatEther(allowance);
    setFormState((state) => ({
      ...state,
      allowance,
      isFetchingAllowance: false,
    }));
  };

  const getOwnerAddress = async () => {
    const owner = await props.libraryContract.owner();

    let isOwner = false;
    if (owner.toLowerCase() === props.address.toLowerCase()) {
      isOwner = true;
    }

    setFormState((state) => ({
      ...state,
      owner,
      isOwner,
    }));
  };

  useEffect(() => {
    setFormState((state) => ({
      ...state,
      isFetchingAllowance: true,
    }));

    // tslint:disable-next-line:no-console
    // console.log("use effect allowance");

    if (props.connected) {
      getAllowenceForUser().catch((error) => {
        alert(error);
      });

      getOwnerAddress().catch((error) => {
        alert(error);
      });
    }
  }, [props.address]);

  const onToggleAddBookHandler = () => {
    setFormState((state) => ({
      ...state,
      toggleAddBooks: !state.toggleAddBooks,
    }));
  };

  const onAddBookHandler = async (data: IAddBookState) => {
    setFormState((state) => ({
      ...state,
      isAddingBook: true,
    }));

    const tx = await props.libraryContract.addBook(
      parseEther(data.price),
      data.copies,
      data.title
    );
    const txReceipt = await tx.wait();
    if (txReceipt.status !== 1) {
      alert("Transaction failed");
    }

    setFormState((state) => ({
      ...state,
      isAddingBook: false,
    }));
  };

  const onReturnHandler = async (data: string) => {
    setFormState((state) => ({
      ...state,
      isReturningBook: true,
    }));

    const txBookInUserCheck = await props.libraryContract.addressHasBook(
      props.address,
      +data
    );
    const BookInUser = txBookInUserCheck[0];
    if (!BookInUser) {
      alert("User does not have this book");
      setFormState((state) => ({
        ...state,
        isReturningBook: false,
      }));
      return;
    }

    const txReturn = await props.libraryContract.returnBook(+data);
    const txReturnReceipt = await txReturn.wait();
    if (txReturnReceipt.status !== 1) {
      alert("Transaction failed");
    }else{
      alert("Success")
    }

    setFormState((state) => ({
      ...state,
      isReturningBook: false,
    }));
  };

  const approveHandler = async (value: string) => {
    setFormState((state) => ({
      ...state,
      isFetchingAllowance: true,
    }));

    const transact = await props.tokenContract.approve(
      props.BOOK_LIBRARY_ADDRESS,
      parseEther(value)
    );
    const transactReceipt = await transact.wait();
    if (transactReceipt.status !== 1) {
      alert("Approval failed");
    }

    getAllowenceForUser().catch((error) => {
      alert(error);
    });

    setFormState((state) => ({
      ...state,
      isFetchingAllowance: false,
    }));
  };

  const onAttemptToApprove = async () => {
    const { tokenContract, address, library } = props;

    const nonce = await tokenContract.nonces(address); // Our Token Contract Nonces
    const deadline = +new Date() + 60 * 60; // Permit with deadline which the permit is valid
    const wrapValue = utils.parseEther("0.1"); // Value to approve for the spender to use

    const EIP712Domain = [
      // array of objects -> properties from the contract and the types of them ircwithPermit
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "verifyingContract", type: "address" },
    ];

    const domain = {
      name: await tokenContract.name(),
      version: "1",
      verifyingContract: tokenContract.address,
    };

    // tslint:disable-next-line:no-console
    console.log("domain:", domain);

    const Permit = [
      // array of objects -> properties from erc20withpermit
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ];

    const message = {
      owner: address,
      spender: props.BOOK_LIBRARY_ADDRESS,
      value: wrapValue.toString(),
      nonce: nonce.toHexString(),
      deadline,
    };

    const types = {
      EIP712Domain,
      Permit,
    }

    // tslint:disable-next-line:no-console
    console.log("message:", message);

    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: "Permit",
      message,
    });

    const signatureLike = await library.send("eth_signTypedData_v4", [
      address,
      data,
    ]);

    const lookAtPayload = TypedDataEncoder.getPayload(domain, types, message)
    // tslint:disable-next-line:no-console
    console.log("lookAtPayload:", lookAtPayload);


    const signature = utils.splitSignature(signatureLike);

    const preparedSignature = {
      v: signature.v,
      r: signature.r,
      s: signature.s,
      deadline,
    };

    return preparedSignature;
  };

  // done
  const onBorrowHandler = async (data: string) => {
    const { libraryContract } = props;

    setFormState((state) => ({
      ...state,
      isBorrowingBook: true,
    }));

    const preparedSignature = await onAttemptToApprove();

    // tslint:disable-next-line:no-console
    console.log("preparedSignature", preparedSignature);

    try {
      const transact = await libraryContract.borrowBook(
        +data,
        parseEther("0.1"),
        preparedSignature.deadline,
        preparedSignature.v,
        preparedSignature.r,
        preparedSignature.s
      );
      const transactReceipt = await transact.wait();
      if (transactReceipt.status !== 1) {
        alert("Approval failed");
      }
    } catch {
      alert("Book allready burrowed");
    }

    setFormState((state) => ({
      ...state,
      isBorrowingBook: false,
    }));
  };

  return (
    <div>
      {!formState.isOwner ? (
        <span>Only owner can add Books</span>
      ) : (
        <div>
          <p>As owner you can add books</p>
          <Button onClick={onToggleAddBookHandler}>Add Book</Button>
        </div>
      )}
      {formState.toggleAddBooks && (
        <AddBookForm
          isFetching={formState.isAddingBook}
          onToggleAddBookHandler={onToggleAddBookHandler}
          onAddBookHandler={onAddBookHandler}
        />
      )}
      <FormComonent
        id={"token-group"}
        btnText={"Set Allowance"}
        inpitFieldType="number"
        isFetching={formState.isFetchingAllowance}
        onTransactHandler={approveHandler}
      >
        <p>
          {formState.isFetchingAllowance
            ? " Fetching allowence"
            : `Your account is allowed to spend ${formState.allowance} libra tokens on books`}
        </p>
      </FormComonent>
      <FormComonent
        id={"boroww-group"}
        btnText={"Borrow Book"}
        inpitFieldType="number"
        isFetching={formState.isBorrowingBook}
        onTransactHandler={onBorrowHandler}
      >
        <p>Book borrowing with permit</p>
      </FormComonent>

      <FormComonent
        id={"return-group"}
        btnText={"Return Book"}
        inpitFieldType="number"
        isFetching={formState.isReturningBook}
        onTransactHandler={onReturnHandler}
      >
        <p>Return book</p>
      </FormComonent>
      <p> maybe show available books</p>
      <p> maybe show borrowed books</p>
    </div>
  );
};

export default Library;
