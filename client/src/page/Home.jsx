import React, { useEffect, useContext } from "react";
import { useState } from "react";
import { PageHOC, CustomInput, CustomButton } from "../components";
import { useGlobalContext } from "../context";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const { contract, walletAddress, setShowAlert, gameData, setErrorMessage } =
    useGlobalContext();
  const [playerName, setPlayerName] = useState("");
  const navigate = useNavigate();
  const handleClick = async () => {
    try {
      console.log("entered");
      console.log({ contract });
      const playerExist = await contract.isPlayer(walletAddress);

      if (!playerExist) {
        await contract.registerPlayer(playerName, playerName);

        setShowAlert({
          status: true,
          type: "info",
          message: `${playerName} is being summoned!`,
        });
      }
    } catch (error) {
      console.log(error, error.message);
      // setShowAlert({
      //   status: true,
      //   type: "failure",
      //   message: "Something went wrong!",
      // });
      //alert(error);

      setErrorMessage(error);
    }
  };

  useEffect(() => {
    const checkForPlayerToken = async () => {
      const playerExists = await contract.isPlayer(walletAddress);
      const playerTokenExists = await contract.isPlayerToken(walletAddress);
      console.log({ playerExists, playerTokenExists });
      if (playerExists && playerTokenExists) {
        navigate("/create-battle");
      }
    };

    if (contract) checkForPlayerToken();
  }, [contract]);

  useEffect(() => {
    if (gameData.activeBattle) {
      navigate(`/battle/${gameData.activeBattle.name}`);
    }
  }, [gameData]);

  return (
    <div className="flex flex-col">
      <CustomInput
        label="Name"
        placeholder="Enter your player name"
        value={playerName}
        handleValueChange={setPlayerName}
      />

      <CustomButton
        title="Register"
        handleClick={handleClick}
        restStyles="mt-6"
      />
    </div>
  );
};

export default PageHOC(
  Home,
  <>
    Welcome to Avax Gods <br /> a web3 NFT Card Game
  </>,
  <>
    Connect your wallet to start playing <br /> the ultimate web3 Battle Card
    Game
  </>
);
