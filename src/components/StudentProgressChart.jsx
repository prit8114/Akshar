/**
 * StudentProgressChart.jsx
 * Phase 3: Visual charts for student progress over time
 */

import React from 'react';

export function StudentProgressChart({ assessments }) {
  if (!assessments || assessments.length === 0) {
    return <div className="chart-empty">No data available</div>;
  }

  // Sort by timestamp (oldest first for chart)
  const sortedAssessments = [...assessments].reverse();

  const tracingScores = sortedAssessments.map(
    (a) => (a.tracingScore?.score || 0) * 100
  );
  const readingScores = sortedAssessments.map(
    (a) => (a.readingScore?.score || 0) * 100
  );
  const riskScores = sortedAssessments.map(
    (a) => (a.riskAssessment?.riskScore || 0) * 100
  );

  const maxScore = Math.max(...tracingScores, ...readingScores, ...riskScores);
  const chartHeight = 300;

  const getY = (value) => chartHeight - (value / 100) * chartHeight;

  // Generate SVG chart
  const points = sortedAssessments.map((_, i) => {
    const x = (i / (sortedAssessments.length - 1 || 1)) * 400;
    return x;
  });

  const tracingPath = tracingScores
    .map((score, i) => `${points[i]},${getY(score)}`)
    .join(' L ');
  const readingPath = readingScores
    .map((score, i) => `${points[i]},${getY(score)}`)
    .join(' L ');
  const riskPath = riskScores
    .map((score, i) => `${points[i]},${getY(score)}`)
    .join(' L ');

  return (
    <div className="progress-chart">
      <h3>📈 Performance Chart</h3>

      <svg width="500" height={chartHeight + 40} className="chart-svg">
        {/* Y-axis labels */}
        <text x="10" y={chartHeight + 10} fontSize="12" fill="#666">
          0%
        </text>
        <text x="10" y={chartHeight / 2 + 5} fontSize="12" fill="#666">
          50%
        </text>
        <text x="10" y={15} fontSize="12" fill="#666">
          100%
        </text>

        {/* Grid lines */}
        <line
          x1="30"
          y1={chartHeight}
          x2="450"
          y2={chartHeight}
          stroke="#e0e0e0"
          strokeWidth="1"
        />
        <line
          x1="30"
          y1={chartHeight / 2}
          x2="450"
          y2={chartHeight / 2}
          stroke="#e0e0e0"
          strokeWidth="1"
          strokeDasharray="5,5"
        />

        {/* Tracing line */}
        <polyline
          points={tracingPath}
          fill="none"
          stroke="#0066cc"
          strokeWidth="2"
          style={{ transform: `translate(30, 0)` }}
        />

        {/* Reading line */}
        <polyline
          points={readingPath}
          fill="none"
          stroke="#28a745"
          strokeWidth="2"
          style={{ transform: `translate(30, 0)` }}
        />

        {/* Risk line */}
        <polyline
          points={riskPath}
          fill="none"
          stroke="#dc3545"
          strokeWidth="2"
          style={{ transform: `translate(30, 0)` }}
        />

        {/* Data points for tracing */}
        {tracingScores.map((score, i) => (
          <circle
            key={`tracing-${i}`}
            cx={points[i] + 30}
            cy={getY(score)}
            r="4"
            fill="#0066cc"
          />
        ))}

        {/* Data points for reading */}
        {readingScores.map((score, i) => (
          <circle
            key={`reading-${i}`}
            cx={points[i] + 30}
            cy={getY(score)}
            r="4"
            fill="#28a745"
          />
        ))}

        {/* Data points for risk */}
        {riskScores.map((score, i) => (
          <circle
            key={`risk-${i}`}
            cx={points[i] + 30}
            cy={getY(score)}
            r="4"
            fill="#dc3545"
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#0066cc' }}></span>
          <span>Tracing Performance</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#28a745' }}></span>
          <span>Reading Fluency</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#dc3545' }}></span>
          <span>Risk Score</span>
        </div>
      </div>
    </div>
  );
}
