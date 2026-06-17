/**
 * LanguageSelect Component
 * Allows user to select between Gujarati and Hindi
 * Entry point for the assessment flow
 */

import React from 'react';

export function LanguageSelect({ onSelectLanguage }) {
  return (
    <div className="language-select-screen">
      <div className="container">
        <h1>Select Language / ભાષા પસંદ કરો</h1>
        <p className="subtitle">
          Choose the language for assessment / આકારણી માટે ભાષા પસંદ કરો
        </p>

        <div className="language-buttons">
          <button
            className="language-btn gujarati-btn"
            onClick={() => onSelectLanguage('gu')}
          >
            <span className="flag">🇮🇳</span>
            <span className="lang-name">Gujarati</span>
            <span className="lang-script">ગુજરાતી</span>
          </button>

          <button
            className="language-btn hindi-btn"
            onClick={() => onSelectLanguage('hi')}
          >
            <span className="flag">🇮🇳</span>
            <span className="lang-name">Hindi</span>
            <span className="lang-script">हिन्दी</span>
          </button>
        </div>

        <div className="info-box">
          <p>
            This assessment evaluates letter tracing and reading fluency to
            help identify potential dyslexia risk.
          </p>
        </div>
      </div>
    </div>
  );
}
