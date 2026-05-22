import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StepForm from '../components/StepForm'
import axios from '../api/client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import logo from '../assets/osod.png'
import most from '../assets/most.png'
import banner from '../assets/banner.png'

import { useRef } from 'react'




export default function SelfAssessment() {

  const submitRef = useRef(false)
  
  const { token } = useParams()

  const navigate = useNavigate()

  const [data, setData] =
    useState(null)

  const [estado, setEstado] =
    useState('loading')

  const [completado, setCompletado] =
    useState(false)
  
  const [enviando, setEnviando] = useState(false)

  const [
    respuestas,
    setRespuestas
  ] = useState([])

  useEffect(() => {

 

  async function loadAssessment() {

    try {

    const res = await axios.get(
  `http://localhost:8000/api/self/${token}`
)

console.log(
  'API RESPONSE:',
  res.data
)
      
      setData({
  ...res.data,
  questions: res.data.preguntas
})

      setEstado('ok')

    } catch (error) {

      console.error(error)

      // TOKEN YA USADO
      if (error.res?.status === 410) {

        setEstado('already_done')

        return
      }

      // OTROS ERRORES
      setEstado('error')
    }
  }

  loadAssessment()

}, [token])

  // ==========================================
  // PDF PROFESIONAL MOST 2.0
  // ==========================================

const getScore = (index) => {
  return Number(respuestas?.[index] || 0)
}
const avg = (arr = []) =>
  arr.length
    ? arr.reduce((a, b) => a + b, 0) / arr.length
    : 0

const pdfCalc = (arr = []) =>
  avg(arr.map(getScore)).toFixed(2)

const buildItems = (items = []) =>
  items.map(i => ({
    ...i,
    your: avg(i.indices.map(getScore)).toFixed(2)
  }))

  async function downloadPDF(respuestas) {
    
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

  const answersMap = Object.fromEntries(
  respuestas.map(r => [r.pregunta_id, Number(r.puntaje)])
)

const getScore = (id) => answersMap[id] || 0

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
      respuestas.reduce(
        (acc, r) =>
          acc +
          Number(
            r.puntaje || 0
          ),
        0
      )

    const average =
      respuestas.length > 0
        ? (
            total /
            respuestas.length
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

    doc.addImage(
        logo,
        'PNG',
        18,
        12,
        48,
        20
      )

      //hoja 1

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
      data?.correo || '',
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

// ==========================================
// ROW 1
// ==========================================

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

// ==========================================
// ROW 2
// ==========================================

drawCard(
  'Social Strength',
  social_strength,
  20,
  130
)

drawCard(
  'Technical Interest',
  technical_interest,
  110,
  130
)

// ==========================================
// ROW 3
// ==========================================

drawCard(
  'Technical Strength',
  technical_strength,
  20,
  170
)

drawCard(
  'Influence Interest',
  influence_interest,
  110,
  170
)

// ==========================================
// ROW 4
// ==========================================

drawCard(
  'Influence Strength',
  influence_strength,
  65,
  210
)

// ==========================================
// FOOTER
// ==========================================

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

    // // ==========================================
    // // PAGE 4 - RESPONSES
    // // ==========================================

    // doc.addPage()

    // drawHeader()

    // doc.setFontSize(22)

    // doc.setTextColor(...dark)

    // doc.setFont(
    //   'helvetica',
    //   'bold'
    // )

    // doc.text(
    //   'Assessment Responses',
    //   20,
    //   75
    // )

    // const rows =
    //   respuestas.map(
    //     (
    //       respuesta,
    //       index
    //     ) => {
    //       const pregunta =
    //         data?.preguntas?.find(
    //           p =>
    //             p.id ===
    //             respuesta.pregunta_id
    //         )

    //       return [
    //         index + 1,

    //         pregunta?.texto ||
    //           pregunta?.pregunta ||
    //           'Question not found',

    //         `${respuesta.puntaje}%`
    //       ]
    //     }
    //   )

    // autoTable(doc, {
    //   startY: 85,

    //   head: [
    //     [
    //       '#',
    //       'Question',
    //       'Score'
    //     ]
    //   ],

    //   body: rows,

    //   styles: {
    //     fontSize: 9,
    //     cellPadding: 4
    //   },

    //   headStyles: {
    //     fillColor: primary,
    //     textColor: [
    //       255,
    //       255,
    //       255
    //     ]
    //   },

    //   alternateRowStyles: {
    //     fillColor: [
    //       248,
    //       250,
    //       252
    //     ]
    //   },

    //   columnStyles: {
    //     0: {
    //       cellWidth: 12
    //     },

    //     1: {
    //       cellWidth: 140
    //     },

    //     2: {
    //       halign: 'center',
    //       cellWidth: 25
    //     }
    //   }
    // })

    // drawFooter(4)

    //************************************************************
    // 
    //PAGINA NUEVA
    //
    // ==========================================
// PAGE 5 - DOMAINS
// ==========================================
// ==========================================
// PAGE 5 - DOMAINS
// ==========================================

doc.addPage()

drawHeader()

// ==========================================
// TITLE
// ==========================================

doc.setFontSize(20)

doc.setTextColor(...dark)

doc.setFont(
  'helvetica',
  'bold'
)

doc.text(
  'Domains',
  20,
  72
)

// ==========================================
// INTRO TEXT
// ==========================================

doc.setFontSize(8)

doc.setTextColor(90)

doc.setFont(
  'helvetica',
  'normal'
)

const introText =
  'To engage in genuine Organization Development, a practitioner must utilize at least one of the 27 competency clusters in each domain (Social, Technical, Influence) in a collaborative and caring way, where outcomes include both the prosperity of the organization as well as the well-being of internal and/or external stakeholders.'

const introSplitPage5 =
  doc.splitTextToSize(
    introText,
    170
  )

doc.text(
  introSplitPage5,
  20,
  82
)

// ==========================================
// AVERAGES
// ==========================================

const avgInterest = (
  (
    Number(
      social_interest
    ) +
    Number(
      technical_interest
    ) +
    Number(
      influence_interest
    )
  ) /
  3
).toFixed(2)

const avgStrength = (
  (
    Number(
      social_strength
    ) +
    Number(
      technical_strength
    ) +
    Number(
      influence_strength
    )
  ) /
  3
).toFixed(2)

// ==========================================
// DOMAIN DATA
// ==========================================

const domains = [
  {
    title: 'Social',

    description:
      'OD practitioners may integrate behavioral science knowledge and psychological insights, cultural pattern recognition, and human-centered ethics to drive meaningful change. The social domain also includes exploring how individual and group behaviors, shaped by biases and motivations, interact with underlying cultural assumptions and values.',

    yourInterest: `${social_interest}%`,

    yourStrength: `${social_strength}%`,

    avgInterest: `${avgInterest}%`,

    avgStrength: `${avgStrength}%`,
  },

  {
    title: 'Technical',

    description:
      'OD practitioners may also play a crucial role in aligning resources and strategies with an organization’s vision and values, refining systems, and enhancing collaborative design that empowers employees. They may also focus on continuous improvement and data-driven interventions, aligning technical needs with social dynamics that foster a healthy, high-performing organization.',

    yourInterest: `${technical_interest}%`,

    yourStrength: `${technical_strength}%`,

    avgInterest: `${avgInterest}%`,

    avgStrength: `${avgStrength}%`,
  },

  {
    title: 'Influence',

    description:
      'OD practitioners may also engage in influencing and transforming organizational habits of mind, fostering learning, sense-making, and truth-telling. Their strategic and ethical approach promotes deep reflection and builds consensus, aligning individual and team perspectives with organizational goals.',

    yourInterest: `${influence_interest}%`,

    yourStrength: `${influence_strength}%`,

    avgInterest: `${avgInterest}%`,

    avgStrength: `${avgStrength}%`,
  },
]

// ==========================================
// RENDER DOMAINS
// ==========================================

let currentYPage5 = 108

domains.forEach(
  domain => {

    // SECTION TITLE
    doc.setFontSize(11)

    doc.setTextColor(...dark)

    doc.setFont(
      'helvetica',
      'bold'
    )

    doc.text(
      `${domain.title}:`,
      20,
      currentYPage5
    )

    // DESCRIPTION
    doc.setFontSize(7.5)

    doc.setTextColor(90)

    doc.setFont(
      'helvetica',
      'normal'
    )

    const descSplit =
      doc.splitTextToSize(
        domain.description,
        95
      )

    doc.text(
      descSplit,
      20,
      currentYPage5 + 6
    )

    // RIGHT BOX
    doc.setFillColor(
      248,
      250,
      252
    )

    doc.roundedRect(
      123,
      currentYPage5 - 2,
      67,
      38,
      3,
      3,
      'F'
    )

    // YOUR SCORES
    doc.setFontSize(9)

    doc.setTextColor(...dark)

    doc.setFont(
      'helvetica',
      'bold'
    )

    doc.text(
      'Your Scores',
      128,
      currentYPage5 + 6
    )

    // VALUES
    doc.setFontSize(7.5)

    doc.setFont(
      'helvetica',
      'normal'
    )

    doc.text(
      `Interest: ${domain.yourInterest}`,
      128,
      currentYPage5 + 14
    )

    doc.text(
      `Strength: ${domain.yourStrength}`,
      128,
      currentYPage5 + 21
    )

    // AVERAGE
    doc.setFontSize(9)

    doc.setFont(
      'helvetica',
      'bold'
    )

    doc.text(
      'Average',
      128,
      currentYPage5 + 29
    )

    // AVERAGE VALUES
    doc.setFontSize(7.5)

    doc.setFont(
      'helvetica',
      'normal'
    )

    doc.text(
      `Interest: ${domain.avgInterest}`,
      128,
      currentYPage5 + 35
    )

    doc.text(
      `Strength: ${domain.avgStrength}`,
      128,
      currentYPage5 + 41
    )

    currentYPage5 += 58
  }
)

// ==========================================
// FOOTER
// ==========================================

drawFooter(5)

//PAGE 6

// ==========================================
// PAGE 6 - CATEGORIES
// ==========================================

doc.addPage()

drawHeader()

// ==========================================
// TITLE
// ==========================================

doc.setFontSize(20)

doc.setTextColor(...dark)

doc.setFont(
  'helvetica',
  'bold'
)

doc.text(
  'Categories',
  20,
  72
)

// ==========================================
// INTRO
// ==========================================

doc.setFontSize(8.5)

doc.setTextColor(90)

doc.setFont(
  'helvetica',
  'normal'
)

const categoriesIntroPage6 =
  'For each of the three domains (Social, Technical, and Influence) there are three competency categories. A fulfilling OD career will align your interests and strengths with roles that create clear value for your team and organization. The alignment of your strengths and interests has significant implications for building a meaningful and impactful OD career.'

const categoriesIntroSplitPage6 =
  doc.splitTextToSize(
    categoriesIntroPage6,
    170
  )

doc.text(
  categoriesIntroSplitPage6,
  20,
  82
)

// ==========================================
// SCENARIOS TITLE
// ==========================================

doc.setFontSize(10)

doc.setTextColor(...dark)

doc.setFont(
  'helvetica',
  'bold'
)

doc.text(
  'Scenarios You May Identify In Your Results',
  20,
  108
)

// ==========================================
// BOX 1
// ==========================================

doc.setFillColor(
  248,
  250,
  252
)

doc.roundedRect(
  20,
  115,
  170,
  28,
  3,
  3,
  'F'
)

doc.setFontSize(9)

doc.setTextColor(...dark)

doc.setFont(
  'helvetica',
  'bold'
)

doc.text(
  'High Strength / Low Interest',
  25,
  123
)

doc.setFontSize(7.5)

doc.setTextColor(90)

doc.setFont(
  'helvetica',
  'normal'
)

const box1Text =
  'You may be very strong at strategy planning, but not interested in it. If your goal is to find deeper meaning and effectiveness as an OD practitioner, consider taking a pause in developing this competency further.'

const box1Split =
  doc.splitTextToSize(
    box1Text,
    155
  )

doc.text(
  box1Split,
  25,
  130
)

// ==========================================
// BOX 2
// ==========================================

doc.setFillColor(
  248,
  250,
  252
)

doc.roundedRect(
  20,
  148,
  170,
  28,
  3,
  3,
  'F'
)

doc.setFontSize(9)

doc.setTextColor(...dark)

doc.setFont(
  'helvetica',
  'bold'
)

doc.text(
  'Low Strength / High Interest',
  25,
  156
)

doc.setFontSize(7.5)

doc.setTextColor(90)

doc.setFont(
  'helvetica',
  'normal'
)

const box2Text =
  'You may not demonstrate strength in consulting, but your scores may demonstrate immense interest. This provides excellent insight into stretch assignments, certifications, graduate programs, and future career opportunities.'

const box2Split =
  doc.splitTextToSize(
    box2Text,
    155
  )

doc.text(
  box2Split,
  25,
  163
)

// ==========================================
// BOX 3
// ==========================================

doc.setFillColor(
  248,
  250,
  252
)

doc.roundedRect(
  20,
  181,
  170,
  30,
  3,
  3,
  'F'
)

doc.setFontSize(9)

doc.setTextColor(...dark)

doc.setFont(
  'helvetica',
  'bold'
)

doc.text(
  'High Strength / High Interest',
  25,
  189
)

doc.setFontSize(7.5)

doc.setTextColor(90)

doc.setFont(
  'helvetica',
  'normal'
)

const box3Text =
  'This is an ideal scenario. When mastery of a competency aligns with significant interest, it indicates the type of work where you are most effective and most likely to experience joy, engagement, and fulfillment.'

const box3Split =
  doc.splitTextToSize(
    box3Text,
    155
  )

doc.text(
  box3Split,
  25,
  196
)

// ==========================================
// BOX 4
// ==========================================

doc.setFillColor(
  248,
  250,
  252
)

doc.roundedRect(
  20,
  216,
  170,
  32,
  3,
  3,
  'F'
)

doc.setFontSize(9)

doc.setTextColor(...dark)

doc.setFont(
  'helvetica',
  'bold'
)

doc.text(
  'Low Strength / Low Interest',
  25,
  224
)

doc.setFontSize(7.5)

doc.setTextColor(90)

doc.setFont(
  'helvetica',
  'normal'
)

const box4Text =
  'This is the least ideal scenario, as it indicates apathy or distaste toward a specific competency. Developing this competency may be necessary for your current role, but it may not align with your long-term calling or professional fulfillment.'

const box4Split =
  doc.splitTextToSize(
    box4Text,
    155
  )

doc.text(
  box4Split,
  25,
  231
)

// ==========================================
// FOOTER
// ==========================================

drawFooter(6)


// PAGE 7 - DOMAINS
// ==========================================
// ==========================================
// ==========================================
// PAGE 7 - DOMAINS
// ==========================================

doc.addPage()
drawHeader()

// ==========================================
// TITLE
// ==========================================

doc.setFontSize(20)
doc.setTextColor(...dark)
doc.setFont('helvetica', 'bold')

doc.text('Social Competency Scores', 20, 72)

// ==========================================
// INTRO TEXT
// ==========================================

doc.setFontSize(8)
doc.setTextColor(90)
doc.setFont('helvetica', 'normal')

const domainsIntroTextPage7 =
  'Psychology: Integrating psychological knowledge and skills to enhance workplace effectiveness, addressing individual motivation, group dynamics, team functionality, and social systems.'

const introSplitPage7 = doc.splitTextToSize(domainsIntroTextPage7, 170)

doc.text(introSplitPage7, 20, 82)

// ==========================================
// AVERAGES
// ==========================================

const avgInterestPage7 = (
  (Number(social_interest) +
   Number(technical_interest) +
   Number(influence_interest)) / 3
).toFixed(2)

const avgStrengthPage7 = (
  (Number(social_strength) +
   Number(technical_strength) +
   Number(influence_strength)) / 3
).toFixed(2)

// ==========================================
// DATA
// ==========================================

const domainsPage7 = [
  {
    title: 'Psychology',
    description:
      'Psychology: Integrating psychological knowledge and skills to enhance workplace effectiveness, addressing individual motivation, group dynamics, team functionality, and social systems.',
    yourInterest: `${social_interest}%`,
    yourStrength: `${social_strength}%`,
    avgInterest: `${avgInterestPage7}%`,
    avgStrength: `${avgStrengthPage7}%`,
  },
  {
    title: 'Culture',
    description:
      'Culture: Analyzing subconscious cultural patterns influencing behaviors within teams and organizations, fostering dialogue to challenge ingrained attitudes and improve working conditions and outcomes.',
    yourInterest: `${technical_interest}%`,
    yourStrength: `${technical_strength}%`,
    avgInterest: `${avgInterestPage7}%`,
    avgStrength: `${avgStrengthPage7}%`,
  },
  {
    title: 'Humanity',
    description:
      'Humanity: Prioritizing ethical, humanist, and spiritual dimensions, emphasizing responsibility, purpose, respect, and dignity to foster engagement, performance, and well-being.',
    yourInterest: `${influence_interest}%`,
    yourStrength: `${influence_strength}%`,
    avgInterest: `${avgInterestPage7}%`,
    avgStrength: `${avgStrengthPage7}%`,
  },
]

// ==========================================
// RENDER (OPTIMIZED LAYOUT)
// ==========================================

let currentYPage7 = 108
const cardHeight = 50

domainsPage7.forEach((domain) => {

  // ==========================================
  // LEFT CARD (TEXT)
  // ==========================================

  doc.setFillColor(248, 250, 252)
  doc.roundedRect(20, currentYPage7, 100, cardHeight, 3, 3, 'F')

  // TITLE
  doc.setFontSize(11)
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.text(domain.title, 25, currentYPage7 + 8)

  // DESCRIPTION
  doc.setFontSize(7.3)
  doc.setTextColor(90)
  doc.setFont('helvetica', 'normal')

  const desc = doc.splitTextToSize(domain.description, 95)
  doc.text(desc, 25, currentYPage7 + 15)

  // ==========================================
  // RIGHT CARD (SCORES)
  // ==========================================

  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(...primary)
  doc.setLineWidth(0.5)

  doc.roundedRect(125, currentYPage7, 65, cardHeight, 3, 3, 'FD')

  // YOUR SCORES
  doc.setFontSize(9)
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.text('Your Scores', 130, currentYPage7 + 8)

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`Interest: ${domain.yourInterest}`, 130, currentYPage7 + 16)
  doc.text(`Strength: ${domain.yourStrength}`, 130, currentYPage7 + 23)

  // AVERAGE
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Average', 130, currentYPage7 + 32)

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`Interest: ${domain.avgInterest}`, 130, currentYPage7 + 38)
  doc.text(`Strength: ${domain.avgStrength}`, 130, currentYPage7 + 44)

  // ==========================================
  // SPACING CONTROL
  // ==========================================

  currentYPage7 += cardHeight + 8
})

// ==========================================
// FOOTER
// ==========================================

drawFooter(7)

// ==========================================
// PAGE 8 - TECHNICAL COMPETENCY SCORES
// ==========================================
// ==========================================
// PAGE 8 - TECHNICAL COMPETENCY SCORES
// ==========================================

// ==========================================
// PAGE 8 - TECHNICAL COMPETENCY SCORES
// ==========================================

doc.addPage()
drawHeader()

// ==========================================
// TITLE
// ==========================================

doc.setFontSize(22)
doc.setTextColor(...dark)
doc.setFont('helvetica', 'bold')

doc.text(
  'Technical Competency Scores',
  20,
  72
)

// ==========================================
// SAFE HELPERS
// ==========================================

const avgPage8 = (arr) => {
  if (!arr || arr.length === 0) return 0

  return (
    arr.reduce(
      (sum, v) => sum + Number(v || 0),
      0
    ) / arr.length
  )
}

const pdfCalcPage8 = (indexes) => {
  return avgPage8(
    indexes.map(i => Number(getScore(i) || 0))
  ).toFixed(2)
}

// ==========================================
// CALCULATED SCORES (100% FROM getScore)
// ==========================================

// STRATEGY
const strategy_interest = pdfCalcPage8([8])

const strategy_strength = pdfCalcPage8([
  23,
  24,
  25,
])

// DESIGN
const design_interest = pdfCalcPage8([9])

const design_strength = pdfCalcPage8([
  26,
  27,
  28,
])

// PERFORMANCE
const performance_interest = pdfCalcPage8([10])

const performance_strength = pdfCalcPage8([
  29,
  30,
  31,
])

// GLOBAL AVERAGES
const avgTechnicalInterest = avgPage8([
  strategy_interest,
  design_interest,
  performance_interest,
]).toFixed(2)

const avgTechnicalStrength = avgPage8([
  strategy_strength,
  design_strength,
  performance_strength,
]).toFixed(2)

// ==========================================
// DATA
// ==========================================

const technicalCategoriesPage8 = [
  {
    title: 'Strategy',
    description:
      'Aligning resources with strategic goals, continuously developing and assessing strategies, and using diverse planning approaches to ensure adaptable plans in dynamic business environments.',

    yourInterest: `${strategy_interest}%`,
    yourStrength: `${strategy_strength}%`,
    avgInterest: `${avgTechnicalInterest}%`,
    avgStrength: `${avgTechnicalStrength}%`,
  },
  {
    title: 'Design',
    description:
      'Refining systems and structures to enhance individual and team performance and fostering interdepartmental coordination to support a collaborative culture aligned with strategic goals.',

    yourInterest: `${design_interest}%`,
    yourStrength: `${design_strength}%`,
    avgInterest: `${avgTechnicalInterest}%`,
    avgStrength: `${avgTechnicalStrength}%`,
  },
  {
    title: 'Performance',
    description:
      'Ensuring organizations achieve strategic goals using measurable indicators and data-informed interventions that align technical needs with social dynamics, enhancing decision-making and organizational performance.',

    yourInterest: `${performance_interest}%`,
    yourStrength: `${performance_strength}%`,
    avgInterest: `${avgTechnicalInterest}%`,
    avgStrength: `${avgTechnicalStrength}%`,
  },
]

// ==========================================
// LAYOUT
// ==========================================

const cardHeightPage8 = 50
let currentYPage8 = 88

// ==========================================
// RENDER
// ==========================================

technicalCategoriesPage8.forEach((item) => {

  // shadow
  doc.setFillColor(235, 235, 235)
  doc.roundedRect(21, currentYPage8 + 1, 170, cardHeightPage8, 4, 4, 'F')

  // card
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(20, currentYPage8, 170, cardHeightPage8, 4, 4, 'F')

  // left panel
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(20, currentYPage8, 118, cardHeightPage8, 4, 4, 'F')

  // title
  doc.setFontSize(12)
  doc.setTextColor(...primary)
  doc.setFont('helvetica', 'bold')

  doc.text(item.title, 26, currentYPage8 + 10)

  // description
  doc.setFontSize(7.2)
  doc.setTextColor(90)
  doc.setFont('helvetica', 'normal')

  const desc = doc.splitTextToSize(item.description, 102)
  doc.text(desc, 26, currentYPage8 + 18)

  // right box
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(...primary)
  doc.setLineWidth(0.7)

  doc.roundedRect(
    142,
    currentYPage8 + 3,
    47,
    cardHeightPage8 - 6,
    3,
    3,
    'FD'
  )

  // your scores
  doc.setFontSize(8.5)
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')

  doc.text('Your Scores', 146, currentYPage8 + 11)

  doc.setFontSize(7.2)
  doc.setFont('helvetica', 'normal')

  doc.text(`Interest: ${item.yourInterest}`, 146, currentYPage8 + 19)
  doc.text(`Strength: ${item.yourStrength}`, 146, currentYPage8 + 26)

  // divider
  doc.setDrawColor(220)
  doc.line(145, currentYPage8 + 31, 184, currentYPage8 + 31)

  // average
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')

  doc.text('Average', 146, currentYPage8 + 38)

  doc.setFontSize(7.2)
  doc.setFont('helvetica', 'normal')

  doc.text(`Interest: ${item.avgInterest}`, 146, currentYPage8 + 45)
  doc.text(`Strength: ${item.avgStrength}`, 146, currentYPage8 + 51)

  currentYPage8 += cardHeightPage8 + 10
})

// ==========================================
// FOOTER
// ==========================================

drawFooter(8)
// ==========================================
// PAGE 9 - INFLUENCE COMPETENCY SCORES
// ==========================================
// ==========================================
// PAGE 9
// ==========================================
// ==========================================
// PAGE 9 - INFLUENCE COMPETENCY SCORES
// ==========================================

doc.addPage()
drawHeader()

// ==========================================
// TITLE
// ==========================================

doc.setFontSize(22)
doc.setTextColor(...dark)
doc.setFont('helvetica', 'bold')

doc.text(
  'Influence Competency Scores',
  20,
  72
)

// ==========================================
// SAFE HELPERS
// ==========================================

const avgPage9 = (arr) => {
  if (!arr || arr.length === 0) return 0

  const valid = arr.map(Number)

  return (
    valid.reduce((a, b) => a + b, 0) /
    valid.length
  )
}

// ==========================================
// CALCULATED VALUES
// ==========================================

// CONSULTING
const consulting_interest =
  avgPage9([
    getScore(11)
  ]).toFixed(2)

const consulting_strength =
  avgPage9([
    getScore(32),
    getScore(33),
    getScore(34)
  ]).toFixed(2)

// LEARNING
const learning_interest =
  avgPage9([
    getScore(12)
  ]).toFixed(2)

const learning_strength =
  avgPage9([
    getScore(35),
    getScore(36),
    getScore(37)
  ]).toFixed(2)

// CHANGE
const change_interest =
  avgPage9([
    getScore(13)
  ]).toFixed(2)

const change_strength =
  avgPage9([
    getScore(38),
    getScore(39),
    getScore(40)
  ]).toFixed(2)

// ==========================================
// AVERAGES
// ==========================================

const avgInfluenceInterest =
  avgPage9([
    consulting_interest,
    learning_interest,
    change_interest
  ]).toFixed(2)

const avgInfluenceStrength =
  avgPage9([
    consulting_strength,
    learning_strength,
    change_strength
  ]).toFixed(2)

// ==========================================
// DATA
// ==========================================

const influenceCategoriesPage9 = [
  {
    title: 'Consulting',

    description:
      'Engaging clients through structured, strategic, and ethical processes, leveraging organizational knowledge and personal competencies like self-awareness and critical reflection.',

    yourInterest: `${consulting_interest}%`,
    yourStrength: `${consulting_strength}%`,

    avgInterest: `${avgInfluenceInterest}%`,
    avgStrength: `${avgInfluenceStrength}%`,
  },

  {
    title: 'Learning',

    description:
      'Facilitating dialogue, ideation, coaching, and transforming organizations into learning systems that generate and promote innovation.',

    yourInterest: `${learning_interest}%`,
    yourStrength: `${learning_strength}%`,

    avgInterest: `${avgInfluenceInterest}%`,
    avgStrength: `${avgInfluenceStrength}%`,
  },

  {
    title: 'Change',

    description:
      'Leveraging change management knowledge and insights to design goal-oriented interventions, facilitate stakeholder consensus, and manage organizational changes efficiently to ensure smooth transitions and goal attainment.',

    yourInterest: `${change_interest}%`,
    yourStrength: `${change_strength}%`,

    avgInterest: `${avgInfluenceInterest}%`,
    avgStrength: `${avgInfluenceStrength}%`,
  },
]

// ==========================================
// STYLES
// ==========================================

const influenceCardHeight = 50
let currentYPage9 = 88

// ==========================================
// RENDER
// ==========================================

influenceCategoriesPage9.forEach((item) => {

  // SHADOW
  doc.setFillColor(235, 235, 235)

  doc.roundedRect(
    21,
    currentYPage9 + 1,
    170,
    influenceCardHeight,
    4,
    4,
    'F'
  )

  // MAIN CARD
  doc.setFillColor(255, 255, 255)

  doc.roundedRect(
    20,
    currentYPage9,
    170,
    influenceCardHeight,
    4,
    4,
    'F'
  )

  // ==========================================
  // LEFT CONTENT
  // ==========================================

  doc.setFillColor(248, 250, 252)

  doc.roundedRect(
    20,
    currentYPage9,
    118,
    influenceCardHeight,
    4,
    4,
    'F'
  )

  // TITLE
  doc.setFontSize(12)
  doc.setTextColor(...primary)
  doc.setFont('helvetica', 'bold')

  doc.text(
    item.title,
    26,
    currentYPage9 + 10
  )

  // DESCRIPTION
  doc.setFontSize(7.2)
  doc.setTextColor(90)
  doc.setFont('helvetica', 'normal')

  const descSplitPage9 =
    doc.splitTextToSize(
      item.description,
      102
    )

  doc.text(
    descSplitPage9,
    26,
    currentYPage9 + 18
  )

  // ==========================================
  // RIGHT SCORE BOX
  // ==========================================

  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(...primary)
  doc.setLineWidth(0.7)

  doc.roundedRect(
    142,
    currentYPage9 + 3,
    47,
    influenceCardHeight - 6,
    3,
    3,
    'FD'
  )

  // YOUR SCORES
  doc.setFontSize(8.5)
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')

  doc.text(
    'Your Scores',
    146,
    currentYPage9 + 11
  )

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')

  doc.text(
    `Interest: ${item.yourInterest}`,
    146,
    currentYPage9 + 19
  )

  doc.text(
    `Strength: ${item.yourStrength}`,
    146,
    currentYPage9 + 26
  )

  // DIVIDER
  doc.setDrawColor(220)

  doc.line(
    145,
    currentYPage9 + 31,
    184,
    currentYPage9 + 31
  )

  // AVERAGE
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')

  doc.text(
    'Average',
    146,
    currentYPage9 + 38
  )

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')

  doc.text(
    `Interest: ${item.avgInterest}`,
    146,
    currentYPage9 + 45
  )

  doc.text(
    `Strength: ${item.avgStrength}`,
    146,
    currentYPage9 + 51
  )

  // NEXT CARD
  currentYPage9 += influenceCardHeight + 10
})

// ==========================================
// FOOTER
// ==========================================

drawFooter(9)
// ==========================================
// PAGE 10 - CLUSTERS (DYNAMIC VERSION)
// ==========================================
// ==========================================
// PAGE 10 - CLUSTERS
// ==========================================


doc.addPage()
drawHeader()

// ==========================================
// TITLE
// ==========================================

doc.setFontSize(22)
doc.setTextColor(...dark)
doc.setFont('helvetica', 'bold')

doc.text('Clusters', 20, 72)

// ==========================================
// INTRO
// ==========================================

doc.setFontSize(8)
doc.setTextColor(90)
doc.setFont('helvetica', 'normal')

const clustersIntroPage10 =
  'The outside ring in this illustration contains 27 different OD competencies that a practitioner may choose to develop and align with a career that has the type of impact, identity, and approach they prefer. This section provides descriptions of each competency along with your scores and average scores from participants.'

const introSplitPage10 =
  doc.splitTextToSize(clustersIntroPage10, 170)

doc.text(introSplitPage10, 20, 82)

// ==========================================
// SAFE HELPERS (FIX REAL PROBLEM)
// ==========================================

const avgPage10 = (arr) => {
  if (!arr || arr.length === 0) return 0

  const clean = arr
    .map(v => Number(v))
    .filter(v => !isNaN(v))

  if (clean.length === 0) return 0

  return clean.reduce((a, b) => a + b, 0) / clean.length
}

const scorePage10 = (index) => {
  const val = Number(getScore(index))
  return isNaN(val) ? 0 : val.toFixed(2)
}

const safeGet = (index) => {
  const val = Number(getScore(index))
  return isNaN(val) ? 0 : val
}

// ==========================================
// GLOBAL CALCULATIONS (FIXED)
// ==========================================

const humanityAveragePage10 =
  avgPage10([
    safeGet(14),
    safeGet(15),
    safeGet(16),
  ]).toFixed(2)

const psychologyAveragePage10 =
  avgPage10([
    safeGet(17),
    safeGet(18),
    safeGet(19),
  ]).toFixed(2)

const cultureAveragePage10 =
  avgPage10([
    safeGet(20),
    safeGet(21),
    safeGet(22),
  ]).toFixed(2)

// ==========================================
// ROW BUILDER
// ==========================================
const buildClusterRowsPage10 = (list, average) => {
  return list.map(item => [
    item.name,
    item.desc,
    `${scorePage10(item.scoreIndex)}%`,
    `${average}%`,
  ])
}

// ==========================================
// TABLE
// ==========================================

function drawClusterTablePage10(title, rows, yStart) {

  doc.setFontSize(11)
  doc.setTextColor(...primary)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 20, yStart)

  autoTable(doc, {
    startY: yStart + 5,
    head: [['Cluster', 'Description', 'Your Score', 'Average']],
    body: rows,

    margin: { left: 20, right: 20 },

    styles: {
      fontSize: 7,
      cellPadding: 3,
      valign: 'middle',
      textColor: [70, 70, 70],
      lineColor: [230, 230, 230],
      lineWidth: 0.2,
    },

    headStyles: {
      fillColor: primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },

    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },

    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      1: { cellWidth: 88 },
      2: { cellWidth: 26, halign: 'center' },
      3: { cellWidth: 26, halign: 'center' },
    },
  })
}

