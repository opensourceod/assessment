import { useState } from 'react'
import ProgressCircle from './ProgressCircle'

/**
 * Step-by-step survey form with local persistence and data-driven response options.
 *
 * @param {Array}    preguntas   - [{id, numero, texto, categoria, opciones}]
 * @param {Function} onSubmit    - async fn(respuestas: [{pregunta_id, puntaje}])
 * @param {string}   storageKey  - unique key for localStorage (token or subject_id)
 */

const STORAGE_KEY_PREFIX = 'v360_survey_'

export default function StepForm({ preguntas, onSubmit, storageKey }) {
  const lsKey = `${STORAGE_KEY_PREFIX}${storageKey}`

  const [respuestas, setRespuestas] = useState(() => {
    try {
      const saved = localStorage.getItem(lsKey)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const pregunta = preguntas[currentIndex]
  const seleccion = pregunta ? respuestas[pregunta.id] : null
  const esUltima = currentIndex === preguntas.length - 1
  const respondidas = Object.keys(respuestas).length

  // Per-question options — comes from backend; no hardcoded scales
  const opciones = pregunta?.opciones ?? []

  function seleccionar(valor) {
    const nuevas = { ...respuestas, [pregunta.id]: valor }
    setRespuestas(nuevas)
    localStorage.setItem(lsKey, JSON.stringify(nuevas))
  }

  function anterior() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  function siguiente() {
    if (seleccion !== null && seleccion !== undefined && currentIndex < preguntas.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  async function handleSubmit() {
    if (Object.keys(respuestas).length < preguntas.length) {
      setError('Please answer all questions before submitting.')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      const payload = Object.entries(respuestas).map(([pregunta_id, puntaje]) => ({
        pregunta_id: parseInt(pregunta_id),
        puntaje,
      }))
      await onSubmit(payload)
      localStorage.removeItem(lsKey)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Submission failed. Please try again.')
      setEnviando(false)
    }
  }

  if (!preguntas || preguntas.length === 0) {
    return (
      <div className="card text-center py-10">
        <p className="text-muted text-sm">No questions available. Please contact the administrator.</p>
      </div>
    )
  }

  if (!pregunta) return null

  const isBinary = opciones.length === 2
  const hasSeleccion = seleccion !== null && seleccion !== undefined

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-muted uppercase tracking-widest font-medium">
            {pregunta.categoria}
          </p>
          <p className="text-sm text-dark font-medium mt-0.5">
            Question {currentIndex + 1} of {preguntas.length}
          </p>
        </div>
        <ProgressCircle value={respondidas} total={preguntas.length} />
      </div>

      {/* Question card */}
      <div className="card mb-6 min-h-[120px] flex items-center">
        <p className="text-base leading-relaxed text-dark">
          {pregunta.texto}
        </p>
      </div>

      {/* Response options — data-driven from backend */}
      <div className={`flex ${isBinary ? 'flex-col gap-4' : 'flex-col gap-3'} mb-8`}>
        {opciones.map((op) => {
          const isSelected = seleccion === op.value
          return (
            <button
              key={op.value}
              onClick={() => seleccionar(op.value)}
              className={`flex items-center gap-4 px-5 py-3 rounded-full border text-left transition-all duration-150 ${
                isSelected
                  ? 'border-primary bg-primary text-white font-semibold shadow-sm'
                  : 'border-gray-200 bg-white hover:border-primary text-dark'
              }`}
            >
              {!isBinary && (
                <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  isSelected ? 'border-white bg-white text-primary' : 'border-gray-300 text-gray-400'
                }`}>
                  {op.display}
                </span>
              )}
              <span className="text-sm leading-snug">{op.label}</span>
            </button>
          )
        })}
      </div>

      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={anterior}
          disabled={currentIndex === 0}
          className="btn-secondary text-sm px-5 py-2"
        >
          ← Back
        </button>

        {esUltima ? (
          <button
            onClick={handleSubmit}
            disabled={!hasSeleccion || enviando}
            className="btn-primary text-sm px-6 py-2"
          >
            {enviando ? 'Submitting...' : 'Submit Survey'}
          </button>
        ) : (
          <button
            onClick={siguiente}
            disabled={!hasSeleccion}
            className="btn-primary text-sm px-5 py-2"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
