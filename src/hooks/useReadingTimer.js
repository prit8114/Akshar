/**
 * useReadingTimer Hook
 * Captures per-word reading latency
 */

import { useState, useCallback } from 'react';

export function useReadingTimer() {
  const [startTime, setStartTime] = useState(null);
  const [wordTimings, setWordTimings] = useState([]);

  const startTimer = useCallback(() => {
    setStartTime(Date.now());
  }, []);

  const stopTimer = useCallback(() => {
    if (startTime) {
      const latency = Date.now() - startTime;
      return latency;
    }
    return 0;
  }, [startTime]);

  const recordWord = useCallback(
    (wordData) => {
      const latency = stopTimer();
      setWordTimings((prev) => [
        ...prev,
        {
          ...wordData,
          latency,
          timestamp: Date.now(),
        },
      ]);
      setStartTime(Date.now()); // Reset for next word
    },
    [stopTimer]
  );

  const resetTimer = useCallback(() => {
    setStartTime(null);
    setWordTimings([]);
  }, []);

  const getStats = useCallback(() => {
    if (wordTimings.length === 0) {
      return {
        meanLatency: 0,
        minLatency: 0,
        maxLatency: 0,
        accuracy: 0,
      };
    }

    const latencies = wordTimings.map((w) => w.latency);
    const correctCount = wordTimings.filter((w) => w.correct).length;

    return {
      meanLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      minLatency: Math.min(...latencies),
      maxLatency: Math.max(...latencies),
      accuracy: correctCount / wordTimings.length,
      totalWords: wordTimings.length,
    };
  }, [wordTimings]);

  return {
    startTimer,
    stopTimer,
    recordWord,
    resetTimer,
    getStats,
    wordTimings,
  };
}
