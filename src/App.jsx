import React, { useState, Suspense, useMemo, useCallback, useEffect } from 'react'
import './index.css'
import { createDemoData, getStudentAssessments, getAllStudents, storeAssessment, updateAssessmentLabel } from './db/assessmentDB';
import { PerformanceAnalytics } from './components/PerformanceAnalytics';
import { StudentProgressChart } from './components/StudentProgressChart';
import { ReadingTask } from './components/ReadingTask';
import { scoringEngine } from './scoring/scoringEngine';
import { wordsHi } from './data/words.hi';
import { wordsGu } from './data/words.gu';

const WORDS = { hindi: wordsHi, gujarati: wordsGu };

// Lazy loaded components for code splitting
const Welcome = React.lazy(() => import('./screens/Welcome'))
const ChildInfo = React.lazy(() => import('./screens/ChildInfo'))
const TraceIntro = React.lazy(() => import('./screens/TraceIntro'))
const LetterTrace = React.lazy(() => import('./screens/LetterTrace'))

// Loading fallback component
const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '200px', color: 'var(--muted)' }}>
    <div style={{ animation: 'pulse 1.5s infinite' }}>Loading...</div>
  </div>
)

export default function App() {
  const [screen, setScreen] = useState('welcome')
  const [language, setLanguage] = useState('hindi')
  const [child, setChild] = useState({ name: '', age: '' })
  const [traceIdx, setTraceIdx] = useState(0)
  const [traceResults, setTraceResults] = useState([])
  const [readingResults, setReadingResults] = useState(null)

  // Memoize steps array to prevent recreation on every render
  const steps = useMemo(() => [
    { key: 'welcome', label: 'Welcome', note: 'Introduce the screening' },
    { key: 'child_info', label: 'Profile', note: 'Language and age' },
    { key: 'trace_intro', label: 'Preview', note: 'Show the letters' },
    { key: 'tracing', label: 'Tracing', note: 'Capture motor control' },
    { key: 'reading', label: 'Reading', note: 'Capture fluency' },
    { key: 'phase3', label: 'Insights', note: 'Review performance' },
  ], [])

  const stageIndex = Math.max(
    0,
    steps.findIndex((step) => step.key === screen)
  )

  // Memoize navigation function
  const go = useCallback((s) => setScreen(s), [])

  // Memoize callback function
  const handleTraceDone = useCallback((result) => {
    setTraceResults(prev => {
      const updated = [...prev, result]
      if (traceIdx < 2) {
        setTraceIdx(i => i + 1)
      } else {
        go('reading')
      }
      return updated
    })
  }, [traceIdx, go])

  const handleReadingDone = async (results) => {
    setReadingResults(results)
    
    // Wire up the scoring engine using both tracing and reading results
    // Generate a student ID based on name and session
    const studentId = `student_${child.name || '001'}_${Date.now()}`
    
    // Aggregate trace results for the feature extractor
    const aggregatedTrace = {
      strokes: traceResults.flatMap(t => t.strokes || []),
      duration: traceResults.reduce((sum, t) => sum + (t.duration || 0), 0),
      reattempts: traceResults.reduce((sum, t) => sum + (t.reattempts || 0), 0),
      confidence: 1 // Defaulted to 1 as per ML requirements
    }
    
    // Generate real assessment report from actual captured data
    const report = await scoringEngine.generateReport(
      language === 'gujarati' ? 'gu' : 'hi', 
      aggregatedTrace, 
      results
    )
    
    // Store in DB so Phase 3 reads real data
    report.studentId = studentId
    storeAssessment(studentId, report)
    
    go('phase3')
  }

  if (screen === 'phase3') {
    return (
      <Phase3Demo />
    )
  }

  let content = null

  if (screen === 'welcome') {
    content = <Welcome onStart={() => go('child_info')} />
  }

  if (screen === 'child_info') {
    content = (
      <ChildInfo
        language={language}
        setLanguage={setLanguage}
        child={child}
        setChild={setChild}
        onNext={() => go('trace_intro')}
      />
    )
  }

  if (screen === 'trace_intro') {
    content = <TraceIntro language={language} onStart={() => go('tracing')} />
  }

  if (screen === 'tracing') {
    content = (
      <LetterTrace
        language={language}
        traceIdx={traceIdx}
        onDone={handleTraceDone}
      />
    )
  }

  if (screen === 'reading') {
    content = (
      <ReadingTask
        words={WORDS[language].slice(0, 5)}
        onComplete={handleReadingDone}
        onSkip={() => handleReadingDone([])}
        taskIndex={0}
        totalTasks={5}
      />
    )
  }

  return (
    <div className="app-shell">
      <div className="app-shell-inner">
        <header className="brand-bar">
          <div className="brand-logo">
            <span className="logo-icon">अ</span>
            <h1>Akshar</h1>
          </div>
          <div className="progress-simple">
            {steps.map((step, index) => (
              <div
                key={step.key}
                className={`progress-dot ${index === stageIndex ? 'active' : ''} ${index < stageIndex ? 'complete' : ''}`}
                title={step.label}
              />
            ))}
          </div>
        </header>

        <main className="screen-stage">
          <Suspense fallback={<Loader />}>
            {content}
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export function Phase3Demo() {
  const [currentView, setCurrentView] = useState('portal-menu');
  const [latestStudentId, setLatestStudentId] = useState('student_001');

  useEffect(() => {
    // Dynamically grab the most recent student created by the scoring flow
    const students = getAllStudents();
    if (students.length > 0) {
      const sorted = students.sort((a, b) => {
        const dateA = a.assessments?.[0]?.timestamp ? new Date(a.assessments[0].timestamp) : new Date(0);
        const dateB = b.assessments?.[0]?.timestamp ? new Date(b.assessments[0].timestamp) : new Date(0);
        return dateB - dateA;
      });
      setLatestStudentId(sorted[0].id);
    }
  }, []);

  return (
    <div className="phase3-demo">
      {currentView === 'portal-menu' && (
        <div className="portal-menu">
          <div className="menu-header">
            <h1>Insights & Review Center</h1>
          </div>

          <div className="menu-cards">
            <button
              className="menu-card parent-card"
              onClick={() => setCurrentView('parent')}
            >
              <span className="menu-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </span>
              <h2>Parent Portal</h2>
            </button>

            <button
              className="menu-card specialist-card"
              onClick={() => setCurrentView('specialist')}
            >
              <span className="menu-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </span>
              <h2>Specialist Dashboard</h2>
            </button>

            <button
              className="menu-card teacher-card"
              onClick={() => setCurrentView('teacher')}
            >
              <span className="menu-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              </span>
              <h2>Teacher Portal</h2>
            </button>
          </div>
        </div>
      )}

      {currentView === 'parent' && (
        <div className="view-container">
          <button className="btn-back" onClick={() => setCurrentView('portal-menu')}>
            ← Back to Menu
          </button>
          <ParentPortal studentId={latestStudentId} />
        </div>
      )}

      {currentView === 'specialist' && (
        <div className="view-container">
          <button className="btn-back" onClick={() => setCurrentView('portal-menu')}>
            ← Back to Menu
          </button>
          <SpecialistDashboard />
        </div>
      )}

      {currentView === 'teacher' && (
        <div className="view-container">
          <button className="btn-back" onClick={() => setCurrentView('portal-menu')}>
            ← Back to Menu
          </button>
          <TeacherPortal />
        </div>
      )}
    </div>
  );
}

function ParentPortal({ studentId = 'student_001' }) {
  const [assessments, setAssessments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const data = getStudentAssessments(studentId);
    setAssessments(data);
  }, [studentId]);

  if (assessments.length === 0) {
    return (
      <div className="parent-portal">
        <div className="portal-empty">
          <h2>Welcome to Parent Portal</h2>
          <p>No assessments available yet. Start by completing an assessment.</p>
        </div>
      </div>
    );
  }

  const latestAssessment = assessments[0];

  return (
    <div className="parent-portal">
      <div className="portal-header">
        <h1>Parent Portal</h1>
        <p>Track your child's dyslexia screening progress</p>
      </div>

      <div className="portal-tabs">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
        <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History</button>
      </div>

      <div className="portal-content">
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="latest-assessment">
              <h2>Latest Assessment</h2>
              <div className="assessment-card">
                <div className="assessment-date">
                  {new Date(latestAssessment.timestamp).toLocaleDateString()}
                </div>

                <div className="risk-badge">
                  <span className="risk-label">Risk Level</span>
                  <span className={`risk-value ${latestAssessment.riskAssessment?.overallRisk?.toLowerCase()}-risk`}>
                    {latestAssessment.riskAssessment?.overallRisk}
                  </span>
                </div>

                <p className="assessment-description">
                  {latestAssessment.riskAssessment?.description}
                </p>

                <div className="score-breakdown">
                  <div className="score-item">
                    <h4>Letter Tracing</h4>
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${(latestAssessment.tracingScore?.score || 0) * 100}%`, backgroundColor: '#0066cc' }} />
                    </div>
                    <span className="score-text">{((latestAssessment.tracingScore?.score || 0) * 100).toFixed(1)}%</span>
                  </div>

                  <div className="score-item">
                    <h4>Reading Fluency</h4>
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${(latestAssessment.readingScore?.score || 0) * 100}%`, backgroundColor: '#28a745' }} />
                    </div>
                    <span className="score-text">{((latestAssessment.readingScore?.score || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {latestAssessment.riskAssessment?.concerns?.length > 0 && (
                  <div className="concerns-section">
                    <h4>Areas of Concern</h4>
                    <ul>
                      {latestAssessment.riskAssessment.concerns.map((concern, idx) => (
                        <li key={idx}>⚠️ {concern}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="recommendations-section">
                  <h4>What You Can Do</h4>
                  <ul>
                    {latestAssessment.riskAssessment?.recommendations?.map((rec, idx) => (
                      <li key={idx}>✅ {rec}</li>
                    ))}
                  </ul>
                </div>

                <div className="disclaimer">
                  <strong>⚠️ Important:</strong> This is a screening tool only. For professional diagnosis, please consult a qualified dyslexia specialist.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="tab-content">
            <PerformanceAnalytics studentId={studentId} />
            <StudentProgressChart assessments={assessments} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="tab-content">
            <h2>Assessment History</h2>
            <div className="history-list">
              {assessments.map((assessment, index) => (
                <div key={assessment.id} className="history-item">
                  <div className="history-date">
                    {new Date(assessment.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    <span className="history-risk">{assessment.riskAssessment?.overallRisk}</span>
                    <span className="history-score">{((assessment.riskAssessment?.riskScore || 0) * 100).toFixed(1)}%</span>
                  </div>
                  {index === 0 && <span className="history-badge">Most Recent</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SpecialistDashboard() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [labelForm, setLabelForm] = useState({ label: null, confidence: 0.5, notes: '' });

  useEffect(() => {
    const data = getAllStudents();
    setStudents(data);
    if (data.length > 0) setSelectedStudent(data[0]);
  }, []);

  const handleLabelSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedStudent.assessments?.[0]) return;
    
    const assessmentId = selectedStudent.assessments[0].id;
    updateAssessmentLabel(selectedStudent.id, assessmentId, labelForm.label, labelForm.notes);
    
    console.log('Label submitted:', { studentId: selectedStudent.id, assessmentId, ...labelForm });
    alert('Specialist label saved successfully to the database!');
    setLabelForm({ label: null, confidence: 0.5, notes: '' });
  };

  const currentAssessment = selectedStudent?.assessments?.[0];

  return (
    <div className="specialist-dashboard">
      <div className="dashboard-header">
        <h1>Specialist Dashboard</h1>
        <p>Review and label student assessments for model improvement</p>
      </div>

      <div className="dashboard-layout">
        <div className="student-list-panel">
          <h3>Students</h3>
          <div className="student-list">
            {students.map((student) => (
              <div key={student.id} className={`student-item ${selectedStudent?.id === student.id ? 'active' : ''}`} onClick={() => setSelectedStudent(student)}>
                <div className="student-name">
                  {student.name}
                  <span className="assessment-count">{student.assessments?.length || 0} assessments</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="review-panel">
          {!selectedStudent ? (
            <div className="no-selection"><p>Select a student to review</p></div>
          ) : (
            <>
              <div className="review-header">
                <h2>{selectedStudent.name}</h2>
                <span className="assessment-date">Latest: {new Date(currentAssessment?.timestamp).toLocaleDateString()}</span>
              </div>

              <div className="assessment-details">
                <div className="detail-section">
                  <h4>AI Prediction</h4>
                  <div className={`prediction-badge ${currentAssessment?.riskAssessment?.overallRisk?.toLowerCase()}-risk`}>
                    {currentAssessment?.riskAssessment?.overallRisk}
                  </div>
                  <p>Risk Score: {((currentAssessment?.riskAssessment?.riskScore || 0) * 100).toFixed(1)}%</p>
                </div>

                <div className="detail-section">
                  <h4>Tracing Performance</h4>
                  <p>Score: {((currentAssessment?.tracingScore?.score || 0) * 100).toFixed(1)}%</p>
                  <p>Re-attempts: {currentAssessment?.tracingScore?.reattempts}</p>
                </div>

                <div className="detail-section">
                  <h4>Reading Performance</h4>
                  <p>Score: {((currentAssessment?.readingScore?.score || 0) * 100).toFixed(1)}%</p>
                  <p>Accuracy: {((currentAssessment?.readingScore?.accuracy || 0) * 100).toFixed(1)}%</p>
                </div>
              </div>

              <form className="labeling-form" onSubmit={handleLabelSubmit}>
                <h3>Specialist Label</h3>
                <div className="form-group">
                  <label>Dyslexia Status</label>
                  <div className="radio-group">
                    <label><input type="radio" name="label" value="negative" checked={labelForm.label === 'negative'} onChange={(e) => setLabelForm({...labelForm, label: e.target.value})} /> No Dyslexia</label>
                    <label><input type="radio" name="label" value="positive" checked={labelForm.label === 'positive'} onChange={(e) => setLabelForm({...labelForm, label: e.target.value})} /> Dyslexia Likely</label>
                    <label><input type="radio" name="label" value="uncertain" checked={labelForm.label === 'uncertain'} onChange={(e) => setLabelForm({...labelForm, label: e.target.value})} /> Uncertain</label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confidence Level: {(labelForm.confidence * 100).toFixed(0)}%</label>
                  <input type="range" min="0" max="1" step="0.05" value={labelForm.confidence} onChange={(e) => setLabelForm({...labelForm, confidence: parseFloat(e.target.value)})} />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea value={labelForm.notes} onChange={(e) => setLabelForm({...labelForm, notes: e.target.value})} placeholder="Add any clinical observations..." rows="4" />
                </div>

                <button type="submit" className="btn-primary">Save Label</button>
              </form>

              <div className="history-section">
                <h3>Assessment History</h3>
                <div className="mini-timeline">
                  {selectedStudent.assessments?.slice(0, 5).map((a, idx) => (
                    <div key={a.id} className="mini-timeline-item">
                      <span className="mini-date">{new Date(a.timestamp).toLocaleDateString()}</span>
                      <span className="mini-risk">{a.riskAssessment?.overallRisk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TeacherPortal() {
  const [students, setStudents] = useState([]);
  const [filterRisk, setFilterRisk] = useState('all');

  useEffect(() => {
    const data = getAllStudents();
    setStudents(data);
  }, []);

  const filteredStudents = students.filter((student) => {
    if (filterRisk === 'all') return true;
    const latestRisk = student.assessments?.[0]?.riskAssessment?.overallRisk;
    return latestRisk === filterRisk.toUpperCase();
  });

  const statistics = {
    total: students.length,
    lowRisk: students.filter((s) => s.assessments?.[0]?.riskAssessment?.overallRisk === 'LOW').length,
    moderateRisk: students.filter((s) => s.assessments?.[0]?.riskAssessment?.overallRisk === 'MODERATE').length,
    highRisk: students.filter((s) => s.assessments?.[0]?.riskAssessment?.overallRisk === 'HIGH').length,
  };

  return (
    <div className="teacher-portal">
      <div className="portal-header">
        <h1>Teacher Portal</h1>
        <p>Monitor your students' dyslexia screening results</p>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <h3>Total Students</h3>
          <div className="stat-number">{statistics.total}</div>
        </div>
        <div className="stat-box low-risk">
          <h3>Low Risk</h3>
          <div className="stat-number">{statistics.lowRisk}</div>
        </div>
        <div className="stat-box moderate-risk">
          <h3>Moderate Risk</h3>
          <div className="stat-number">{statistics.moderateRisk}</div>
        </div>
        <div className="stat-box high-risk">
          <h3>High Risk</h3>
          <div className="stat-number">{statistics.highRisk}</div>
        </div>
      </div>

      <div className="filter-bar">
        <label>Filter by Risk Level:</label>
        <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}>
          <option value="all">All Students</option>
          <option value="low">Low Risk</option>
          <option value="moderate">Moderate Risk</option>
          <option value="high">High Risk</option>
        </select>
      </div>

      <div className="student-table-container">
        <table className="student-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Assessments</th>
              <th>Latest Result</th>
              <th>Risk Level</th>
              <th>Score</th>
              <th>Tracing</th>
              <th>Reading</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => {
              const latest = student.assessments?.[0];
              return (
                <tr key={student.id}>
                  <td className="student-name">{student.name}</td>
                  <td>{student.assessments?.length || 0}</td>
                  <td>{new Date(latest?.timestamp).toLocaleDateString() || 'N/A'}</td>
                  <td>
                    <span className={`risk-badge ${latest?.riskAssessment?.overallRisk?.toLowerCase()}-risk`}>
                      {latest?.riskAssessment?.overallRisk}
                    </span>
                  </td>
                  <td>{((latest?.riskAssessment?.riskScore || 0) * 100).toFixed(1)}%</td>
                  <td>{((latest?.tracingScore?.score || 0) * 100).toFixed(1)}%</td>
                  <td>{((latest?.readingScore?.score || 0) * 100).toFixed(1)}%</td>
                  <td><button className="btn-small">View Details</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="recommendations-section">
        <h2>📋 Class-Level Recommendations</h2>
        <div className="recommendation-cards">
          {statistics.highRisk > 0 && (
            <div className="recommendation-card high-priority">
              <h3>High Priority: {statistics.highRisk} students need intervention</h3>
              <p>Students with HIGH risk should be referred to a dyslexia specialist for comprehensive evaluation.</p>
              <ul>
                <li>Schedule individual assessment meetings</li>
                <li>Refer to special education team</li>
                <li>Consider specialized intervention programs</li>
              </ul>
            </div>
          )}

          {statistics.moderateRisk > 0 && (
            <div className="recommendation-card moderate-priority">
              <h3>Monitor: {statistics.moderateRisk} students show potential delays</h3>
              <p>Students with MODERATE risk should receive additional support and regular monitoring.</p>
              <ul>
                <li>Increase reading practice frequency</li>
                <li>Use multi-sensory learning methods</li>
                <li>Re-assess in 4 weeks</li>
              </ul>
            </div>
          )}

          <div className="recommendation-card info">
            <h3>Class-Wide Strategies</h3>
            <ul>
              <li>Incorporate phonics-based instruction</li>
              <li>Use visual aids and manipulatives</li>
              <li>Provide audio versions of texts</li>
              <li>Allow extra time for reading tasks</li>
              <li>Use text-to-speech tools</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}