import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StepForm from '../components/StepForm'
import axios from '../api/client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

  // ==========================================
  // PDF PROFESIONAL MOST 2.0
  // ==========================================

  function downloadPDF() {
    const doc = new jsPDF('p', 'mm', 'a4')

    const pageWidth =
      doc.internal.pageSize.getWidth()

    const pageHeight =
      doc.internal.pageSize.getHeight()

    // ==========================================
    // COLORES
    // ==========================================

    const primary = [249, 115, 22]
    const dark = [15, 23, 42]
    const gray = [100, 116, 139]
    const light = [248, 250, 252]

    // ==========================================
    // PORTADA
    // ==========================================

    doc.setFillColor(...primary)
    doc.rect(0, 0, pageWidth, 65, 'F')

    doc.setTextColor(255, 255, 255)

    doc.setFontSize(30)
    doc.setFont('helvetica', 'bold')

    doc.text('MOST 2.0', 20, 30)

    doc.setFontSize(18)
    doc.setFont('helvetica', 'normal')

    doc.text('Individual Report', 20, 45)

    // Nombre

    doc.setTextColor(...dark)

    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')

    doc.text(
      data?.nombre || 'Participant',
      20,
      95
    )

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gray)

    doc.text(
      data?.email || '',
      20,
      105
    )

    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      20,
      113
    )

    // Texto introductorio

    doc.setTextColor(...dark)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')

    doc.text(
      'Congratulations!',
      20,
      140
    )

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')

    const intro =
      `Your MOST 2.0 assessment has been completed successfully. ` +
      `This report summarizes your competencies, strengths, ` +
      `interests, and organizational development profile.`

    const splitIntro =
      doc.splitTextToSize(
        intro,
        170
      )

    doc.text(splitIntro, 20, 150)

    // ==========================================
    // PAGINA RESULTADOS
    // ==========================================

    doc.addPage()

    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...dark)

    doc.text('Assessment Results', 20, 20)

    // ==========================================
    // CALCULOS
    // ==========================================

    const avg = arr =>
      arr.length
        ? arr.reduce((a, b) => a + b, 0) /
          arr.length
        : 0

    const getScore = index =>
      Number(
        respuestasPDF[index]?.puntaje || 0
      )

    const social_interest = avg([
      getScore(5),
      getScore(6),
      getScore(7)
    ]).toFixed(2)

    const social_strength = avg([
      getScore(14),
      getScore(15),
      getScore(16),
      getScore(17),
      getScore(18),
      getScore(19),
      getScore(20),
      getScore(21),
      getScore(22)
    ]).toFixed(2)

    const technical_interest = avg([
      getScore(8),
      getScore(9),
      getScore(10)
    ]).toFixed(2)

    const technical_strength = avg([
      getScore(23),
      getScore(24),
      getScore(25),
      getScore(26),
      getScore(27),
      getScore(28),
      getScore(29),
      getScore(30),
      getScore(31)
    ]).toFixed(2)

    const influence_interest = avg([
      getScore(11),
      getScore(12),
      getScore(13)
    ]).toFixed(2)

    const influence_strength = avg([
      getScore(32),
      getScore(33),
      getScore(34),
      getScore(35),
      getScore(36),
      getScore(37),
      getScore(38),
      getScore(39),
      getScore(40)
    ]).toFixed(2)

    // ==========================================
    // TOTAL
    // ==========================================

   const total =
  respuestasPDF.reduce(
    (acc, r) =>
      acc + Number(r.puntaje || 0),
    0
  )

let average =
  respuestasPDF.length > 0
    ? total / respuestasPDF.length
    : 0

// Nunca superar 100
average = Math.min(average, 100)

