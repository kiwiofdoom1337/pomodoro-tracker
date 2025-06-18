import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

function App() {
  return (
    <div className="center">
      <Timer />
    </div>
  );
}

function TimerDisplay({ timer }) {
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <h1 className="center timer-display" aria-label="Timer display">
      Timer: {formatTime(timer)}
    </h1>
  );
}

function TimerControls({
  isRunning,
  timer,
  startTimer,
  stopTimer,
  resetTimer,
  skipTime,
  mode,
}) {
  return (
    <div className="center timer-controls">
      <button
        onClick={startTimer}
        disabled={isRunning || timer === 0}
        aria-label="Start timer button"
      >
        Start
      </button>
      <button
        onClick={stopTimer}
        disabled={!isRunning}
        aria-label="Pause timer button"
      >
        Pause
      </button>
      <button onClick={resetTimer} aria-label="Reset timer button">
        Reset
      </button>
      <button
        onClick={skipTime}
        disabled={timer === 0}
        aria-label="Skip timer button"
      >
        {mode === "pomodoro" ? "Skip" : "Back to Work"}
      </button>
    </div>
  );
}

function ModeSelector({ mode, setPomodoroTime, setShortBreak, setLongBreak }) {
  return (
    <div className="center mode-selector">
      <button
        onClick={setPomodoroTime}
        disabled={mode === "pomodoro"}
        style={{
          opacity: mode === "pomodoro" ? 0.5 : 1,
          pointerEvents: mode === "pomodoro" ? "none" : "auto",
        }}
        aria-label="Pomodoro mode selection"
      >
        Pomodoro
      </button>
      <button
        onClick={setShortBreak}
        disabled={mode === "shortBreak"}
        style={{
          opacity: mode === "shortBreak" ? 0.5 : 1,
          pointerEvents: mode === "shortBreak" ? "none" : "auto",
        }}
        aria-label="Short break mode selection"
      >
        Short Break
      </button>
      <button
        onClick={setLongBreak}
        disabled={mode === "longBreak"}
        style={{
          opacity: mode === "longBreak" ? 0.5 : 1,
          pointerEvents: mode === "longBreak" ? "none" : "auto",
        }}
        aria-label="Long break mode selection"
      >
        Long Break
      </button>
    </div>
  );
}

function Settings({
  workInput,
  setWorkInput,
  shortBreakInput,
  setShortBreakInput,
  longBreakInput,
  setLongBreakInput,
  saveTime,
  saveStatus,
}) {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const soundCheck = () => {
    const ring = new Audio("/bell.mp3");
    ring.play().catch((error) => {
      console.error("Audio failed to play:", error);
      alert("Sound failed to play. Check your browser settings.");
    });
  };
  return (
    <div className="settings-menu">
      <button
        className="settings-btn"
        onClick={() => setSettingsVisible(!settingsVisible)}
        aria-label="Settings menu toggle button"
      >
        Settings
      </button>
      <div className={`settings ${settingsVisible ? "" : "hidden"}`}>
        <div className="settings-line">
          <div>Work time (minutes): </div>
          <div>
            <input
              type="number"
              value={workInput}
              onChange={(e) => setWorkInput(e.target.value)}
              aria-label="Input work time in minutes"
            ></input>
            <button
              className="save-btn"
              onClick={() => saveTime(workInput, "pomodoro")}
              aria-label="Save inputted work time in minutes"
            >
              Save
            </button>
          </div>
        </div>
        <div>
          <div className="settings-line">
            <div>Short break time (minutes): </div>
            <div>
              <input
                type="number"
                value={shortBreakInput}
                onChange={(e) => setShortBreakInput(e.target.value)}
                aria-label="Input short break time in minutes"
              ></input>
              <button
                className="save-btn"
                onClick={() => saveTime(shortBreakInput, "shortBreak")}
                aria-label="Save inputted short break time"
              >
                Save
              </button>
            </div>
          </div>
        </div>
        <div>
          <div className="settings-line">
            <div>Long break time (minutes): </div>
            <div>
              <input
                type="number"
                value={longBreakInput}
                onChange={(e) => setLongBreakInput(e.target.value)}
                aria-label="Input long break time in minutes"
              ></input>
              <button
                className="save-btn"
                onClick={() => saveTime(longBreakInput, "longBreak")}
                aria-label="Save inputted long break time"
              >
                Save
              </button>
            </div>
          </div>
        </div>
        <div className="sound-test">
          <div>
            <label htmlFor="soundCheck">Sound on timer finish</label>
            <input
              id="soundCheck"
              type="checkbox"
              name="sound"
              aria-label="Toggle sound"
            ></input>
          </div>
          <button onClick={soundCheck} aria-label="Test sound button">
            🔊 Test Sound
          </button>
        </div>
      </div>

      <div id="saveStatus" style={{ color: saveStatus.color }}>
        {saveStatus.message}
      </div>
    </div>
  );
}

