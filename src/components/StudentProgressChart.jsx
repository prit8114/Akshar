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
        <text x="10" y={chartHeight + 10} fontSize="12" fill="var(--muted)">
          0%
        </text>
        <text x="10" y={chartHeight / 2 + 5} fontSize="12" fill="var(--muted)">
          50%
        </text>
        <text x="10" y={15} fontSize="12" fill="var(--muted)">
          100%
        </text>

        {/* Grid lines */}
        <line
          x1="30"
          y1={chartHeight}
          x2="450"
          y2={chartHeight}
          stroke="var(--border-solid)"
          strokeWidth="1"
        />
        <line
          x1="30"
          y1={chartHeight / 2}
          x2="450"
          y2={chartHeight / 2}
          stroke="var(--border-solid)"
          strokeWidth="1"
          strokeDasharray="5,5"
        />

        {/* Tracing line */}
        <polyline
          points={tracingPath}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          style={{ transform: `translate(30, 0)` }}
        />

        {/* Reading line */}
        <polyline
          points={readingPath}
          fill="none"
          stroke="var(--risk-low)"
          strokeWidth="2"
          style={{ transform: `translate(30, 0)` }}
        />

        {/* Risk line */}
        <polyline
          points={riskPath}
          fill="none"
          stroke="var(--risk-high)"
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
            fill="var(--primary)"
          />
        ))}

        {/* Data points for reading */}
        {readingScores.map((score, i) => (
          <circle
            key={`reading-${i}`}
            cx={points[i] + 30}
            cy={getY(score)}
            r="4"
            fill="var(--risk-low)"
          />
        ))}

        {/* Data points for risk */}
        {riskScores.map((score, i) => (
          <circle
            key={`risk-${i}`}
            cx={points[i] + 30}
            cy={getY(score)}
            r="4"
            fill="var(--risk-high)"
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'var(--primary)' }}></span>
          <span>Tracing Performance</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'var(--risk-low)' }}></span>
          <span>Reading Fluency</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'var(--risk-high)' }}></span>
          <span>Risk Score</span>
        </div>
      </div>
    </div>
  );
}
