import { ethers, providers } from "ethers";

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
  setUpdateGameData,
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

  const NewBattleEventFilter = contract.filters.NewBattle();

  AddNewEvent(NewBattleEventFilter, provider, ({ args }) => {
    console.log("new battle started!", args, walletAddress);
    if (
      walletAddress.toLowerCase() === args.player1.toLowerCase() ||
      walletAddress.toLowerCase() === args.player2.toLowerCase()
    ) {
      navigate(`/battle/${args.battleName}`);

      setUpdateGameData((prevUpdateGameData) => prevUpdateGameData + 1);
    }
  });

  const BattleMoveEventFilter = contract.filter.BattleMove();
  AddNewEvent(BattleMoveEventFilter, provider, ({ args }) => {
    console.log("battle move initiated", args);
  });
};