function Timer() {
  const [defaultWorkTime, setDefaultWorkTime] = useState(1500);
  const [defaultShortBreakTime, setDefaultShortBreakTime] = useState(300);
  const [defaultLongBreakTime, setDefaultLongBreakTime] = useState(900);
  const [timer, setTimer] = useState(defaultWorkTime);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const [mode, setMode] = useState("pomodoro");
  const [sessionCount, setSessionCount] = useState(0);
  const [workInput, setWorkInput] = useState(defaultWorkTime / 60);
  const [shortBreakInput, setShortBreakInput] = useState(
    defaultShortBreakTime / 60
  );
  const [longBreakInput, setLongBreakInput] = useState(
    defaultLongBreakTime / 60
  );
  const [saveStatus, setSaveStatus] = useState({ message: "", color: "" });

  useEffect(() => {
    const savedWork = Number(localStorage.getItem("pomodoro") || 1500);
    const savedShortBreak = Number(localStorage.getItem("shortBreak") || 300);
    const savedLongBreak = Number(localStorage.getItem("longBreak") || 900);

    setDefaultWorkTime(savedWork);
    setDefaultShortBreakTime(savedShortBreak);
    setDefaultLongBreakTime(savedLongBreak);

    setWorkInput(savedWork / 60);
    setShortBreakInput(savedShortBreak / 60);
    setLongBreakInput(savedLongBreak / 60);

    setTimer(savedWork);
  }, []);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev > 0) {
            return prev - 1;
          } else {
            if (document.getElementById("soundCheck").checked) {
              const ring = new Audio("/bell.mp3");
              ring.play().catch((error) => {
                console.error("Audio failed to play:", error);
              });
            }

            clearInterval(timerRef.current);
            setIsRunning(false);
            handleTimerEnd();
            return 0;
          }
        });
      }, 1000);
    }
  };

  const handleTimerEnd = () => {
    if (mode === "pomodoro") {
      const nextSessionCount = sessionCount + 1;
      setSessionCount(nextSessionCount);
      if (nextSessionCount !== 0 && nextSessionCount % 4 === 0) {
        setTimer(defaultLongBreakTime);
        setMode("longBreak");
        return;
      } else {
        setTimer(defaultShortBreakTime);
        setMode("shortBreak");
      }
    } else {
      setTimer(defaultWorkTime);
      setMode("pomodoro");
    }
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const stopTimer = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
  };

  const resetTimer = () => {
    stopTimer();
    if (mode === "pomodoro") {
      setTimer(defaultWorkTime);
    } else if (mode === "shortBreak") {
      setTimer(defaultShortBreakTime);
    } else if (mode === "longBreak") {
      setTimer(defaultLongBreakTime);
    }
  };

  const setPomodoroTime = () => {
    stopTimer();
    setTimer(defaultWorkTime);
    setMode("pomodoro");
  };

  const setShortBreak = () => {
    stopTimer();
    setTimer(defaultShortBreakTime);
    setMode("shortBreak");
  };

  const setLongBreak = () => {
    stopTimer();
    setTimer(defaultLongBreakTime);
    setMode("longBreak");
  };

  const skipTime = () => {
    stopTimer();
    if (mode === "pomodoro" && sessionCount !== 0 && sessionCount % 4 === 3) {
      setSessionCount((n) => n + 1);
      setMode("longBreak");
      setTimer(defaultLongBreakTime);
    } else if (mode === "pomodoro") {
      setSessionCount((n) => n + 1);
      setMode("shortBreak");
      setTimer(defaultShortBreakTime);
    } else {
      setMode("pomodoro");
      setTimer(defaultWorkTime);
    }
  };

  const saveTime = (input, modeName) => {
    if (!input || input <= 0) {
      setSaveStatus({
        message: "Please enter a valid number!",
        color: "red",
      });
      return;
    }
    const newTime = input * 60;
    if (modeName === "pomodoro") {
      setDefaultWorkTime(newTime);
      if (mode === "pomodoro") setTimer(newTime);
    } else if (modeName === "shortBreak") {
      setDefaultShortBreakTime(newTime);
      if (mode === "shortBreak") setTimer(newTime);
    } else if (modeName === "longBreak") {
      setDefaultLongBreakTime(newTime);
      if (mode === "longBreak") setTimer(newTime);
    }

    localStorage.setItem(modeName, newTime);

    setSaveStatus({
      message: `${modeName} time updated to ${input} minutes!`,
      color: "white",
    });
  };

  return (
    <div>
      <ModeSelector
        mode={mode}
        setPomodoroTime={setPomodoroTime}
        setShortBreak={setShortBreak}
        setLongBreak={setLongBreak}
      />
      <TimerDisplay timer={timer} />
      <TimerControls
        isRunning={isRunning}
        timer={timer}
        startTimer={startTimer}
        stopTimer={stopTimer}
        resetTimer={resetTimer}
        skipTime={skipTime}
        mode={mode}
      />
      <span className="center" aria-label="Session count number">
        Session count: {sessionCount}
      </span>
      <Settings
        workInput={workInput}
        setWorkInput={setWorkInput}
        shortBreakInput={shortBreakInput}
        setShortBreakInput={setShortBreakInput}
        longBreakInput={longBreakInput}
        setLongBreakInput={setLongBreakInput}
        saveTime={saveTime}
        saveStatus={saveStatus}
      />
    </div>
  );
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
