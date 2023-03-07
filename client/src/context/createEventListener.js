import { ethers, providers } from "ethers";
import { defenseSound } from "../assets";

import { ABI } from "../contract";
import { playAudio, sparcle } from "../utils/animation";
import { defense } from "../assets";
const emptyAccount = "0x0000000000000000000000000000000000000000";

//here cb is callback function
const AddNewEvent = (eventFilter, provider, cb) => {
  provider.removeListener(eventFilter); //not have multiple listeners for the same event

  provider.on(eventFilter, (logs) => {
    const parsedLog = new ethers.utils.Interface(ABI).parseLog(logs);
    cb(parsedLog);
  });
};

const getCoords = (cardRef) => {
  const { left, top, width, height } = cardRef.current.getBoundingClientReact();

  return {
    pageX: left + width / 2,
    pageY: top + height / 2.25,
  };
};

export const createEventListener = ({
  navigate,
  contract,
  provider,
  walletAddress,
  setShowAlert,
  setUpdateGameData,
  player1Ref,
  player2Ref,
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

  const NewGameTokenFilter = contract.filters.NewGameToken();

  AddNewEvent(NewGameTokenFilter, provider, ({ args }) => {
    console.log("New game token created successfully", args);

    if (walletAddress.toLowerCase() === args.owner.toLowerCase()) {
      setShowAlert({
        status: true,
        type: "success",
        message: "Player game token has been created successfully!",
      });
      navigate("/create-battle");
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

  const BattleMoveEventFilter = contract.filters.BattleMove();
  AddNewEvent(BattleMoveEventFilter, provider, ({ args }) => {
    console.log("battle move initiated", args);
  });

  const RoundEndedEventFilter = contract.filters.RoundEnded();

  AddNewEvent(RoundEndedEventFilter, provider, ({ args }) => {
    console.log("round ended", args, walletAddress);

    for (let i = 0; i < args.damagedPlayer.length; i += 1) {
      if (args.damagedPlayers[i] !== emptyAccount) {
        if (args.damagedPlayers[i] === walletAddress) {
          sparcle(getCoords(player1Ref));
        } else if (args.damagedPlayers[i] !== walletAddress) {
          sparcle(getCoords(player2Ref));
        }
      } else {
        playAudio(defenseSound);
      }
    }
    setUpdateGameData((prevUpdateGameData) => prevUpdateGameData + 1);
  });

  const BattleEndedEventFilter = contract.filters.BattleEnded();

  AddNewEvent(BattleEndedEventFilter, provider, ({ args }) => {
    console.log("battle ended", args, walletAddress);

    if (walletAddress.toLowerCase() === args.winner.toLowerCase()) {
      setShowAlert({
        status: true,
        type: "success",
        message: "You won!",
      });
    } else if (walletAddress.toLowerCase() === args.loser.toLowerCase()) {
      setShowAlert({
        status: true,
        type: "failure",
        message: "You lost!",
      });
    }
    navigate("/create-battle");
  });
};
