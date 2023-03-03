import { ethers } from "ethers";

import { ABI } from "../contract";
//here cb is callback function
const AddNewEvent = (eventFilter, provider, cb) => {
  provider.removeListener(eventFilter); //not have multiple listeners for the same event

  provider.on(eventFilter, (logs) => {
    const parsedLog = new ethers.utils.Interface(ABI).parseLog(logs);
    cb(parsedLog);
  });
};

export const createEventListener = ({
  navigate,
  contract,
  provider,
  walletAddress,
  setShowAlert,
}) => {
  //here newplayer is a event for creating a new player
  //refer solidity contract
  const NewPlayerEventFilter = contract.filters.NewPlayer();
  AddNewEvent(NewPlayerEventFilter, provider, ({ args }) => {
    console.log("New Player created!", args);

    if (walletAddress === args.owner) {
      setShowAlert({
        status: true,
        type: "success",
        message: "Player has been created Successfully",
      });
    }
  });
};
