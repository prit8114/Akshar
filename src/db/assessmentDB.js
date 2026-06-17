/**
 * assessmentDB.js
 * In-memory database for storing assessments (Phase 3)
 * In production, this would connect to a backend/database
 */

// Sample assessment history data
const assessmentDatabase = {
  students: new Map(),
};

/**
 * Store a new assessment for a student
 */
export function storeAssessment(studentId, assessment) {
  if (!assessmentDatabase.students.has(studentId)) {
    assessmentDatabase.students.set(studentId, {
      id: studentId,
      name: `Student ${studentId}`,
      createdAt: new Date().toISOString(),
      assessments: [],
    });
  }

  const student = assessmentDatabase.students.get(studentId);
  student.assessments.push({
    ...assessment,
    id: `${studentId}_${Date.now()}`,
    timestamp: new Date().toISOString(),
  });

  return assessment;
}

/**
 * Get all assessments for a student
 */
export function getStudentAssessments(studentId) {
  const student = assessmentDatabase.students.get(studentId);
  if (!student) return [];
  return student.assessments.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
}

/**
 * Get all students
 */
export function getAllStudents() {
  return Array.from(assessmentDatabase.students.values());
}

/**
 * Calculate student performance trend
 */
export function calculatePerformanceTrend(studentId) {
  const assessments = getStudentAssessments(studentId);
  if (assessments.length === 0) return null;

  const tracingScores = assessments.map((a) => a.tracingScore?.score || 0);
  const readingScores = assessments.map((a) => a.readingScore?.score || 0);
  const riskScores = assessments.map((a) => a.riskAssessment?.riskScore || 0);

  return {
    totalAssessments: assessments.length,
    latestAssessment: assessments[0],
    tracingTrend: {
      current: tracingScores[0],
      average: tracingScores.reduce((a, b) => a + b, 0) / tracingScores.length,
      improvement: tracingScores[0] - tracingScores[tracingScores.length - 1],
    },
    readingTrend: {
      current: readingScores[0],
      average: readingScores.reduce((a, b) => a + b, 0) / readingScores.length,
      improvement: readingScores[0] - readingScores[readingScores.length - 1],
    },
    riskTrend: {
      current: riskScores[0],
      average: riskScores.reduce((a, b) => a + b, 0) / riskScores.length,
      improvement: riskScores[riskScores.length - 1] - riskScores[0], // Lower is better
    },
  };
}

/**
 * Create demo data for testing
 */
export function createDemoData() {
  const demoAssessments = [
    {
      studentId: 'student_001',
      script: 'gu',
      tracingScore: { score: 0.65, level: 'needs_improvement', reattempts: 4 },
      readingScore: { score: 0.62, level: 'struggling', accuracy: 0.625 },
      riskAssessment: {
        overallRisk: 'MODERATE',
        riskScore: 0.58,
        description: 'Child shows some difficulty',
        concerns: ['Fine motor challenges', 'Reading fluency delays'],
        recommendations: ['Increase practice', 'Multi-sensory methods'],
      },
    },
    {
      studentId: 'student_001',
      script: 'gu',
      tracingScore: { score: 0.72, level: 'good', reattempts: 2 },
      readingScore: { score: 0.71, level: 'moderate', accuracy: 0.75 },
      riskAssessment: {
        overallRisk: 'MODERATE',
        riskScore: 0.48,
        description: 'Improvement noted',
        concerns: ['Reading fluency still below average'],
        recommendations: ['Continue current interventions'],
      },
    },
    {
      studentId: 'student_001',
      script: 'gu',
      tracingScore: { score: 0.82, level: 'good', reattempts: 1 },
      readingScore: { score: 0.84, level: 'fluent', accuracy: 0.9 },
      riskAssessment: {
        overallRisk: 'LOW',
        riskScore: 0.28,
        description: 'Significant improvement',
        concerns: [],
        recommendations: ['Continue regular practice'],
      },
    },
    {
      studentId: 'student_002',
      script: 'hi',
      tracingScore: { score: 0.45, level: 'needs_improvement', reattempts: 6 },
      readingScore: { score: 0.52, level: 'struggling', accuracy: 0.45 },
      riskAssessment: {
        overallRisk: 'HIGH',
        riskScore: 0.72,
        description: 'Significant difficulty detected',
        concerns: [
          'Fine motor control issues',
          'Significant reading delays',
        ],
        recommendations: ['Professional dyslexia assessment', 'Specialist intervention'],
      },
    },
  ];

  demoAssessments.forEach((assessment) => {
    storeAssessment(assessment.studentId, assessment);
  });
}
