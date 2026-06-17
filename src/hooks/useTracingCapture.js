/**
 * useTracingCapture Hook
 * Captures stroke path, re-attempts, and duration for tracing task
 */

import { useState, useCallback } from 'react';

export function useTracingCapture() {
  const [tracingData, setTracingData] = useState({
    strokes: [],
    startTime: null,
    endTime: null,
    reattempts: 0,
    confidence: 0,
  });

  const startCapture = useCallback(
    (point) => {
      if (!tracingData.startTime) {
        setTracingData((prev) => ({
          ...prev,
          startTime: Date.now(),
          strokes: [{ points: [point] }],
        }));
      } else {
        // New stroke (pen-up, pen-down)
        setTracingData((prev) => ({
          ...prev,
          strokes: [...prev.strokes, { points: [point] }],
          reattempts: prev.reattempts + 1,
        }));
      }
    },
    [tracingData.startTime]
  );

  const endCapture = useCallback(
    (point) => {
      setTracingData((prev) => {
        const lastStroke = prev.strokes[prev.strokes.length - 1];
        if (lastStroke) {
          lastStroke.points.push(point);
        }
        return {
          ...prev,
          endTime: Date.now(),
        };
      });
    },
    []
  );

  const resetCapture = useCallback(() => {
    setTracingData({
      strokes: [],
      startTime: null,
      endTime: null,
      reattempts: 0,
      confidence: 0,
    });
  }, []);

  const capturedData = {
    strokePath: tracingData.strokes,
    duration: tracingData.endTime - (tracingData.startTime || 0),
    reattempts: tracingData.reattempts,
    confidence: calculateConfidence(tracingData.strokes),
  };

  return {
    startCapture,
    endCapture,
    resetCapture,
    capturedData,
  };
}

/**
 * Calculate confidence based on stroke smoothness and consistency
 */
function calculateConfidence(strokes) {
  if (strokes.length === 0) return 0;

  // Simplified confidence: fewer strokes = higher confidence
  const strokeCount = strokes.length;
  const baseConfidence = Math.max(0, 1 - strokeCount * 0.1);

  // Bonus for longer strokes (steadier hand)
  const avgStrokeLength = strokes.reduce((sum, stroke) => {
    return sum + stroke.points.length;
  }, 0) / strokeCount;

  const lengthBonus = Math.min(0.2, (avgStrokeLength - 10) / 100);

  return Math.min(1, baseConfidence + lengthBonus);
}
