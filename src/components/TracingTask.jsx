/**
 * TracingTask Component
 * Canvas-based letter tracing UI
 * Captures stroke paths for analysis
 */

import React, { useRef, useState, useEffect } from 'react';
import { useTracingCapture } from '../hooks/useTracingCapture';

export function TracingTask({
  letter,
  onComplete,
  onSkip,
  taskIndex,
  totalTasks,
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const {
    startCapture,
    endCapture,
    resetCapture,
    capturedData,
  } = useTracingCapture();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw faint letter guide
    ctx.fillStyle = '#e0e0e0';
    ctx.font = 'bold 120px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, canvas.width / 2, canvas.height / 2);
  }, [letter]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    startCapture({ x, y });

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#0066cc';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    endCapture();
  };

  const handleComplete = () => {
    onComplete({
      letter,
      tracingData: capturedData,
    });
    resetCapture();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw guide
    ctx.fillStyle = '#e0e0e0';
    ctx.font = 'bold 120px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, canvas.width / 2, canvas.height / 2);

    resetCapture();
  };

  return (
    <div className="tracing-task-screen">
      <div className="progress">
        <span className="task-counter">
          Task {taskIndex + 1} of {totalTasks}
        </span>
        <ProgressBar current={taskIndex + 1} total={totalTasks} />
      </div>

      <div className="task-container">
        <h2>Trace the letter / અક્ષર ટ્રેસ કરો</h2>
        <div className="letter-display">{letter}</div>

        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="tracing-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        <div className="button-group">
          <button onClick={handleClear} className="btn-secondary">
            Clear
          </button>
          <button onClick={handleComplete} className="btn-primary">
            Done
          </button>
          <button onClick={onSkip} className="btn-secondary">
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
