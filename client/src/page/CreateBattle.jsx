import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import styles from "../styles";

import { useGlobalContext } from "../context";
import { PageHOC, CustomButton, CustomInput, GameLoad } from "../components";
const CreateBattle = () => {
  const { contract, battleName, setBattleName, gameData, setErrorMessage } =
    useGlobalContext();
  const [waitBattle, setWaitBattle] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (gameData?.activeBattle?.battleName === 1) {
      navigate(`/battle/${gameData.activeBattle.name}`);
    }
    if (gameData?.activeBattle?.battleStatus === 0) {
      setWaitBattle(true);
    }
  }, [gameData]);

  const handleClick = async () => {
    if (!battleName || !battleName.trim()) return null;
    //contract call
    try {
      await contract.createBattle(battleName, { gasLimit: 200000 });
      setWaitBattle(true);
    } catch (error) {
      setErrorMessage(error);
    }
  };
  return (
    <>
      {waitBattle && <GameLoad />}
      <div className="flex flex-col mb-5">
        <CustomInput
          label="Battle"
          placeholder="Enter battle name"
          value={battleName}
          handleValueChange={setBattleName}
        />

        <CustomButton
          title="Create Battle"
          handleClick={handleClick}
          restStyles="mt-6"
        />
      </div>
      <p
        className={styles.infoText}
        onClick={() => {
          navigate("/join-battle");
        }}
      >
        Or join already existing Battle
      </p>
    </>
  );
};

export default PageHOC(
  CreateBattle,
  <>
    Create
    <br /> a new battle
  </>,
  <>Create your own battle and wait for other players to join</>
);