// ==========================================
// DATA
// ==========================================

const humanityRowsPage10 = buildClusterRowsPage10([
  {
    name: 'DE&I',
    desc: 'Inspiring, developing, and sustaining measurable diversity, equity, and inclusion.',
    scoreIndex: 14,
  },
  {
    name: 'Ethics & Citizenship',
    desc: 'Cultivating ethical decision making and citizenship.',
    scoreIndex: 15,
  },
  {
    name: 'Meaning & Well-being',
    desc: 'Aligning purpose with organizational mission.',
    scoreIndex: 16,
  },
], humanityAveragePage10)


const psychologyRowsPage10 = buildClusterRowsPage10([
  {
    name: 'Org Behavior',
    desc: 'Motivating employees and addressing resistance to change.',
    scoreIndex: 17,
  },
  {
    name: 'Team Development',
    desc: 'Developing cohesive and adaptive teams.',
    scoreIndex: 18,
  },
  {
    name: 'Group Dynamics',
    desc: 'Managing dysfunctional group behavior.',
    scoreIndex: 19,
  },
], psychologyAveragePage10)

const cultureRowsPage10 = buildClusterRowsPage10([
  {
    name: 'Mission Alignment',
    desc: 'Align culture with vision and values.',
    scoreIndex: 20,
  },
  {
    name: 'Surfacing Assumptions',
    desc: 'Address limiting assumptions.',
    scoreIndex: 21,
  },
  {
    name: 'Psychological Safety',
    desc: 'Create safe discussion environments.',
    scoreIndex: 22,
  },
],cultureAveragePage10)

