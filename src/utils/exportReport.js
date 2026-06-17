/**
 * exportReport Utility
 * Formats and exports final report (JSON, print-friendly, PDF-ready)
 * PHASE 2: Tags samples for labeled dataset
 */

/**
 * Format assessment report for export
 * @param {object} assessment - full assessment result
 * @param {string} format - 'json', 'text', 'html'
 * @returns {string} formatted report
 */
export function formatReport(assessment, format = 'json') {
  const { riskAssessment, tracingScore, readingScore, script, timestamp } =
    assessment;

  const scriptName = script === 'gu' ? 'Gujarati' : 'Hindi';

  switch (format) {
    case 'json':
      return JSON.stringify(assessment, null, 2);

    case 'text':
      return formatTextReport(
        assessment,
        scriptName,
        timestamp
      );

    case 'html':
      return formatHtmlReport(
        assessment,
        scriptName,
        timestamp
      );

    case 'dataset':
      // PHASE 2: Export as dataset sample (for training pipeline)
      return JSON.stringify(tagSampleForDataset(assessment), null, 2);

    default:
      return JSON.stringify(assessment);
  }
}

/**
 * PHASE 2: Tag sample with metadata for labeled dataset
 * Prepares data for collect_labels.py
 * @param {object} assessment
 * @returns {object} tagged sample
 */
