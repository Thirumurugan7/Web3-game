import React from "react";
import { useState } from "react";
import { PageHOC, CustomInput, CustomButton } from "../components";
import { useGlobalContext } from "../context";

const Home = () => {
  const { contract, walletAddress, setShowAlert } = useGlobalContext();
  const [playerName, setPlayerName] = useState("");

  const handleClick = async () => {
    try {
      console.log("entered");
      console.log({ contract });
      const playerExist = await contract.isPlayer(walletAddress);

      if (!playerExist) {
        await contract.registerPlayer(playerName, playerName);

        setShowAlert({
          status: "true",
          type: "info",
          message: `${playerName} is being summoned!`,
        });
      }
    } catch (error) {
      alert(error);
    }
  };

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