// ==========================================
// RENDER
// ==========================================

let currentYPage10 = 108

drawClusterTablePage10('Social - Humanity', humanityRowsPage10, currentYPage10)
currentYPage10 = doc.lastAutoTable.finalY + 10

drawClusterTablePage10('Social - Psychology', psychologyRowsPage10, currentYPage10)
currentYPage10 = doc.lastAutoTable.finalY + 10

drawClusterTablePage10('Social - Culture', cultureRowsPage10, currentYPage10)

// ==========================================
// FOOTER
// ==========================================

drawFooter(10)
// ==========================================
// PAGE 11
// ==========================================
// ==========================================
// PAGE 11 - TECHNICAL
// ==========================================

doc.addPage()
drawHeader()

// ==========================================
// TITLE
// ==========================================

doc.setFontSize(22)
doc.setTextColor(...dark)
doc.setFont('helvetica', 'bold')

doc.text('Technical', 20, 75)

// ==========================================
// SAFE HELPERS
// ==========================================

const avgTechnicalPage11 = (
  arr
) => {

  if (!arr || arr.length === 0)
    return 0

  return (
    arr.reduce(
      (sum, value) =>
        sum + Number(value || 0),
      0
    ) / arr.length
  )
}

const pdfCalcPage11 = (
  indexes
) => {

  return avgTechnicalPage11(
    indexes.map(index =>
      Number(
        getScore(index) || 0
      )
    )
  ).toFixed(2)
}

