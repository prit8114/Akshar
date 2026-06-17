import React, { useEffect, useRef, useState } from 'react'

const COPY = {
  hindi: {
    title: 'इस अक्षर को ट्रेस करें',
    count: 'अक्षर',
    hint: 'नीचे दिए गए हल्के अक्षर की आउटलाइन पर ट्रेस करें',
    clear: 'साफ़ करें',
    done: 'पूरा हुआ ✓',
  },
  gujarati: {
    title: 'આ અક્ષરને ટ્રેસ કરો',
    count: 'અક્ષર',
    hint: 'નીચે દર્શાવેલ હળવી અક્ષર આઉટલાઇન પર ટ્રેસ કરો',
    clear: 'સાફ કરો',
    done: 'પૂર્ણ થયું ✓',
  },
}

const LETTERS = {
  hindi: {
    simple: [
      { char: 'क', label: 'ka' },
      { char: 'र', label: 'ra' },
      { char: 'घ', label: 'gha' },
      { char: 'म', label: 'ma' },
      { char: 'त', label: 'ta' },
    ],
    matra: [
      { char: 'कि', label: 'ki' },       // short i matra
      { char: 'मू', label: 'mu' },       // long u matra
      { char: 'रे', label: 're' },       // e matra
      { char: 'तो', label: 'to' },       // o matra
      { char: 'घौ', label: 'ghau' },     // au matra
    ],
    conjunct: [
      { char: 'क्त', label: 'kta' },     // ka + virama + ta
      { char: 'स्त', label: 'sta' },     // sa + virama + ta
      { char: 'ज्ञ', label: 'gya' },     // gya conjunct (notoriously difficult)
      { char: 'त्र', label: 'tra' },     // ta + virama + ra
      { char: 'श्र', label: 'shra' },    // sha + virama + ra
    ],
  },
  gujarati: {
    simple: [
      { char: 'ક', label: 'ka' },
      { char: 'ર', label: 'ra' },
      { char: 'ઘ', label: 'gha' },
      { char: 'મ', label: 'ma' },
      { char: 'ત', label: 'ta' },
    ],
    matra: [
      { char: 'કિ', label: 'ki' },
      { char: 'મૂ', label: 'mu' },
      { char: 'રે', label: 're' },
      { char: 'તો', label: 'to' },
      { char: 'ઘૌ', label: 'ghau' },
    ],
    conjunct: [
      { char: 'ક્ત', label: 'kta' },
      { char: 'સ્ત', label: 'sta' },
      { char: 'જ્ઞ', label: 'gya' },
      { char: 'ત્ર', label: 'tra' },
      { char: 'શ્ર', label: 'shra' },
    ],
  },
}

