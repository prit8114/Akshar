import React from 'react'

const Welcome = React.memo(function Welcome({ onStart }) {
  return (
    <div className="screen" style={{ textAlign: 'center', paddingTop: 64 }}>

      <div className="dev" style={{ fontSize: 72, color: 'var(--primary)', lineHeight: 1, marginBottom: 12 }}>
        अ
      </div>

      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Akshar</h1>
      <p className="subtitle">
        Early dyslexia screening for<br />Indian school children
      </p>

      <div className="info-box" style={{ textAlign: 'left', marginBottom: 36 }}>
        <div className="tag">Before you begin</div>
        <p>
          This tool takes about <strong>5 minutes</strong>. The child will trace
          letters and read simple words. Results help identify children who may
          benefit from further specialist evaluation.
        </p>
      </div>

      <button className="btn-primary" onClick={onStart}>
        Begin screening →
      </button>

      <div style={{ marginTop: 14, fontSize: 12, color: 'var(--muted)' }}>
        Screening tool — not a clinical diagnosis
      </div>

    </div>
  )
})

export default Welcome