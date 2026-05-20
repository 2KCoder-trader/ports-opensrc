import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { trefoil } from "ldrs";
import ParticlesComponent from "../Homepage/tsparticles";
import styles from "./loading.module.css";
import { deleteData as clearIndexedDB } from "../indexDB.js";
import {
  getPort,
  searchPublicPortIds,
  searchPersonalPortIds,
  getLeaderboards,
  getStocks
} from "../user.js";
import SecureStorage from "react-secure-storage";

trefoil.register();

const loadingMessages = [
  "Clearing Cache . . .",
  "Loading Public Ports . . .",
  "Loading Personal Ports . . .",
  "Loading Leaderboards . . .",
  "Loading Stocks . . .",
  "Almost there . . .",
];

const LoadingScreen = () => {
  const textRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const updateText = (message) => {
      if (textRef.current) {
        textRef.current.textContent = message;
      }
    };

    const loadAllData = async () => {
      try {
        updateText(loadingMessages[0]);
        await clearIndexedDB();

        updateText(loadingMessages[1]);
        const publicPortIds = await searchPublicPortIds("", "title", "asc", 0, null);
        console.log("Public Port IDs:", publicPortIds);
        for (const id of publicPortIds) {
          await getPort(id);
        }

        updateText(loadingMessages[2]);
        const personalPortIds = await searchPersonalPortIds("", "title", "asc", 0, null);
        for (const id of personalPortIds) {
          await getPort(id);
        }

        updateText(loadingMessages[3]);
        await getLeaderboards();

        updateText(loadingMessages[4]);
        await getStocks();

        updateText(loadingMessages[5]);
        SecureStorage.setItem("justLoggedIn", true); // Set the flag to indicate user just logged in
        setTimeout(() => navigate("/home"), 1000); // Give user a second to read the last message
      } catch (err) {
        console.error("Loading error:", err);
        updateText("Something went wrong. Please refresh.");
      }
    };

    loadAllData();
  }, [navigate]);

  return (
    <div className={styles.loadingContainer}>
      <ParticlesComponent />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className={styles.loadingContent}
      >
        <l-trefoil
          size="80"
          stroke="7"
          stroke-length="0.15"
          speed="2"
          color="#ffffff"
          class={styles.trefoil}
        ></l-trefoil>

        <motion.h1
          ref={textRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.text}
        >
          {loadingMessages[0]}
        </motion.h1>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