const LetterTrace = React.memo(function LetterTrace({ language, traceIdx, onDone }) {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const pathLength = useRef(0)
  const clearedCount = useRef(0)
  const lastPos = useRef(null)
  const [hasStroke, setHasStroke] = useState(false)

  // Initialize randomized letters on first mount
  const [selectedLetters] = useState(() => {
    const cats = LETTERS[language]
    const simple = cats.simple[Math.floor(Math.random() * cats.simple.length)]
    const matra = cats.matra[Math.floor(Math.random() * cats.matra.length)]
    const conjunct = cats.conjunct[Math.floor(Math.random() * cats.conjunct.length)]
    return [simple, matra, conjunct]
  })

  const copy = COPY[language]
  const letter = selectedLetters[traceIdx] || selectedLetters[0] // fallback if traceIdx out of bounds
  const progress = Math.round((traceIdx / selectedLetters.length) * 100)

  // Dynamically calculate font sizes based on string length to ensure they stay centered and don't overflow
  // e.g. Conjuncts can be 3+ JS characters long
  const charLen = letter.char.length
  let previewFontSize = 36
  let guideFontSize = 280
  
  if (charLen === 2) {
    previewFontSize = 28
    guideFontSize = 220
  } else if (charLen >= 3) {
    previewFontSize = 24
    guideFontSize = 160
  }

  const pathsRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    canvas.width = 340 * dpr
    canvas.height = 340 * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    
    // Dynamic, glowing stroke
    ctx.strokeStyle = '#F2A65A'
    ctx.lineWidth = 10
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowBlur = 16
    ctx.shadowColor = 'rgba(242, 166, 90, 0.6)'

    pathLength.current = 0
    clearedCount.current = 0
    lastPos.current = null
    isDrawing.current = false
    pathsRef.current = []
    setHasStroke(false)

    const getXY = (e) => {
      const rect = canvas.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      return { x: clientX - rect.left, y: clientY - rect.top }
    }

    const redraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pathsRef.current.forEach(path => {
        if (path.length === 0) return
        ctx.beginPath()
        ctx.moveTo(path[0].x, path[0].y)
        // Draw smooth quadratic curves instead of rigid line-to segments
        if (path.length < 3) {
          ctx.lineTo(path[0].x, path[0].y)
        } else {
          for (let i = 1; i < path.length - 2; i++) {
            const xc = (path[i].x + path[i + 1].x) / 2
            const yc = (path[i].y + path[i + 1].y) / 2
            ctx.quadraticCurveTo(path[i].x, path[i].y, xc, yc)
          }
          ctx.quadraticCurveTo(
            path[path.length - 2].x,
            path[path.length - 2].y,
            path[path.length - 1].x,
            path[path.length - 1].y
          )
        }
        ctx.stroke()
      })
    }

    const onMouseDown = (e) => {
      if (e.touches) e.preventDefault()
      isDrawing.current = true
      const pos = getXY(e)
      pathsRef.current.push([pos])
      lastPos.current = pos
      redraw()
    }

    const onMouseMove = (e) => {
      if (!isDrawing.current) return
      if (e.touches) e.preventDefault()
      
      const pos = getXY(e)
      const prev = lastPos.current
      pathLength.current += Math.hypot(pos.x - prev.x, pos.y - prev.y)
      
      pathsRef.current[pathsRef.current.length - 1].push(pos)
      lastPos.current = pos
      setHasStroke(true)
      
      requestAnimationFrame(redraw)
    }

    const onMouseUp = () => {
      isDrawing.current = false
      lastPos.current = null
    }

    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    
    canvas.addEventListener('touchstart', onMouseDown, { passive: false })
    canvas.addEventListener('touchmove', onMouseMove, { passive: false })
    window.addEventListener('touchend', onMouseUp)

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      
      canvas.removeEventListener('touchstart', onMouseDown)
      canvas.removeEventListener('touchmove', onMouseMove)
      window.removeEventListener('touchend', onMouseUp)
    }
  }, [traceIdx])

  const handleClear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    pathLength.current = 0
    clearedCount.current += 1
    pathsRef.current = []
    setHasStroke(false)
  }

  const handleDone = () => {
    onDone({
      letter: letter.char,
      pathLength: pathLength.current,
      clearedCount: clearedCount.current,
    })
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h1 style={{ marginBottom: 2 }}>{copy.title}</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            {copy.count} {traceIdx + 1} / {selectedLetters.length}
          </p>
        </div>
        <div className="dev" style={{
          fontSize: previewFontSize, color: 'var(--primary-strong)',
          background: 'rgba(242, 166, 90, 0.1)', width: 56, height: 56,
          borderRadius: 12, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--border)', textAlign: 'center'
        }}>
          {letter.char}
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginBottom: 16 }}>{copy.hint}</p>

      <div className="trace-wrapper">
        <div className="trace-guide dev" style={{ fontSize: guideFontSize, textAlign: 'center' }}>{letter.char}</div>
        <canvas ref={canvasRef} className="trace-canvas" />
      </div>

      <div className="btn-row">
        <button className="btn-outline" onClick={handleClear}>{copy.clear}</button>
        <button className="btn-primary" onClick={handleDone} disabled={!hasStroke}>
          {copy.done}
        </button>
      </div>
    </div>
  )
})

export default LetterTrace