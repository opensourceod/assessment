import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StepForm from '../components/StepForm'
import axios from '../api/client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import logo from '../assets/osod.png'
import banner from '../assets/banner.png'

export default function SelfAssessment() {
  const { token } = useParams()

  const navigate = useNavigate()

  const [data, setData] =
    useState(null)

  const [estado, setEstado] =
    useState('loading')

  const [completado, setCompletado] =
    useState(false)

  const [
    respuestasPDF,
    setRespuestasPDF
  ] = useState([])

  useEffect(() => {
    axios
      .get(`/api/self/${token}`)
      .then(res => {
        setData(res.data)

        setEstado('ready')
      })
      .catch(e => {
        if (
          e?.response?.status === 410
        ) {
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
    const doc = new jsPDF(
      'p',
      'mm',
      'a4'
    )

    const pageWidth =
      doc.internal.pageSize.getWidth()

    const pageHeight =
      doc.internal.pageSize.getHeight()

    // ==========================================
    // COLORS
    // ==========================================

    const primary = [30, 41, 59]

    const dark = [15, 23, 42]

    const gray = [100, 116, 139]

    const light = [248, 250, 252]

    // ==========================================
    // HELPERS
    // ==========================================

    function drawHeader() {
      // Banner

      doc.addImage(
        banner,
        'PNG',
        0,
        0,
        pageWidth,
        55
      )

      // Overlay oscuro

      doc.setFillColor(
        0,
        0,
        0,
        0.35
      )

      doc.rect(
        0,
        0,
        pageWidth,
        55,
        'F'
      )

      // Logo

      doc.addImage(
        logo,
        'PNG',
        18,
        12,
        48,
        20
      )
    }

    function drawFooter(page) {
  doc.setFontSize(6)

  doc.setTextColor(160, 160, 160)

  doc.text(
    `MOST 2.0 • Page ${page}`,
    pageWidth / 2,
    pageHeight - 5,
    {
      align: 'center'
    }
  )
}

    function drawCard(
      title,
      value,
      x,
      y
    ) {
      // Shadow

      doc.setFillColor(
        230,
        230,
        230
      )

      doc.roundedRect(
        x + 1,
        y + 1,
        78,
        35,
        4,
        4,
        'F'
      )

      // Card

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

      // Border

      doc.setDrawColor(...primary)

      doc.setLineWidth(0.6)

      doc.roundedRect(
        x,
        y,
        78,
        35,
        4,
        4
      )

      // Title

      doc.setFontSize(11)

      doc.setTextColor(...gray)

      doc.setFont(
        'helvetica',
        'normal'
      )

      doc.text(
        title,
        x + 5,
        y + 10
      )

      // Value

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

    function drawProgressBar(
  label,
  value,
  y
) {
  // Label
  doc.setFontSize(10)

  doc.setTextColor(...dark)

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.text(label, 20, y)

  // Fondo barra
  doc.setFillColor(
    230,
    230,
    230
  )

  doc.roundedRect(
    20,
    y + 4,
    150,
    6,
    3,
    3,
    'F'
  )

  // Barra progreso
  doc.setFillColor(...primary)

  doc.roundedRect(
    20,
    y + 4,
    (150 * Number(value)) / 100,
    6,
    3,
    3,
    'F'
  )

  // %
  doc.setFontSize(9)

  doc.setTextColor(...gray)

  doc.setFont(
    'helvetica',
    'normal'
  )

  doc.text(
    `${value}%`,
    175,
    y + 8
  )
}
    // ==========================================
    // CALCULATIONS
    // ==========================================

    const avg = arr =>
      arr.length
        ? arr.reduce(
            (a, b) => a + b,
            0
          ) / arr.length
        : 0

    const getScore = index =>
      Number(
        respuestasPDF[index]
          ?.puntaje || 0
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

    const technical_interest =
      avg([
        getScore(8),
        getScore(9),
        getScore(10)
      ]).toFixed(2)

    const technical_strength =
      avg([
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

    const influence_interest =
      avg([
        getScore(11),
        getScore(12),
        getScore(13)
      ]).toFixed(2)

    const influence_strength =
      avg([
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

    const total =
      respuestasPDF.reduce(
        (acc, r) =>
          acc +
          Number(
            r.puntaje || 0
          ),
        0
      )

    const average =
      respuestasPDF.length > 0
        ? (
            total /
            respuestasPDF.length
          ).toFixed(2)
        : '0.00'

    // ==========================================
    // PAGE 1 - COVER
    // ==========================================

    drawHeader()

    // Title

    doc.setFontSize(30)

    doc.setTextColor(
      255,
      255,
      255
    )

    doc.setFont(
      'helvetica',
      'bold'
    )

    doc.text(
      'MOST 2.0',
      20,
      80
    )

    // Subtitle

    doc.setFontSize(16)

    doc.setTextColor(
      220,
      220,
      220
    )

    doc.setFont(
      'helvetica',
      'normal'
    )

    doc.text(
      'Individual Assessment Report',
      20,
      90
    )

    // White card

    doc.setFillColor(
      255,
      255,
      255
    )

    doc.roundedRect(
      15,
      110,
      180,
      85,
      5,
      5,
      'F'
    )

    // Participant

    doc.setFontSize(22)

    doc.setTextColor(...dark)

    doc.setFont(
      'helvetica',
      'bold'
    )

    doc.text(
      data?.nombre ||
        'Participant',
      25,
      135
    )

    // Email

    doc.setFontSize(11)

    doc.setTextColor(...gray)

    doc.setFont(
      'helvetica',
      'normal'
    )

    doc.text(
      data?.email || '',
      25,
      145
    )

    // Date

    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      25,
      153
    )

    // Summary

    doc.setFontSize(14)

    doc.setTextColor(...dark)

    doc.setFont(
      'helvetica',
      'bold'
    )

    doc.text(
      'Executive Summary',
      25,
      172
    )

    doc.setFontSize(11)

    doc.setFont(
      'helvetica',
      'normal'
    )

    const intro =
      `This MOST 2.0 report provides a detailed analysis of competencies, strengths, interests and behavioral dimensions identified during the assessment process.`

    const splitIntro =
      doc.splitTextToSize(
        intro,
        155
      )

    doc.text(
      splitIntro,
      25,
      182
    )

    drawFooter(1)

    // ==========================================
    // PAGE 2 - RESULTS
    // ==========================================

    doc.addPage()

    drawHeader()

    doc.setFontSize(22)

    doc.setTextColor(...dark)

    doc.setFont(
      'helvetica',
      'bold'
    )

    doc.text(
      'Assessment Results',
      20,
      75
    )

    drawCard(
      'Average Score',
      average,
      20,
      90
    )

    drawCard(
      'Social Interest',
      social_interest,
      110,
      90
    )

    drawCard(
      'Social Strength',
      social_strength,
      20,
      135
    )

    drawCard(
      'Technical Interest',
      technical_interest,
      110,
      135
    )

    drawCard(
      'Technical Strength',
      technical_strength,
      20,
      180
    )

    drawCard(
      'Influence Interest',
      influence_interest,
      110,
      180
    )

    drawFooter(2)

    // ==========================================
    // PAGE 3 - DOMAINS
    // ==========================================

    doc.addPage()

    drawHeader()

    doc.setFontSize(22)

    doc.setTextColor(...dark)

    doc.setFont(
      'helvetica',
      'bold'
    )

    doc.text(
      'Competency Domains',
      20,
      75
    )

   drawProgressBar(
  'Social Interest',
  social_interest,
  80
)

drawProgressBar(
  'Social Strength',
  social_strength,
  102
)

drawProgressBar(
  'Technical Interest',
  technical_interest,
  124
)

drawProgressBar(
  'Technical Strength',
  technical_strength,
  146
)

drawProgressBar(
  'Influence Interest',
  influence_interest,
  168
)

drawProgressBar(
  'Influence Strength',
  influence_strength,
  190
)
    
drawFooter(3)

    // ==========================================
    // PAGE 4 - RESPONSES
    // ==========================================

    doc.addPage()

    drawHeader()

    doc.setFontSize(22)

    doc.setTextColor(...dark)

    doc.setFont(
      'helvetica',
      'bold'
    )

    doc.text(
      'Assessment Responses',
      20,
      75
    )

    const rows =
      respuestasPDF.map(
        (
          respuesta,
          index
        ) => {
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
      startY: 85,

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
        textColor: [
          255,
          255,
          255
        ]
      },

      alternateRowStyles: {
        fillColor: [
          248,
          250,
          252
        ]
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

    drawFooter(4)

    // ==========================================
    // SAVE
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
  // COMPLETED
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
  // FINAL SCREEN
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
    data?.form_type ===
    'most_2.0'

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