// ==========================================
// CALCULATED SCORES
// ==========================================

// DESIGN
const organizationalAgility =
  pdfCalcPage11([
    32,
    33,
    34,
  ])

const systemsStructures =
  pdfCalcPage11([
    32,
    33,
    34,
  ])

const efficiencyEffectiveness =
  pdfCalcPage11([
    32,
    33,
    34,
  ])

// PERFORMANCE
const dataAnalysisPresentation =
  pdfCalcPage11([
    35,
    36,
    37,
  ])

const balancedScorecard =
  pdfCalcPage11([
    38,
    39,
    40,
  ])

// ==========================================
// DATA STRUCTURE
// ==========================================

const technicalSectionsPage11 = [

  // DESIGN
  {
    section: 'Design',

    items: [
      {
        title:
          'Organizational Agility',

        description:
          'Design agile organizational systems that respond to changes in the environment.',

        your:
          organizationalAgility,

        average: '44.69',
      },

      {
        title:
          'Systems & Structures',

        description:
          'Organization design principles including span of control and learning networks.',

        your:
          systemsStructures,

        average: '40.80',
      },

      {
        title:
          'Efficiency & Effectiveness',

        description:
          'Improving processes through assessment of inputs, outputs and stakeholders.',

        your:
          efficiencyEffectiveness,

        average: '52.96',
      },
    ],
  },

  // PERFORMANCE
  {
    section: 'Performance',

    items: [
      {
        title:
          'Data Analysis & Presentation',

        description:
          'Using organizational data to generate actionable insights.',

        your:
          dataAnalysisPresentation,

        average: '62.86',
      },

      {
        title:
          'Balanced Scorecard',

        description:
          'Developing performance indicators aligned with culture.',

        your:
          balancedScorecard,

        average: '44.38',
      },
    ],
  },
]