average = average.toFixed(2)

    // ==========================================
    // FUNCION CARD
    // ==========================================

    function drawCard(
      title,
      value,
      x,
      y
    ) {
      doc.setFillColor(...light)

      doc.roundedRect(
        x,
        y,
        78,
        35,
        4,
        4,
        'F'
      )

      doc.setDrawColor(...primary)

      doc.roundedRect(
        x,
        y,
        78,
        35,
        4,
        4
      )

      doc.setFontSize(11)
      doc.setTextColor(...gray)
      doc.setFont(
        'helvetica',
        'normal'
      )

      doc.text(title, x + 5, y + 10)

      doc.setFontSize(20)
      doc.setTextColor(...dark)
      doc.setFont(
        'helvetica',
        'bold'
      )

      doc.text(
        `${value}%`,
        x + 5,
        y + 24
      )
    }

    // ==========================================
    // TARJETAS
    // ==========================================

    drawCard(
      'Total Score',
      total,
      20,
      35
    )

    drawCard(
      'Average Score',
      average,
      110,
      35
    )

    drawCard(
      'Social Interest',
      social_interest,
      20,
      80
    )

    drawCard(
      'Social Strength',
      social_strength,
      110,
      80
    )

    drawCard(
      'Technical Interest',
      technical_interest,
      20,
      125
    )

    drawCard(
      'Technical Strength',
      technical_strength,
      110,
      125
    )

    drawCard(
      'Influence Interest',
      influence_interest,
      20,
      170
    )

    drawCard(
      'Influence Strength',
      influence_strength,
      110,
      170
    )

    // ==========================================
    // PAGINA DOMINIOS
    // ==========================================

    doc.addPage()

    doc.setFontSize(22)
    doc.setTextColor(...dark)
    doc.setFont('helvetica', 'bold')

    doc.text(
      'Competency Domains',
      20,
      20
    )

    function drawProgressBar(
      label,
      value,
      y
    ) {
      doc.setFontSize(12)
      doc.setFont(
        'helvetica',
        'bold'
      )

      doc.text(label, 20, y)

      // Fondo

      doc.setFillColor(230, 230, 230)

      doc.roundedRect(
        20,
        y + 5,
        160,
        8,
        4,
        4,
        'F'
      )

      // Progreso

      doc.setFillColor(...primary)

      doc.roundedRect(
        20,
        y + 5,
        (160 * Number(value)) / 100,
        8,
        4,
        4,
        'F'
      )

      doc.setFontSize(10)

      doc.text(
        `${value}%`,
        185,
        y + 10
      )
    }

    drawProgressBar(
      'Social Interest',
      social_interest,
      40
    )

    drawProgressBar(
      'Social Strength',
      social_strength,
      65
    )

    drawProgressBar(
      'Technical Interest',
      technical_interest,
      90
    )

    drawProgressBar(
      'Technical Strength',
      technical_strength,
      115
    )

    drawProgressBar(
      'Influence Interest',
      influence_interest,
      140
    )

    drawProgressBar(
      'Influence Strength',
      influence_strength,
      165
    )

    // ==========================================
    // PAGINA RESPUESTAS
    // ==========================================

    doc.addPage()

    doc.setFontSize(22)
    doc.setTextColor(...dark)
    doc.setFont('helvetica', 'bold')

    doc.text(
      'Assessment Responses',
      20,
      20
    )

    const rows =
      respuestasPDF.map(
        (respuesta, index) => {
          const pregunta =
            data?.preguntas?.find(
              p =>
                p.id ===
                respuesta.pregunta_id
            )

          return [
            index + 1,
            pregunta?.texto ||
              pregunta?.pregunta ||
              'Question not found',
            `${respuesta.puntaje}%`
          ]
        }
      )

    autoTable(doc, {
      startY: 30,

      head: [
        [
          '#',
          'Question',
          'Score'
        ]
      ],

      body: rows,

      styles: {
        fontSize: 9,
        cellPadding: 4
      },

      headStyles: {
        fillColor: primary,
        textColor: [255, 255, 255]
      },

      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },

      columnStyles: {
        0: {
          cellWidth: 12
        },

        1: {
          cellWidth: 140
        },

        2: {
          halign: 'center',
          cellWidth: 25
        }
      }
    })

    // ==========================================
    // FOOTER
    // ==========================================

    const totalPages =
      doc.getNumberOfPages()

    for (
      let i = 1;
      i <= totalPages;
      i++
    ) {
      doc.setPage(i)

      doc.setFontSize(10)
      doc.setTextColor(...gray)

      doc.text(
        `MOST 2.0 Report`,
        20,
        pageHeight - 10
      )

      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - 45,
        pageHeight - 10
      )
    }

    // ==========================================
    // DESCARGAR
    // ==========================================

    doc.save(
      `MOST20_${data?.nombre}.pdf`
    )
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  async function handleSubmit(
    respuestas
  ) {
    setRespuestasPDF(respuestas)

    const { data: result } =
      await axios.post(
        `/api/self/${token}/submit`,
        { respuestas }
      )

    if (
      data?.form_type ===
      'most_2.0'
    ) {
      setCompletado(true)
    } else {
      navigate(
        `/dashboard/${result.subject_id}`
      )
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (estado === 'loading') {
    return (
      <CenteredMessage>
        Loading your self-assessment...
      </CenteredMessage>
    )
  }

  // ==========================================
  // COMPLETADO
  // ==========================================

  if (estado === 'already_done') {
    return (
      <CenteredMessage>
        <h2 className="text-xl font-bold mb-2">
          Already completed
        </h2>

        <p className="text-muted text-sm">
          You have already submitted
          your self-assessment.
        </p>
      </CenteredMessage>
    )
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (estado === 'error') {
    return (
      <CenteredMessage>
        <h2 className="text-xl font-bold mb-2 text-red-600">
          Invalid link
        </h2>

        <p className="text-muted text-sm">
          This self-assessment link is
          invalid or has expired.
        </p>
      </CenteredMessage>
    )
  }

  // ==========================================
  // FINAL
  // ==========================================

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
          Assessment completed!
        </h2>

        <p className="text-muted text-sm mb-6">
          Thank you,
          <strong>
            {' '}
            {data?.nombre}
          </strong>
          . Your MOST 2.0 responses
          have been recorded.
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

  const isMost2 =
    data?.form_type === 'most_2.0'

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
            <strong>
              Instructions:
            </strong>{' '}
            {isMost2
              ? 'Answer each question honestly. Your results will be available once processed.'
              : 'Answer honestly based on your current work environment.'}
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

function CenteredMessage({
  children
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="card max-w-sm w-full text-center">
        {children}
      </div>
    </div>
  )
}