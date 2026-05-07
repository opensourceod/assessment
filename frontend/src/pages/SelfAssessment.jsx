import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StepForm from '../components/StepForm'
import axios from '../api/client'
import jsPDF from 'jspdf'

export default function SelfAssessment() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [estado, setEstado] = useState('loading')
  const [completado, setCompletado] = useState(false)
  const [respuestasPDF, setRespuestasPDF] = useState([])

  useEffect(() => {
    axios
      .get(`/api/self/${token}`)
      .then(res => {
        console.log(res.data)

        setData(res.data)
        setEstado('ready')
      })
      .catch(e => {
        if (e?.response?.status === 410) {
          setEstado('already_done')
        } else {
          setEstado('error')
        }
      })
  }, [token])

  function downloadPDF() {
    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.text('MOST 2.0 Results', 20, 20)

    // Información general
    doc.setFontSize(12)

    doc.text(
      `Name: ${data?.nombre || ''}`,
      20,
      35
    )

    doc.text(
      `Email: ${
        data?.mail ||
        data?.email ||
        data?.correo ||
        'No email'
      }`,
      20,
      43
    )

    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      20,
      51
    )

    let y = 70

    // Preguntas y respuestas
    respuestasPDF.forEach((respuesta, index) => {
      const pregunta = data?.preguntas?.find(
        p => p.id === respuesta.pregunta_id
      )

      const textoPregunta =
        pregunta?.texto ||
        pregunta?.pregunta ||
        'Pregunta no encontrada'

      // Divide texto largo
      const preguntaSplit = doc.splitTextToSize(
        `${index + 1}. ${textoPregunta}`,
        170
      )

      // Imprimir pregunta
      doc.text(preguntaSplit, 20, y)

      // Espacio usado por pregunta
      y += preguntaSplit.length * 7

      // Imprimir respuesta
      doc.text(
        `Respuesta: ${respuesta.puntaje}%`,
        30,
        y
      )

      y += 15

      // Salto de página
      if (y > 270) {
        doc.addPage()
        y = 20
      }
    })

    // Descargar PDF
    doc.save(`MOST20_${data?.nombre}.pdf`)
  }

  async function handleSubmit(respuestas) {
    console.log(respuestas)

    setRespuestasPDF(respuestas)

    const { data: result } = await axios.post(
      `/api/self/${token}/submit`,
      { respuestas }
    )

    // MOST 2.0
    if (data?.form_type === 'most_2.0') {
      setCompletado(true)
    } else {
      // MOST 360
      navigate(`/dashboard/${result.subject_id}`)
    }
  }

  // Loading
  if (estado === 'loading') {
    return (
      <CenteredMessage>
        Loading your self-assessment...
      </CenteredMessage>
    )
  }

  // Already completed
  if (estado === 'already_done') {
    return (
      <CenteredMessage>
        <h2 className="text-xl font-bold mb-2">
          Already completed
        </h2>

        <p className="text-muted text-sm">
          You have already submitted your self-assessment.
        </p>
      </CenteredMessage>
    )
  }

  // Error
  if (estado === 'error') {
    return (
      <CenteredMessage>
        <h2 className="text-xl font-bold mb-2 text-red-600">
          Invalid link
        </h2>

        <p className="text-muted text-sm">
          This self-assessment link is invalid or has expired.
        </p>
      </CenteredMessage>
    )
  }

  // Pantalla final MOST 2.0
  if (completado) {
    return (
      <CenteredMessage>
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h2 className="text-xl font-bold mb-2">
          ¡Assessment completed!
        </h2>

        <p className="text-muted text-sm mb-6">
          Thank you, <strong>{data?.nombre}</strong>.
          Your MOST 2.0 responses have been recorded.
        </p>

        <button
          onClick={downloadPDF}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          Descargar PDF
        </button>
      </CenteredMessage>
    )
  }

  const isMost2 = data?.form_type === 'most_2.0'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-dark text-white px-6 py-8 text-center">
        <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">
          {isMost2
            ? 'MOST 2.0 Assessment'
            : '360 MOST Assessment'}
        </p>

        <h1 className="text-xl font-bold">
          {isMost2
            ? `MOST 2.0: ${data.nombre}`
            : `Self-Assessment: ${data.nombre}`}
        </h1>

        <p className="text-gray-400 text-sm mt-1">
          {isMost2
            ? 'Answer each statement honestly based on your experience.'
            : 'Rate each statement based on your own experience and perception.'}
        </p>
      </div>

      <div className="max-w-2xl mx-auto py-10 px-6">
        <div className="card mb-6 bg-cyan-50 border-cyan-200">
          <p className="text-sm text-dark">
            <strong>Instructions:</strong>{' '}
            {isMost2
              ? 'Answer each question honestly. Your results will be available once processed.'
              : 'Answer honestly based on your current work environment. This is your baseline — it will be compared against your evaluators responses to reveal gaps and growth opportunities.'}
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