// ==========================================
// BLOCK RENDERER
// ==========================================

function drawTechnicalBlockPage11(
  item,
  y
) {

  // SHADOW
  doc.setFillColor(
    235,
    235,
    235
  )

  doc.roundedRect(
    21,
    y - 4,
    170,
    28,
    4,
    4,
    'F'
  )

  // MAIN CARD
  doc.setFillColor(
    255,
    255,
    255
  )

  doc.roundedRect(
    20,
    y - 5,
    170,
    28,
    4,
    4,
    'F'
  )

  // LEFT AREA
  doc.setFillColor(
    248,
    250,
    252
  )

  doc.roundedRect(
    20,
    y - 5,
    118,
    28,
    4,
    4,
    'F'
  )

  // TITLE
  doc.setFontSize(10)

  doc.setTextColor(...primary)

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.text(
    item.title,
    25,
    y + 2
  )

  // DESCRIPTION
  doc.setFontSize(7.3)

  doc.setTextColor(90)

  doc.setFont(
    'helvetica',
    'normal'
  )

  const desc =
    doc.splitTextToSize(
      item.description,
      100
    )

  doc.text(
    desc,
    25,
    y + 8
  )

  // RIGHT SCORE BOX
  doc.setFillColor(
    255,
    255,
    255
  )

  doc.setDrawColor(...primary)

  doc.setLineWidth(0.7)

  doc.roundedRect(
    142,
    y - 2,
    47,
    22,
    3,
    3,
    'FD'
  )

  // YOUR SCORE
  doc.setFontSize(8)

  doc.setTextColor(...dark)

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.text(
    'Your Score',
    146,
    y + 3
  )

  doc.setFontSize(13)

  doc.text(
    `${item.your}%`,
    165,
    y + 10,
    {
      align: 'center',
    }
  )

  // DIVIDER
  doc.setDrawColor(220)

  doc.line(
    145,
    y + 12,
    184,
    y + 12
  )

  // AVERAGE
  doc.setFontSize(8)

  doc.text(
    'Average',
    146,
    y + 18
  )

  doc.setFontSize(13)

  doc.text(
    `${item.average}%`,
    165,
    y + 25,
    {
      align: 'center',
    }
  )
}

