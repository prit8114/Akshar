/**
 * ProgressBar Component
 * Visual indicator of task progression
 */

import React from 'react';

export function ProgressBar({ current, total }) {
  const percentage = (current / total) * 100;

  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="progress-text">
        {current} / {total}
      </span>
    </div>
  );
}
