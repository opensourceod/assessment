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

    // ===============================
    // TITULO
    // ===============================

    doc.setFontSize(18)
    doc.text('MOST 2.0 Results', 20, 20)

    // ===============================
    // INFORMACION GENERAL
    // ===============================

    doc.setFontSize(12)

    doc.text(
      `Name: ${data?.nombre || ''}`,
      20,
      35
    )

    doc.text(
      `Email: ${data?.email || 'No email'}`,
      20,
      43
    )

    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      20,
      51
    )

    // ===============================
    // CALCULOS GENERALES
    // ===============================

    const puntajes = respuestasPDF.map(
      r => Number(r.puntaje) || 0
    )

    const sumaTotal = puntajes.reduce(
      (acc, value) => acc + value,
      0
    )

    const promedioGeneral =
      puntajes.length > 0
        ? (
            sumaTotal / puntajes.length
          ).toFixed(2)
        : 0

    // ===============================
    // PUNTAJES INDIVIDUALES
    // ===============================

    const p1 = Number(respuestasPDF[0]?.puntaje || 0)
    const p2 = Number(respuestasPDF[1]?.puntaje || 0)
    const p3 = Number(respuestasPDF[2]?.puntaje || 0)

    const p4 = Number(respuestasPDF[3]?.puntaje || 0)
    const p5 = Number(respuestasPDF[4]?.puntaje || 0)
    const p6 = Number(respuestasPDF[5]?.puntaje || 0)

    const p7 = Number(respuestasPDF[6]?.puntaje || 0)
    const p8 = Number(respuestasPDF[7]?.puntaje || 0)
    const p9 = Number(respuestasPDF[8]?.puntaje || 0)

    const p10 = Number(respuestasPDF[9]?.puntaje || 0)
    const p11 = Number(respuestasPDF[10]?.puntaje || 0)
    const p12 = Number(respuestasPDF[11]?.puntaje || 0)

    const p13 = Number(respuestasPDF[12]?.puntaje || 0)
    const p14 = Number(respuestasPDF[13]?.puntaje || 0)
    const p15 = Number(respuestasPDF[14]?.puntaje || 0)

    const p16 = Number(respuestasPDF[15]?.puntaje || 0)
    const p17 = Number(respuestasPDF[16]?.puntaje || 0)
    const p18 = Number(respuestasPDF[17]?.puntaje || 0)

    const p19 = Number(respuestasPDF[18]?.puntaje || 0)
    const p20 = Number(respuestasPDF[19]?.puntaje || 0)
    const p21 = Number(respuestasPDF[20]?.puntaje || 0)

    const p22 = Number(respuestasPDF[21]?.puntaje || 0)
    const p23 = Number(respuestasPDF[22]?.puntaje || 0)
    const p24 = Number(respuestasPDF[23]?.puntaje || 0)

    const p25 = Number(respuestasPDF[24]?.puntaje || 0)
    const p26 = Number(respuestasPDF[25]?.puntaje || 0)
    const p27 = Number(respuestasPDF[26]?.puntaje || 0)

    const p28 = Number(respuestasPDF[27]?.puntaje || 0)
    const p29 = Number(respuestasPDF[28]?.puntaje || 0)
    const p30 = Number(respuestasPDF[29]?.puntaje || 0)

    const p31 = Number(respuestasPDF[30]?.puntaje || 0)
    const p32 = Number(respuestasPDF[31]?.puntaje || 0)
    const p33 = Number(respuestasPDF[32]?.puntaje || 0)

    const p34 = Number(respuestasPDF[33]?.puntaje || 0)
    const p35 = Number(respuestasPDF[34]?.puntaje || 0)
    const p36 = Number(respuestasPDF[35]?.puntaje || 0)

    const p37 = Number(respuestasPDF[36]?.puntaje || 0)
    const p38 = Number(respuestasPDF[37]?.puntaje || 0)
    const p39 = Number(respuestasPDF[38]?.puntaje || 0)

    const p40 = Number(respuestasPDF[39]?.puntaje || 0)
    const p41 = Number(respuestasPDF[40]?.puntaje || 0)
 

    
// ===============================
// CALCULOS MOST 2.0 (CORRECTO)
// ===============================

const avg = (arr) =>
  arr.reduce((a, b) => a + b, 0) / arr.length

const social_interest =
  avg([p6, p7, p8]).toFixed(2)

const social_strength =
  avg([p15, p16, p17, p18, p19, p20, p21, p22, p23]).toFixed(2)

const technical_interest =
  avg([p9, p10, p11]).toFixed(2)

const technical_strength =
  avg([p24, p25, p26, p27, p28, p29, p30, p31, p32]).toFixed(2)

const influence_interest =
  avg([p12, p13, p14]).toFixed(2)

const influence_strength =
    avg([p33, p34, p35, p36,p37,p38,p39,p40, p41]).toFixed(2)

    // ===============================
    // MOSTRAR RESULTADOS EN PDF
    // ===============================

    doc.setFontSize(13)

    doc.text(
      `Total Score: ${sumaTotal}`,
      20,
      65
    )

    doc.text(
      `Average Score: ${promedioGeneral}%`,
      20,
      73
    )

    doc.text(
      `Social Interest: ${social_interest}%`, 
      20,
      85
    )

    doc.text(
      `Social Strength: ${social_strength}%`,
      20,
      93
    )

    doc.text(
      `Technical Interest: ${technical_interest}%`,
      20,
      101
    )

    doc.text(
      `Technical Strength: ${technical_strength}%`,
      20,
      109
    )

    doc.text(
      `Influence Interest: ${influence_interest}%`,
      20,
      117
    )

    doc.text(
      `Influence Strength: ${influence_strength}%`,
      20,
      125
    )

    // ===============================
    // PREGUNTAS
    // ===============================

    let y = 145

    respuestasPDF.forEach((respuesta, index) => {
      const pregunta = data?.preguntas?.find(
        p => p.id === respuesta.pregunta_id
      )

      const textoPregunta =
        pregunta?.texto ||
        pregunta?.pregunta ||
        'Pregunta no encontrada'

      // Ajustar texto largo
      const preguntaSplit =
        doc.splitTextToSize(
          `${index + 1}. ${textoPregunta}`,
          170
        )

      // Nueva página
      if (y > 270) {
        doc.addPage()
        y = 20
      }

      // Pregunta
      doc.text(
        preguntaSplit,
        20,
        y
      )

      y += preguntaSplit.length * 7

      // Respuesta
      doc.text(
        `Respuesta: ${respuesta.puntaje}%`,
        30,
        y
      )

      y += 15
    })

    // ===============================
    // DESCARGAR PDF
    // ===============================

    doc.save(
      `MOST20_${data?.nombre}.pdf`
    )
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

  // ===============================
  // LOADING
  // ===============================

  if (estado === 'loading') {
    return (
      <CenteredMessage>
        Loading your self-assessment...
      </CenteredMessage>
    )
  }

  // ===============================
  // ALREADY COMPLETED
  // ===============================

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

  // ===============================
  // ERROR
  // ===============================

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

  // ===============================
  // FINAL SCREEN MOST 2.0
  // ===============================

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