// ==========================================
// AUTO LAYOUT
// ==========================================

let yPage11 = 92

technicalSectionsPage11.forEach(
  (section) => {

    // SECTION TITLE
    doc.setFontSize(15)

    doc.setTextColor(...dark)

    doc.setFont(
      'helvetica',
      'bold'
    )

    doc.text(
      section.section,
      20,
      yPage11
    )

    yPage11 += 10

    // ITEMS
    section.items.forEach(
      (item) => {

        drawTechnicalBlockPage11(
          item,
          yPage11
        )

        yPage11 += 36
      }
    )

    yPage11 += 10
  }
)

// ==========================================
// FOOTER
// ==========================================

drawFooter(11)

// ==========================================
// PAGE 12
// ==========================================
// ==========================================
// PAGE 12
// ==========================================

// ==========================================
// PAGE 12 - INFLUENCE
// ==========================================

doc.addPage()
drawHeader()

// ==========================================
// TITLE
// ==========================================

doc.setFontSize(22)
doc.setTextColor(...dark)
doc.setFont('helvetica', 'bold')

doc.text(
  'Influence',
  20,
  75
)

// ==========================================
// SAFE HELPERS
// ==========================================

const avgPage12 = (arr) => {

  if (!arr || arr.length === 0)
    return 0

  return (
    arr.reduce(
      (sum, value) =>
        sum + Number(value || 0),
      0
    ) / arr.length
  )
}

