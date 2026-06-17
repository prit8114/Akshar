import React from 'react'

const COPY = {
  hindi: {
    title: 'बच्चे की जानकारी',
    subtitle: 'माता-पिता और शिक्षकों के लिए स्क्रीनिंग रिपोर्ट को व्यक्तिगत बनाने के लिए.',
    name: 'बच्चे का नाम',
    namePlaceholder: 'नाम दर्ज करें',
    age: 'आयु',
    agePlaceholder: 'जैसे 8',
    button: 'जारी रखें →',
  },
  gujarati: {
    title: 'બાળકની માહિતી',
    subtitle: 'માતા-પિતા અને શિક્ષકો માટે સ્ક્રીનિંગ રિપોર્ટને વ્યક્તિગત બનાવવા માટે.',
    name: 'બાળકનું નામ',
    namePlaceholder: 'નામ દાખલ કરો',
    age: 'ઉંમર',
    agePlaceholder: 'જેમ કે 8',
    button: 'આગળ વધો →',
  },
}

const ChildInfo = React.memo(function ChildInfo({ language, setLanguage, child, setChild, onNext }) {
  const copy = COPY[language]
  const ready = child.name.trim() && child.age

  return (
    <div className="screen">
      <div className="field" style={{ marginBottom: 24 }}>
        <label>Language / भाषा</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            type="button"
            className={language === 'hindi' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setLanguage('hindi')}
            style={{ padding: 12 }}
          >
            हिंदी
          </button>
          <button
            type="button"
            className={language === 'gujarati' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setLanguage('gujarati')}
            style={{ padding: 12 }}
          >
            ગુજરાતી
          </button>
        </div>
      </div>

      <h1>{copy.title}</h1>
      <p className="subtitle">{copy.subtitle}</p>

      <div className="field">
        <label>{copy.name}</label>
        <input
          type="text"
          placeholder={copy.namePlaceholder}
          value={child.name}
          onChange={e => setChild(c => ({ ...c, name: e.target.value }))}
        />
      </div>

      <div className="field">
        <label>{copy.age}</label>
        <input
          type="number"
          min="5"
          max="14"
          placeholder={copy.agePlaceholder}
          value={child.age}
          onChange={e => setChild(c => ({ ...c, age: e.target.value }))}
        />
      </div>

      <div style={{ marginTop: 32 }}>
        <button className="btn-primary" onClick={onNext} disabled={!ready}>
          {copy.button}
        </button>
      </div>
    </div>
  )
})

export default ChildInfo