function tagSampleForDataset(assessment) {
  const {
    script,
    timestamp,
    tracingScore,
    readingScore,
    riskAssessment,
  } = assessment;

  // Generate unique sample ID
  const date = new Date(timestamp);
  const sampleId = `${script}_${date.getTime()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    sample_id: sampleId,
    script,
    timestamp,
    // Raw scores
    tracing_score: tracingScore?.score,
    tracing_reattempts: tracingScore?.reattempts,
    reading_score: readingScore?.score,
    reading_accuracy: readingScore?.accuracy,
    // Risk assessment
    predicted_risk: riskAssessment.overallRisk,
    risk_score: riskAssessment.riskScore,
    scoring_method: assessment.scoringMethod || 'heuristic',
    // Metadata for labeling
    ready_for_labeling: true,
    labeled: false,
    label_status: 'pending', // pending, labeled, confirmed
    // Fields to be filled by specialist/teacher
    specialist_label: null,
    specialist_confidence: null,
    specialist_notes: null,
    labeled_by: null,
    labeled_date: null,
  };
}

/**
 * PHASE 2: Batch export samples for training dataset
 * @param {array} assessments - array of assessment results
 * @returns {array} array of tagged samples
 */
export function exportDatasetSamples(assessments) {
  if (!Array.isArray(assessments)) {
    return [];
  }
  return assessments.map((assessment) =>
    tagSampleForDataset(assessment)
  );
}

/**
 * PHASE 2: Prepare sample for labeling interface
 * @param {object} sample - tagged sample
 * @returns {object} sample with UI hints
 */
export function prepareSampleForLabeling(sample) {
  return {
    ...sample,
    ui_hints: {
      display_predicted_risk: true,
      allow_override: true,
      confidence_required: true,
      notes_optional: false,
    },
  };
}

/**
 * Format as plain text report
 */
function formatTextReport(assessment, scriptName, timestamp) {
  const { riskAssessment, tracingScore, readingScore } = assessment;

  let report = `AKSHAR DYSLEXIA SCREENING REPORT\n`;
  report += `================================\n\n`;
  report += `Assessment Date: ${new Date(timestamp).toLocaleString()}\n`;
  report += `Language: ${scriptName}\n\n`;

  report += `OVERALL RISK LEVEL: ${riskAssessment.overallRisk}\n`;
  report += `Risk Score: ${(riskAssessment.riskScore * 100).toFixed(1)}%\n\n`;

  report += `ASSESSMENT DESCRIPTION:\n`;
  report += `${riskAssessment.description}\n\n`;

  report += `COMPONENT SCORES:\n`;
  report += `  Tracing Performance: ${(tracingScore?.score * 100 || 0).toFixed(1)}% (${tracingScore?.level})\n`;
  report += `  Reading Fluency: ${(readingScore?.score * 100 || 0).toFixed(1)}% (${readingScore?.level})\n\n`;

  if (riskAssessment.concerns?.length > 0) {
    report += `AREAS OF CONCERN:\n`;
    riskAssessment.concerns.forEach((concern) => {
      report += `  - ${concern}\n`;
    });
    report += `\n`;
  }

  report += `RECOMMENDATIONS:\n`;
  riskAssessment.recommendations?.forEach((rec) => {
    report += `  - ${rec}\n`;
  });

  report += `\n\nDISCLAIMER:\n`;
  report += `This is a screening tool and should not be used for professional diagnosis.\n`;
  report += `Consult a qualified dyslexia specialist for comprehensive assessment.\n`;

  return report;
}

/**
 * Format as HTML report
 */
function formatHtmlReport(assessment, scriptName, timestamp) {
  const { riskAssessment, tracingScore, readingScore } = assessment;

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

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Akshar Assessment Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .risk-section { 
      padding: 20px; 
      border: 3px solid ${getRiskColor(riskAssessment.overallRisk)}; 
      background-color: #f9f9f9;
      margin: 20px 0;
      border-radius: 8px;
    }
    .risk-level { font-size: 32px; font-weight: bold; color: ${getRiskColor(riskAssessment.overallRisk)}; }
    .score-card { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
    .score-value { font-size: 24px; font-weight: bold; }
    ul { margin: 10px 0; padding-left: 20px; }
    li { margin: 8px 0; }
    .disclaimer { font-size: 12px; color: #666; margin-top: 30px; padding: 15px; background-color: #f0f0f0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>AKSHAR DYSLEXIA SCREENING REPORT</h1>
    <p>Assessment Date: ${new Date(timestamp).toLocaleString()}</p>
    <p>Language: ${scriptName}</p>
  </div>

  <div class="risk-section">
    <div class="risk-level">${riskAssessment.overallRisk}</div>
    <p>Risk Score: <strong>${(riskAssessment.riskScore * 100).toFixed(1)}%</strong></p>
    <p>${riskAssessment.description}</p>
  </div>

  <h2>Component Scores</h2>
  <div class="score-card">
    <h3>Tracing Performance</h3>
    <div class="score-value">${(tracingScore?.score * 100 || 0).toFixed(1)}%</div>
    <p><em>${tracingScore?.level}</em></p>
  </div>
  <div class="score-card">
    <h3>Reading Fluency</h3>
    <div class="score-value">${(readingScore?.score * 100 || 0).toFixed(1)}%</div>
    <p><em>${readingScore?.level}</em></p>
  </div>

  ${
    riskAssessment.concerns?.length > 0
      ? `
  <h2>Areas of Concern</h2>
  <ul>
    ${riskAssessment.concerns.map((c) => `<li>${c}</li>`).join('')}
  </ul>
  `
      : ''
  }

  <h2>Recommendations</h2>
  <ul>
    ${riskAssessment.recommendations?.map((r) => `<li>${r}</li>`).join('')}
  </ul>

  <div class="disclaimer">
    <strong>DISCLAIMER:</strong> This is a screening tool and should not be used for professional diagnosis. 
    Consult a qualified dyslexia specialist for comprehensive assessment.
  </div>
</body>
</html>`;

  return html;
}

/**
 * Download report as file
 * @param {object} assessment
 * @param {string} filename
 * @param {string} format
 */
export function downloadReport(assessment, filename, format = 'json') {
  const content = formatReport(assessment, format);

  const element = document.createElement('a');
  const fileType =
    format === 'json'
      ? 'application/json'
      : format === 'html'
        ? 'text/html'
        : 'text/plain';

  element.setAttribute(
    'href',
    `data:${fileType};charset=utf-8,${encodeURIComponent(content)}`
  );
  element.setAttribute('download', filename);
  element.style.display = 'none';

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Print report (uses browser print dialog)
 * @param {object} assessment
 */
export function printReport(assessment) {
  const html = formatReport(assessment, 'html');
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}