const pdfCalcPage12 = (
  indexes
) => {

  return avgPage12(
    indexes.map(index =>
      Number(
        getScore(index) || 0
      )
    )
  ).toFixed(2)
}

const buildItemsPage12 = (
  items
) => {

  return items.map(item => ({
    ...item,

    your:
      pdfCalcPage12(
        item.indices
      ),
  }))
}

// ==========================================
// DATA (DYNAMIC)
// ==========================================

const influenceSectionsPage12 = [

  // LEARNING
  {
    section: 'Learning',

    items:
      buildItemsPage12([
        {
          title:
            'Inquiry & Innovation',

          description:
            'Facilitating inquiry, dialogue, creative thinking and experimentation.',

          indices: [
            32,
            33,
            34,
          ],

          average: '64.53',
        },

        {
          title:
            'Learning Organization',

          description:
            'Encouraging organizational learning systems and innovation.',

          indices: [
            35,
            36,
            37,
          ],

          average: '59.48',
        },

        {
          title:
            'Leadership Development & Coaching',

          description:
            'Helping leaders manage challenges through dialogue and coaching.',

          indices: [
            38,
            39,
            40,
          ],

          average: '58.01',
        },
      ]),
  },

  // CONSULTING
  {
    section: 'Consulting',

    items:
      buildItemsPage12([
        {
          title:
            'Use of Self',

          description:
            'Awareness of self, system, integrity, trust and inclusion.',

          indices: [
            11,
            12,
          ],

          average: '61.33',
        },

        {
          title:
            'Client Management',

          description:
            'Identifying sponsors, diagnosing needs and executing interventions.',

          indices: [
            13,
            14,
          ],

          average: '58.30',
        },
      ]),
  },
]

// ==========================================
// BLOCK RENDERER
// ==========================================

function drawInfluenceBlockPage12(
  item,
  y
) {

  // SHADOW
  doc.setFillColor(
    235,
    235,
    235
  )

  doc.roundedRect(
    21,
    y - 4,
    170,
    28,
    4,
    4,
    'F'
  )

  // MAIN CARD
  doc.setFillColor(
    255,
    255,
    255
  )

  doc.roundedRect(
    20,
    y - 5,
    170,
    28,
    4,
    4,
    'F'
  )

  // LEFT SIDE
  doc.setFillColor(
    248,
    250,
    252
  )

  doc.roundedRect(
    20,
    y - 5,
    118,
    28,
    4,
    4,
    'F'
  )

  // TITLE
  doc.setFontSize(9.5)

  doc.setTextColor(...primary)

  doc.setFont(
    'helvetica',
    'bold'
  )

  const titleSplit =
    doc.splitTextToSize(
      item.title,
      32
    )

  doc.text(
    titleSplit,
    24,
    y + 1
  )

  // DESCRIPTION
  doc.setFontSize(7.2)

  doc.setTextColor(90)

  doc.setFont(
    'helvetica',
    'normal'
  )

  const desc =
    doc.splitTextToSize(
      item.description,
      60
    )

  doc.text(
    desc,
    58,
    y + 2
  )

  // RIGHT SCORE BOX
  doc.setFillColor(
    255,
    255,
    255
  )

  doc.setDrawColor(...primary)

  doc.setLineWidth(0.7)

  doc.roundedRect(
    142,
    y - 2,
    47,
    22,
    3,
    3,
    'FD'
  )

  // YOUR SCORE
  doc.setFontSize(8)

  doc.setTextColor(...dark)

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.text(
    'Your Score',
    146,
    y + 3
  )

  doc.setFontSize(13)

  doc.text(
    `${item.your}%`,
    165,
    y + 10,
    {
      align: 'center',
    }
  )

  // DIVIDER
  doc.setDrawColor(220)

  doc.line(
    145,
    y + 12,
    184,
    y + 12
  )

  // AVERAGE
  doc.setFontSize(8)

  doc.text(
    'Average',
    146,
    y + 18
  )

  doc.setFontSize(13)

  doc.text(
    `${item.average}%`,
    165,
    y + 25,
    {
      align: 'center',
    }
  )
}

// ==========================================
// AUTO LAYOUT
// ==========================================

let yPage12 = 92

influenceSectionsPage12.forEach(
  (section) => {

    // SECTION TITLE
    doc.setFontSize(15)

    doc.setTextColor(...dark)

    doc.setFont(
      'helvetica',
      'bold'
    )

    doc.text(
      section.section,
      20,
      yPage12
    )

    yPage12 += 10

    // ITEMS
    section.items.forEach(
      (item) => {

        drawInfluenceBlockPage12(
          item,
          yPage12
        )

        yPage12 += 36
      }
    )

    yPage12 += 10
  }
)

// ==========================================
// FOOTER
// ==========================================

drawFooter(12)

// ==========================================
// PAGE 13
// ==========================================
// ==========================================
// PAGE 13 - INFLUENCE (FULL DYNAMIC)
// ==========================================
// ==========================================
// PAGE 13 - INFLUENCE
// ==========================================

doc.addPage()
drawHeader()

// ==========================================
// TITLE
// ==========================================

doc.setFontSize(22)
doc.setTextColor(...dark)
doc.setFont('helvetica', 'bold')

doc.text(
  'Influence',
  20,
  75
)

// ==========================================
// SAFE HELPERS
// ==========================================

const avgPage13 = (arr) => {

  if (!arr || arr.length === 0)
    return 0

  return (
    arr.reduce(
      (sum, value) =>
        sum + Number(value || 0),
      0
    ) / arr.length
  )
}

const pdfCalcPage13 = (
  indexes
) => {

  return avgPage13(
    indexes.map(index =>
      Number(
        getScore(index) || 0
      )
    )
  ).toFixed(2)
}

const buildItemsPage13 = (
  items
) => {

  return items.map(item => ({
    ...item,

    your:
      pdfCalcPage13(
        item.indices
      ),
  }))
}

// ==========================================
// DATA
// ==========================================

const influenceSectionsPage13 = [

  // LEARNING
  {
    section: 'Learning',

    items:
      buildItemsPage13([
        {
          title:
            'Inquiry & Innovation',

          description:
            'Facilitating inquiry, dialogue, creative thinking and experimentation.',

          indices: [
            32,
            33,
            34,
          ],

          average: '64.53',
        },

        {
          title:
            'Learning Organization',

          description:
            'Encouraging organizational learning systems and innovation.',

          indices: [
            35,
            36,
            37,
          ],

          average: '59.48',
        },

        {
          title:
            'Leadership Development & Coaching',

          description:
            'Helping leaders manage challenges through dialogue and coaching.',

          indices: [
            38,
            39,
            40,
          ],

          average: '58.01',
        },
      ]),
  },

  // CONSULTING
  {
    section: 'Consulting',

    items:
      buildItemsPage13([
        {
          title:
            'Use of Self',

          description:
            'Awareness of self, system, integrity, trust and inclusion.',

          indices: [
            11,
            12,
          ],

          average: '61.33',
        },

        {
          title:
            'Client Management',

          description:
            'Identifying sponsors, diagnosing needs and executing interventions.',

          indices: [
            13,
            14,
          ],

          average: '58.30',
        },
      ]),
  },
]

