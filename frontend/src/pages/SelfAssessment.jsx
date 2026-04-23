import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StepForm from '../components/StepForm'
import axios from '../api/client'

export default function SelfAssessment() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [estado, setEstado] = useState('loading')

  useEffect(() => {
    axios.get(`/api/self/${token}`)
      .then(res => { setData(res.data); setEstado('ready') })
      .catch(e => {
        if (e?.response?.status === 410) setEstado('already_done')
        else setEstado('error')
      })
  }, [token])

  async function handleSubmit(respuestas) {
    const { data: result } = await axios.post(`/api/self/${token}/submit`, { respuestas })
    navigate(`/dashboard/${result.subject_id}`)
  }

  if (estado === 'loading') {
    return <CenteredMessage>Loading your self-assessment...</CenteredMessage>
  }

  if (estado === 'already_done') {
    return (
      <CenteredMessage>
        <h2 className="text-xl font-bold mb-2">Already completed</h2>
        <p className="text-muted text-sm">You have already submitted your self-assessment.</p>
      </CenteredMessage>
    )
  }

  if (estado === 'error') {
    return (
      <CenteredMessage>
        <h2 className="text-xl font-bold mb-2 text-red-600">Invalid link</h2>
        <p className="text-muted text-sm">This self-assessment link is invalid or has expired.</p>
      </CenteredMessage>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-dark text-white px-6 py-8 text-center">
        <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">
          360 MOST Assessment
        </p>
        <h1 className="text-xl font-bold">Self-Assessment: {data.nombre}</h1>
        <p className="text-gray-400 text-sm mt-1">
          Rate each statement based on your own experience and perception.
        </p>
      </div>

      <div className="max-w-2xl mx-auto py-10 px-6">
        <div className="card mb-6 bg-cyan-50 border-cyan-200">
          <p className="text-sm text-dark">
            <strong>Instructions:</strong> Answer honestly based on your current work environment.
            This is your baseline — it will be compared against your evaluators' responses
            to reveal gaps and growth opportunities.
          </p>
        </div>

        <StepForm
          preguntas={data.preguntas}
          onSubmit={handleSubmit}
          storageKey={`self_${token}`}
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
