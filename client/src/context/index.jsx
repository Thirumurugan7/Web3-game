import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { ethers } from "ethers";

import Web3Modal from "web3modal";
import { ABI, ADDRESS } from "../contract";
import { createEventListener } from "./createEventListener";
import { GetParams } from "../utils/onboard";
const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [provider, setProvider] = useState("");
  const [contract, setContract] = useState("");
  const [battleName, setBattleName] = useState("");
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "info",
    message: "",
  });
  const [gameData, setGameData] = useState({
    players: [],
    pendingBattles: [],
    activeBattle: null,
  });
  const [updateGameData, setUpdateGameData] = useState(0);
  const [battleGround, setBattleGround] = useState("bg-astral");
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    const battleGroundFromLocalStorage = localStorage.getItem("battleground");

    if (battleGroundFromLocalStorage) {
      setBattleGround(battleGroundFromLocalStorage);
    } else {
      localStorage.setItem("battleground", battleGround);
    }
  });

  //* Rest web3 onboarding modal process
  useEffect(() => {
    const resetParams = async () => {
      const currentStep = await GetParams();
      setStep(currentStep.step);
    };
    resetParams();

    window?.ethereum?.on("chainChanged", () => resetParams());
    window?.ethereum?.on("accountsChanged", () => resetParams());
  });
  //*Set the wallet address to the state

  const updateCurrentWalletAddress = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    if (accounts) setWalletAddress(accounts[0]);
  };

  useEffect(() => {
    //to connect wallet
    updateCurrentWalletAddress();

    window.ethereum.on("accountsChanged", updateCurrentWalletAddress);
  }, []);

  //set the smart contract and the provider to the state

  useEffect(() => {
    const setSmartContractAndProvider = async () => {
      console.log("entered the problem");

      const web3Modal = new Web3Modal();

      const connection = await web3Modal.connect();

      const newProvider = new ethers.providers.Web3Provider(connection);

      const signer = newProvider.getSigner();

      const newContract = new ethers.Contract(ADDRESS, ABI, signer);

      setProvider(newProvider);
      setContract(newContract);
    };
    setSmartContractAndProvider();
    // setSmartContractAndProvider();
  }, []);

  useEffect(() => {
    if (step !== -1 && contract) {
      createEventListener({
        navigate,
        contract,
        provider,
        walletAddress,
        setShowAlert,

        setUpdateGameData,
      });
    }
  }, [contract, step]);

  // * Set the game data to the state
  useEffect(() => {
    const fetchGameData = async () => {
      const fetchedBattles = await contract.getAllBattles();
      console.log(fetchedBattles);
      //filtering the pending battles
      const pendingBattles = fetchedBattles.filter(
        (battle) => battle.battleStatus === 0
      );
      let activeBattle = null;

      fetchedBattles.forEach((battle) => {
        if (
          battle.players.find(
            (player) => player.toLowerCase() === walletAddress.toLowerCase()
          )
        ) {
          if (battle.winner.startsWith("0x00")) {
            activeBattle = battle;
          }
        }
      });
      setGameData({ pendingBattles: pendingBattles.slice(1), activeBattle });
    };

    if (contract) fetchGameData();
  }, [contract, updateGameData]);

  useEffect(() => {
    if (showAlert?.status) {
      const timer = setTimeout(() => {
        setShowAlert({ status: false, type: "info", message: "" });
      }, [5000]);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  //* handle error messages
  // the parsing line - slice the string by leaving thr specified "execution reverted"
  useEffect(() => {
    if (errorMessage) {
      const parsedMessage = errorMessage?.reason
        ?.slice("execution reverted: ".length)
        .slice(0, -1);
      if (parsedMessage) {
        setShowAlert({
          status: true,
          type: "failure",
          message: parsedMessage,
        });
      }
    }
  }, [errorMessage]);
  return (
    <GlobalContext.Provider
      value={{
        contract,
        walletAddress,
        showAlert,
        setShowAlert,
        battleName,
        setBattleName,
        gameData,
        battleGround,
        setBattleGround,
        errorMessage,
        setErrorMessage,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
