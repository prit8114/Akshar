/**
 * ReadingTask Component
 * Word display + timing capture UI
 * Measures reading latency and accuracy
 */

import React, { useState, useEffect } from 'react';
import { useReadingTimer } from '../hooks/useReadingTimer';
import { ProgressBar } from './ProgressBar';

export function ReadingTask({
  words,
  onComplete,
  onSkip,
  taskIndex,
  totalTasks,
}) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [readingData, setReadingData] = useState([]);
  const { startTimer, stopTimer, recordWord } = useReadingTimer();

  useEffect(() => {
    startTimer();
  }, [currentWordIndex, startTimer]);

  const currentWord = words[currentWordIndex];

  const handleCorrect = () => {
    const timing = stopTimer();
    recordWord({
      word: currentWord.marked,
      latency: timing,
      correct: true,
    });

    const newData = [
      ...readingData,
      {
        word: currentWord.marked,
        latency: timing,
        correct: true,
      },
    ];
    setReadingData(newData);

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      onComplete(newData);
    }
  };

  const handleIncorrect = () => {
    const timing = stopTimer();
    recordWord({
      word: currentWord.marked,
      latency: timing,
      correct: false,
    });

    const newData = [
      ...readingData,
      {
        word: currentWord.marked,
        latency: timing,
        correct: false,
      },
    ];
    setReadingData(newData);

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      onComplete(newData);
    }
  };

  return (
    <div className="reading-task-screen">
      <div className="progress">
        <span className="task-counter">
          Word {currentWordIndex + 1} of {words.length}
        </span>
        <ProgressBar current={currentWordIndex + 1} total={words.length} />
      </div>

      <div className="task-container">
        <h2>Read the word / શબ્દ વાંચો</h2>

        <div className="word-display">{currentWord?.marked}</div>

        <div className="button-group">
          <button onClick={handleCorrect} className="btn-success">
            I read it correctly ✓
          </button>
          <button onClick={handleIncorrect} className="btn-warning">
            I had trouble ✗
          </button>
          <button onClick={onSkip} className="btn-secondary">
            Skip
          </button>
        </div>

        <div className="progress-info">
          <p>Completed: {readingData.length} words</p>
        </div>
      </div>
    </div>
  );
}
