import React from "react";
import styles from "../styles";
const ActionButton = ({ imgUrl, handleClick, restStyles }) => {
  return (
    <div
      className={`${styles.gameMoveBox} ${styles.flexCenter} ${styles.glassEffect} ${restStyles}`}
      onClick={handleClick}
    >
      <img src={imgUrl} alt="Action_Image" className={styles.gameMoveIcon} />
    </div>
  );
};

export default ActionButton;
