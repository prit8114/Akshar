/**
 * PerformanceAnalytics.jsx
 * Phase 3: Analyze child's performance trends and generate insights
 */

import React, { useState, useEffect } from 'react';
import { calculatePerformanceTrend, getStudentAssessments } from '../db/assessmentDB';

export function PerformanceAnalytics({ studentId }) {
  const [trend, setTrend] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performanceTrend = calculatePerformanceTrend(studentId);
    const studentAssessments = getStudentAssessments(studentId);

    setTrend(performanceTrend);
    setAssessments(studentAssessments);
    setLoading(false);
  }, [studentId]);

  if (loading) {
    return <div className="analytics-loading">Loading performance data...</div>;
  }

  if (!trend) {
    return (
      <div className="analytics-empty">
        <p>No assessments found for this student</p>
      </div>
    );
  }

  const getImprovementColor = (improvement) => {
    if (improvement > 0.1) return '#28a745'; // Green - good improvement
    if (improvement > 0) return '#ffc107'; // Yellow - slight improvement
    return '#dc3545'; // Red - declining
  };

  const renderTrendIndicator = (value, label) => {
    const isPositive = value > 0;
    return (
      <div className="trend-item">
        <span className="trend-label">{label}</span>
        <span
          className="trend-value"
          style={{ color: getImprovementColor(value) }}
        >
          {isPositive ? '+' : ''}
          {(value * 100).toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <div className="performance-analytics">
      <h2>📊 Performance Analysis</h2>

      {/* Overview Stats */}
      <div className="analytics-overview">
        <div className="stat-card">
          <h3>Total Assessments</h3>
          <div className="stat-value">{trend.totalAssessments}</div>
        </div>

        <div className="stat-card">
          <h3>Current Risk Level</h3>
          <div
            className="stat-value"
            style={{
              color:
                trend.latestAssessment?.riskAssessment?.overallRisk ===
                'LOW'
                  ? '#28a745'
                  : trend.latestAssessment?.riskAssessment?.overallRisk ===
                      'MODERATE'
                    ? '#ffc107'
                    : '#dc3545',
            }}
          >
            {trend.latestAssessment?.riskAssessment?.overallRisk}
          </div>
        </div>

        <div className="stat-card">
          <h3>Latest Score</h3>
          <div className="stat-value">
            {(trend.latestAssessment?.riskAssessment?.riskScore * 100).toFixed(
              1
            )}
            %
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="analytics-section">
        <h3>📈 Performance Trends</h3>

        <div className="trends-container">
          <div className="trend-category">
            <h4>Letter Tracing</h4>
            <div className="trend-metrics">
              <p className="metric">
                Current: {(trend.tracingTrend.current * 100).toFixed(1)}%
              </p>
              <p className="metric">
                Average: {(trend.tracingTrend.average * 100).toFixed(1)}%
              </p>
              {renderTrendIndicator(
                trend.tracingTrend.improvement,
                'Improvement'
              )}
            </div>
          </div>

          <div className="trend-category">
            <h4>Reading Fluency</h4>
            <div className="trend-metrics">
              <p className="metric">
                Current: {(trend.readingTrend.current * 100).toFixed(1)}%
              </p>
              <p className="metric">
                Average: {(trend.readingTrend.average * 100).toFixed(1)}%
              </p>
              {renderTrendIndicator(
                trend.readingTrend.improvement,
                'Improvement'
              )}
            </div>
          </div>

          <div className="trend-category">
            <h4>Overall Risk</h4>
            <div className="trend-metrics">
              <p className="metric">
                Current: {(trend.riskTrend.current * 100).toFixed(1)}%
              </p>
              <p className="metric">
                Average: {(trend.riskTrend.average * 100).toFixed(1)}%
              </p>
              {renderTrendIndicator(
                trend.riskTrend.improvement,
                'Improvement (Lower is Better)'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="analytics-section">
        <h3>📅 Assessment Timeline</h3>
        <div className="timeline">
          {assessments.map((assessment, index) => (
            <div key={assessment.id} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-date">
                  {new Date(assessment.timestamp).toLocaleDateString()}
                </span>
                <span className="timeline-risk">
                  Risk:{' '}
                  <strong>
                    {assessment.riskAssessment?.overallRisk ||
                      'Unknown'}
                  </strong>
                </span>
                <span className="timeline-score">
                  {(assessment.riskAssessment?.riskScore * 100).toFixed(1)}%
                </span>
                {index === 0 && (
                  <span className="timeline-badge">Latest</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="analytics-section insights">
        <h3>💡 Insights & Recommendations</h3>
        {trend.latestAssessment?.riskAssessment?.recommendations && (
          <ul className="insights-list">
            {trend.latestAssessment.riskAssessment.recommendations.map(
              (rec, idx) => (
                <li key={idx}>{rec}</li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
