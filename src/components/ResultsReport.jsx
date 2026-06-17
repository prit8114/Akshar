/**
 * ResultsReport Component
 * Displays dyslexia risk assessment for parent/teacher
 * Shows detailed breakdown and recommendations
 */

import React from 'react';

export function ResultsReport({ assessment, onExport, onRestart }) {
  if (!assessment) {
    return <div>No assessment data</div>;
  }

  const { riskAssessment, tracingScore, readingScore, script } = assessment;

  const getRiskColor = (level) => {
    switch (level) {
      case 'LOW':
        return '#28a745';
      case 'MODERATE':
        return '#ffc107';
      case 'HIGH':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className="results-report-screen">
      <div className="report-container">
        <h1>Assessment Results / આકારણીના પરિણામો</h1>

        {/* Risk Summary */}
        <div className="risk-summary" style={{ borderColor: getRiskColor(riskAssessment.overallRisk) }}>
          <div className="risk-level" style={{ color: getRiskColor(riskAssessment.overallRisk) }}>
            {riskAssessment.overallRisk}
          </div>
          <p className="risk-description">{riskAssessment.description}</p>
        </div>

        {/* Risk Score */}
        <div className="score-section">
          <h3>Overall Risk Score</h3>
          <div className="score-bar">
            <div
              className="score-fill"
              style={{
                width: `${riskAssessment.riskScore * 100}%`,
                backgroundColor: getRiskColor(riskAssessment.overallRisk),
              }}
            />
          </div>
          <p className="score-value">{(riskAssessment.riskScore * 100).toFixed(1)}%</p>
        </div>

        {/* Component Scores */}
        <div className="component-scores">
          <div className="score-card">
            <h4>Tracing Performance</h4>
            <div className="score-value">
              {(tracingScore?.score * 100 || 0).toFixed(1)}%
            </div>
            <p className="score-level">{tracingScore?.level}</p>
          </div>

          <div className="score-card">
            <h4>Reading Fluency</h4>
            <div className="score-value">
              {(readingScore?.score * 100 || 0).toFixed(1)}%
            </div>
            <p className="score-level">{readingScore?.level}</p>
          </div>
        </div>

        {/* Areas of Concern */}
        {riskAssessment.concerns?.length > 0 && (
          <div className="concerns-section">
            <h3>Areas of Concern</h3>
            <ul>
              {riskAssessment.concerns.map((concern, idx) => (
                <li key={idx}>{concern}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        <div className="recommendations-section">
          <h3>Recommendations</h3>
          <ul>
            {riskAssessment.recommendations?.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="button-group">
          <button onClick={onExport} className="btn-primary">
            Export Report
          </button>
          <button onClick={onRestart} className="btn-secondary">
            Start New Assessment
          </button>
        </div>

        <p className="disclaimer">
          This assessment is a screening tool. For professional diagnosis,
          please consult a qualified dyslexia specialist or educational
          psychologist.
        </p>
      </div>
    </div>
  );
}
