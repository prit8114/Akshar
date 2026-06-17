import React from 'react'

const COPY = {
  hindi: {
    title: 'अक्षर ट्रेसिंग',
    subtitle:
      'आपको एक हल्के आउटलाइन वाला हिंदी अक्षर दिखाई देगा। माउस से उस पर ट्रेस करें। आकृति को जितना हो सके उतना सटीक बनाइए। ज़रूरत हो तो साफ़ करके फिर से प्रयास कर सकते हैं।',
    button: 'ट्रेसिंग शुरू करें →',
    letterTitle: 'हिंदी अक्षर',
  },
  gujarati: {
    title: 'અક્ષર ટ્રેસિંગ',
    subtitle:
      'તમને હળવા આઉટલાઇનવાળું ગુજરાતી અક્ષર દેખાશે. માઉસથી તેના પર ટ્રેસ કરો. આકારને શક્ય તેટલો સચોટ બનાવો. જરૂર પડે તો સાફ કરીને ફરી પ્રયાસ કરી શકો છો.',
    button: 'ટ્રેસિંગ શરૂ કરો →',
    letterTitle: 'ગુજરાતી અક્ષર',
  },
}

const LETTERS = {
  hindi: [
    { char: 'क', label: 'ka' },
    { char: 'र', label: 'ra' },
    { char: 'घ', label: 'gha' },
  ],
  gujarati: [
    { char: 'ક', label: 'ka' },
    { char: 'ર', label: 'ra' },
    { char: 'ઘ', label: 'gha' },
  ],
}

const TraceIntro = React.memo(function TraceIntro({ language, onStart }) {
  const copy = COPY[language]
  const letters = LETTERS[language]

  return (
    <div className="screen">
      <h1>{copy.title}</h1>
      <p className="subtitle">{copy.subtitle}</p>

      <div className="letter-preview-grid">
        {letters.map(l => (
          <div className="letter-preview-card" key={l.char}>
            <span className="dev">{l.char}</span>
            <span>{l.label}</span>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onStart}>
        {copy.button}
      </button>
    </div>
  )
})

export default TraceIntro