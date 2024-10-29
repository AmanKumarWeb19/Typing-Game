import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const TypingGame = () => {
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [time, setTime] = useState(60);
  const [results, setResults] = useState(null);
  const [typingStartTime, setTypingStartTime] = useState(null);

  const errorSoundRef = useRef(null);
  const inputRef = useRef(null);

  const fetchRandomText = async () => {
    try {
      const response = await fetch(
        "https://random-word-api.herokuapp.com/word?number=20"
      );
      const data = await response.json();
      setText(data.join(" "));
    } catch (error) {
      console.error("Failed to fetch random text:", error);
      setText("Failed to load random text. Please try again.");
    }
  };

  const handleStart = () => {
    setIsTestStarted(true);
    setUserInput("");
    setTime(60);
    setResults(null);
    fetchRandomText();
    setTypingStartTime(Date.now());
    inputRef.current.focus();
  };

  const handleFinish = () => {
    setIsTestStarted(false);
    calculateResults();
  };

  const calculateResults = () => {
    const words = userInput.trim().split(/\s+/).length;
    const timeTaken = (Date.now() - typingStartTime) / 1000;
    const wpm = Math.round((words / timeTaken) * 60);

    // Calculate accuracy, correct characters, and incorrect characters
    let correctChars = 0;
    let incorrectChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === text[i]) {
        correctChars++;
      } else {
        incorrectChars++;
      }
    }
    incorrectChars += text.length - userInput.length;

    const accuracy = Math.round((correctChars / text.length) * 100);

    setResults({ wpm, accuracy, correctChars, incorrectChars });
  };

  useEffect(() => {
    if (isTestStarted && time > 0) {
      const timer = setInterval(() => setTime(time - 1), 1000);
      return () => clearInterval(timer);
    } else if (time === 0) {
      handleFinish();
    }
  }, [time, isTestStarted]);

  const playErrorSound = () => {
    if (errorSoundRef.current) {
      errorSoundRef.current.play();
    }
  };

  const handleUserInput = (e) => {
    const value = e.target.value;

    // Play error sound if incorrect character
    if (
      value.length > 0 &&
      value[value.length - 1] !== text[value.length - 1]
    ) {
      playErrorSound();
    }

    setUserInput(value);
  };

  const handleReset = () => {
    handleStart();
    setResults(null);
  };

  const renderTextWithColor = () => {
    return text.split("").map((char, index) => {
      let color = "text-gray-500";
      if (userInput[index] === char) {
        color = "text-green-600";
      } else if (userInput[index] !== undefined) {
        color = "text-red-600";
      }
      return (
        <span key={index} className={`${color} font-mono`}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gray-100">
      <h1
        className="text-4xl font-bold   
 mb-6"
      >
        Typing Speed Test
      </h1>
      <div className="text-xl font-semibold text-gray-700 mb-4">{`Time Left: ${time}s`}</div>
      <div className="flex flex-col items-center mt-4 w-full max-w-2xl">
        <p className="text-lg mb-4 text-gray-600">{renderTextWithColor()}</p>
        <textarea
          value={userInput}
          onChange={handleUserInput}
          disabled={!isTestStarted}
          className="p-4 border border-gray-300 rounded-lg w-full h-32 focus:outline-none focus:border-blue-500"
          placeholder="Start typing..."
          ref={inputRef}
        />
      </div>
      {results && (
        <div className="bg-gray-100 p-4 rounded-lg shadow-md mt-10 w-[48%]">
          <h2 className="text-2xl font-bold text-center mb-4">Results</h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <p className="text-lg font-bold text-gray-700">
                Words Per Minute:
              </p>
              <p className="text-lg font-bold text-purple-700">
                {results.wpm} WPM
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-lg font-bold text-gray-700">Accuracy:</p>
              <p className="text-lg font-bold text-purple-700">
                {results.accuracy}%
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-lg font-bold text-gray-700">
                Correct Characters:
              </p>
              <p className="text-lg font-bold text-green-700">
                {results.correctChars}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-lg font-bold text-gray-700">
                Incorrect Characters:
              </p>
              <p className="text-lg font-bold text-red-700">
                {results.incorrectChars}
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-around gap-4 mt-6 w-[50%]">
        <button
          onClick={isTestStarted ? handleFinish : handleStart}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
        >
          {isTestStarted ? "Finish" : "Start Test"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
        >
          Reset Test
        </button>
      </div>
      {/* Hidden audio element for error sound */}
      console.log(errorSoundRef);
      <audio ref={errorSoundRef} src="./assets/error.mp3" preload="auto" />
    </div>
  );
};

export default TypingGame;
