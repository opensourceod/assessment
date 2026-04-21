import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import StepForm from '../components/StepForm'
import axios from 'axios'

export default function EvaluatorSurvey() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [estado, setEstado] = useState('loading') // loading | ready | done | error

  useEffect(() => {
    axios.get(`/api/survey/${token}`)
      .then(res => { setData(res.data); setEstado('ready') })
      .catch(e => {
        const status = e?.response?.status
        if (status === 410) setEstado('already_done')
        else setEstado('error')
      })
  }, [token])

  async function handleSubmit(respuestas) {
    await axios.post(`/api/survey/${token}/submit`, { respuestas })
    setEstado('done')
  }

  if (estado === 'loading') {
    return <CenteredMessage>Loading your survey...</CenteredMessage>
  }

  if (estado === 'already_done') {
    return (
      <CenteredMessage>
        <h2 className="text-xl font-bold mb-2">Already submitted</h2>
        <p className="text-muted text-sm">You have already completed this survey. Thank you!</p>
      </CenteredMessage>
    )
  }

  if (estado === 'error') {
    return (
      <CenteredMessage>
        <h2 className="text-xl font-bold mb-2 text-red-600">Invalid link</h2>
        <p className="text-muted text-sm">This survey link is invalid or has expired.</p>
      </CenteredMessage>
    )
  }

  if (estado === 'done') {
    return (
      <CenteredMessage>
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 text-2xl">
          ✓
        </div>
        <h2 className="text-xl font-bold mb-2">Thank you!</h2>
        <p className="text-muted text-sm max-w-sm">
          Your responses have been recorded. Your feedback will help{' '}
          <strong>{data?.nombre_sujeto}</strong> understand their impact and grow.
        </p>
      </CenteredMessage>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Survey header */}
      <div className="bg-dark text-white px-6 py-8 text-center">
        <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">
          360 MOST Assessment
        </p>
        <h1 className="text-xl font-bold">Evaluating: {data.nombre_sujeto}</h1>
        <p className="text-gray-400 text-sm mt-1">
          Your role: <span className="capitalize font-medium text-white">{data.relacion}</span>
        </p>
      </div>

      <div className="max-w-2xl mx-auto py-10 px-6">
        <div className="card mb-6 bg-cyan-50 border-cyan-200">
          <p className="text-sm text-dark">
            <strong>Instructions:</strong> Please rate each statement based on your direct experience
            working with or knowing <strong>{data.nombre_sujeto}</strong>. There are no right or wrong
            answers — your honest perspective is what matters most.
          </p>
        </div>

        <StepForm
          preguntas={data.preguntas}
          onSubmit={handleSubmit}
          storageKey={token}
        />
      </div>
    </div>
  )
}

function CenteredMessage({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="card max-w-sm w-full text-center">
        {children}
      </div>
    </div>
  )
}