// ==========================================
// BLOCK RENDERER
// ==========================================

function drawInfluenceBlockPage13(
  item,
  y
) {

  // SHADOW
  doc.setFillColor(
    235,
    235,
    235
  )

  doc.roundedRect(
    21,
    y - 4,
    170,
    28,
    4,
    4,
    'F'
  )

  // MAIN CARD
  doc.setFillColor(
    255,
    255,
    255
  )

  doc.roundedRect(
    20,
    y - 5,
    170,
    28,
    4,
    4,
    'F'
  )

  // LEFT CONTENT
  doc.setFillColor(
    248,
    250,
    252
  )

  doc.roundedRect(
    20,
    y - 5,
    118,
    28,
    4,
    4,
    'F'
  )

  // TITLE
  doc.setFontSize(9.5)

  doc.setTextColor(...primary)

  doc.setFont(
    'helvetica',
    'bold'
  )

  const titleSplit =
    doc.splitTextToSize(
      item.title,
      32
    )

  doc.text(
    titleSplit,
    24,
    y + 1
  )

  // DESCRIPTION
  doc.setFontSize(7.2)

  doc.setTextColor(90)

  doc.setFont(
    'helvetica',
    'normal'
  )

  const desc =
    doc.splitTextToSize(
      item.description,
      60
    )

  doc.text(
    desc,
    58,
    y + 2
  )

  // RIGHT SCORE BOX
  doc.setFillColor(
    255,
    255,
    255
  )

  doc.setDrawColor(...primary)

  doc.setLineWidth(0.7)

  doc.roundedRect(
    142,
    y - 2,
    47,
    22,
    3,
    3,
    'FD'
  )

  // YOUR SCORE
  doc.setFontSize(8)

  doc.setTextColor(...dark)

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.text(
    'Your Score',
    146,
    y + 3
  )

  doc.setFontSize(13)

  doc.text(
    `${item.your}%`,
    165,
    y + 10,
    {
      align: 'center',
    }
  )

  // DIVIDER
  doc.setDrawColor(220)

  doc.line(
    145,
    y + 12,
    184,
    y + 12
  )

  // AVERAGE
  doc.setFontSize(8)

  doc.text(
    'Average',
    146,
    y + 18
  )

  doc.setFontSize(13)

  doc.text(
    `${item.average}%`,
    165,
    y + 25,
    {
      align: 'center',
    }
  )
}

// ==========================================
// AUTO LAYOUT
// ==========================================

let yPage13 = 92

influenceSectionsPage13.forEach(
  (section) => {

    // SECTION TITLE
    doc.setFontSize(15)

    doc.setTextColor(...dark)

    doc.setFont(
      'helvetica',
      'bold'
    )

    doc.text(
      section.section,
      20,
      yPage13
    )

    yPage13 += 10

    // ITEMS
    section.items.forEach(
      (item) => {

        drawInfluenceBlockPage13(
          item,
          yPage13
        )

        yPage13 += 36
      }
    )

    yPage13 += 10
  }
)

// ==========================================
// FOOTER
// ==========================================

drawFooter(13)


// ==========================================
// PDF NAME
// ==========================================
// ==========================================
// PDF NAME
// ==========================================

const pdfName =
  `MOST20_${data?.nombre || 'report'}.pdf`

// ==========================================
// DOWNLOAD PDF
// ==========================================

doc.save(pdfName)

// ==========================================
// PDF BLOB
// ==========================================

const pdfBlob = doc.output('blob')

// ==========================================
// DEBUG
// ==========================================

console.log('DATA:', data)
console.log('EMAIL:', data?.correo)

// ==========================================
// FORM DATA
// ==========================================

const formData = new FormData()

// PDF
formData.append(
  'pdf',
  pdfBlob,
  pdfName
)

// NOMBRE
formData.append(
  'nombre',
  data?.nombre || ''
)

// EMAIL
formData.append(
  'email',
  data?.email || ''
)

// RESULTADOS
formData.append(
  'average',
  average.toString()
)

formData.append(
  'social_interest',
   social_interest.toString()
)

formData.append(
  'social_strength',
  social_strength.toString()
)

formData.append(
  'technical_interest',
  technical_interest.toString()
)

formData.append(
  'technical_strength',
  technical_strength.toString()
)

formData.append(
  'influence_interest',
  influence_interest.toString()
)

formData.append(
  'influence_strength',
  influence_strength.toString()
)



console.log("FORMDATA CONTENT:")
for (let pair of formData.entries()) {
  console.log(pair[0], pair[1])
}
// ==========================================
// SEND EMAIL
// ==========================================

try {

 const res= await axios.post(
  'http://localhost:8000/send-pdf-email',
  formData
)

  console.log(
    'EMAIL SENT:',
    res.data
  )

}
catch (error) {

  console.error(
    'EMAIL ERROR:',
    error
  )

}

 // TODO TU PDF PROFESIONAL

  return doc.output('blob')


  // ==========================================
  }

  async function handleSubmit(respuestas) {

  if (submitRef.current) return

submitRef.current = true
setEnviando(true)

  try {

    setRespuestas(respuestas)

    const pdfBlob = await downloadPDF(respuestas)

    const formData = new FormData()

    formData.append(
      'pdf',
      pdfBlob,
      `MOST20_${data.nombre}.pdf`
    )

    const res = await axios.post(
      'http://localhost:8000/send-pdf-email',
      formData
    )

    console.log(res.data)

    setCompletado(true)

  } catch (error) {

    console.error(error)
    alert('Submission failed. Please try again.')

  } finally {
    submitRef.current = false
setEnviando(false)
  }
}

  // ==========================================
  // LOADING
  // ==========================================

if (data) {

  console.log(
    'DATA COMPLETA:',
    data
  )

}

if (estado === 'loading')

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

        . Your MOST 2.0 responses have been recorded.

      </p>


    </CenteredMessage>

  )
}

// ==========================================
// MOST / 360
// ==========================================
console.log(data)
const isMost2 = data?.form_type === 'most2'
const is360 = data?.form_type === '360'
// ==========================================
// MAIN
// ==========================================

return (

  <div className="min-h-screen bg-gray-50">

    <div className="bg-dark text-white px-6 py-8 text-center">

      <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">

        {isMost2
          ? 'MOST 2.0 Assessment'
          : '360 MOST Assessment'}

      </p>

      <h1 className="text-xl font-bold">

        
            {isMost2 && `MOST 2.0: ${data.nombre}`}
            {is360 && `360 Assessment: ${data.nombre}`}

      </h1>

      <p className="text-gray-400 text-sm mt-1">

        {isMost2
          ? 'Answer each statement honestly based on your experience.'
          : 'Rate each statement based on your current work environment.'}

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
        preguntas={data?.preguntas || []}
        onSubmit={handleSubmit}
        storageKey={`self_${token}`}
      />

    </div>

  </div>
)

  
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
}