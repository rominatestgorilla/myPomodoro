import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PomodoroTimer.css';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [points, setPoints] = useState(120);
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playNotificationSound = () => {
    if (audioContextRef.current) {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContextRef.current.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContextRef.current.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.5);
    }
  };

  const handleTimerComplete = useCallback(() => {
    setIsActive(false);
    playNotificationSound();
    
    if (!isBreak) {
      setCompletedPomodoros(prev => prev + 1);
      setPoints(prev => prev + 25); // Add points for completed pomodoro
      setIsBreak(true);
      setTimeLeft(5 * 60); // 5 minute break
    } else {
      setIsBreak(false);
      setTimeLeft(25 * 60); // 25 minute work session
    }
  }, [isBreak]);

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft, handleTimerComplete]);

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = isBreak ? 5 * 60 : 25 * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const CuteTomato = () => (
    <div className="cute-tomato">
      <div className="tomato-body">
        <div className="tomato-leaves">
          <div className="leaf leaf-1"></div>
          <div className="leaf leaf-2"></div>
          <div className="leaf leaf-3"></div>
        </div>
        <div className="tomato-face">
          <div className="eye eye-left"></div>
          <div className="eye eye-right"></div>
          <div className="mouth"></div>
        </div>
        <div className="tomato-highlight"></div>
      </div>
      <div className="tomato-shadow"></div>
    </div>
  );

  return (
    <div className="pomodoro-container">
      <div className="timer-card">
        <div className="points-badge">
          <span className="points-label">Points</span>
          <span className="points-value">{points}</span>
        </div>
        
        <div className="timer-display">
          <div className="progress-ring">
            <svg className="progress-ring-svg" width="260" height="260">
              <circle
                className="progress-ring-circle-bg"
                stroke="#e8e8e8"
                strokeWidth="12"
                fill="transparent"
                r="118"
                cx="130"
                cy="130"
              />
              <circle
                className="progress-ring-circle"
                stroke={isBreak ? "#4ecdc4" : "#ff6b6b"}
                strokeWidth="12"
                fill="transparent"
                r="118"
                cx="130"
                cy="130"
                style={{
                  strokeDasharray: `${2 * Math.PI * 118}`,
                  strokeDashoffset: `${2 * Math.PI * 118 * (1 - getProgress() / 100)}`,
                  transition: 'stroke-dashoffset 1s ease-in-out'
                }}
              />
            </svg>
            <div className="timer-content">
              <CuteTomato />
            </div>
          </div>
        </div>

        <div className="time-display">
          {formatTime(timeLeft)}
        </div>

        <div className="controls">
          <button 
            className={`btn btn-start ${isActive ? 'btn-pause' : ''}`} 
            onClick={isActive ? pauseTimer : startTimer}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
        </div>

        <div className="settings-link">
          ⚙️ Settings
        </div>

        {/* Show completed pomodoros count */}
        {completedPomodoros > 0 && (
          <div className="completed-count">
            🍅 {completedPomodoros} completed today!
          </div>
        )}

        <div className="bottom-nav">
          <div className="nav-item active">
            <div className="nav-icon">📋</div>
            <div className="nav-label">timeline</div>
          </div>
          <div className="nav-item" onClick={resetTimer}>
            <div className="nav-icon">⏱️</div>
            <div className="nav-label">timer</div>
          </div>
          <div className="nav-item">
            <div className="nav-icon">🌱</div>
            <div className="nav-label">garden</div>
          </div>
          <div className="nav-item">
            <div className="nav-icon">🚫</div>
            <div className="nav-label">blacklist</div>
          </div>
          <div className="nav-item">
            <div className="nav-icon">📊</div>
            <div className="nav-label">usage</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer; 