import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import axios from '../api/client'

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const HOW_IT_WORKS = {
  most_360: [
    { step: '01', title: 'Register',          desc: 'Select a plan and enter your details to start your Individual 360 assessment.' },
    { step: '02', title: 'Invite evaluators', desc: 'Add colleagues or managers — they receive a private link to rate you.' },
    { step: '03', title: 'See your report',   desc: 'Once all evaluators respond, view your interactive gap analysis.' },
  ],
  'most_2.0': [
    { step: '01', title: 'Register',            desc: 'Enter your details to start your MOST 2.0 self-assessment.' },
    { step: '02', title: 'Complete assessment', desc: 'Answer all competency and vocational interest questions at your own pace.' },
    { step: '03', title: 'Receive your report', desc: 'Download your personalized PDF report with strengths and interest analysis.' },
  ],
}

const META = {
  most_360: {
    badge:   '360 Individual Assessment',
    heading: 'Individual\n360 Feedback',
    subhead: 'Gather honest perspectives from the people who know your work best — peers, managers, and direct reports.',
    cta:     'Start 360 assessment →',
  },
  'most_2.0': {
    badge:   'MOST 2.0 Self-Assessment',
    heading: 'MOST 2.0\nAssessment',
    subhead: 'Discover your professional competency profile and vocational interests through a comprehensive self-assessment.',
    cta:     'Start MOST 2.0 →',
  },
}

const PLANS = [
  {
    id:        'starter',
    label:     'Starter',
    size:      'Up to 10',
    unit:      'evaluators',
    useCase:   'Executive coaching & pilot groups',
    price:     '$199',
    priceNote: 'per person',
    popular:   false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
  {
    id:        'team',
    label:     'Team',
    size:      'Up to 20',
    unit:      'evaluators',
    useCase:   'Small leadership teams',
    price:     '$150–$500',
    priceNote: 'per person',
    popular:   true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3.1-6 7-6s7 2.5 7 6"/>
        <circle cx="17" cy="7" r="2.5"/><path d="M22 19c0-2.5-2-4.5-5-4.5"/>
      </svg>
    ),
  },
  {
    id:        'organization',
    label:     'Organization',
    size:      'Up to 75',
    unit:      'evaluators',
    useCase:   'Mid-size organizations',
    price:     '$100–$400',
    priceNote: 'per person',
    popular:   false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id:        'enterprise',
    label:     'Enterprise',
    size:      'Up to 200',
    unit:      'evaluators',
    useCase:   'Enterprise leadership programs',
    price:     '$60–$250',
    priceNote: 'per person',
    popular:   false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21V7l9-4 9 4v14"/><path d="M9 21v-6h6v6"/><path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01"/>
      </svg>
    ),
  },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StepIndicator({ current }) {
  const steps = [
    { n: 1, label: 'Select plan' },
    { n: 2, label: 'Your details' },
    { n: 3, label: 'Begin' },
  ]
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
              current >= s.n
                ? 'bg-primary text-dark'
                : 'bg-gray-200 text-gray-400',
            ].join(' ')}>
              {current > s.n
                ? <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5"/></svg>
                : s.n}
            </div>
            <span className={`text-[10px] font-medium whitespace-nowrap ${current >= s.n ? 'text-dark' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 h-0.5 mb-4 mx-1 transition-all ${current > s.n ? 'bg-primary' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Home({ formType = 'most_360' }) {
  const navigate  = useNavigate()
  const formRef   = useRef(null)
  const meta      = META[formType]
  const howSteps  = HOW_IT_WORKS[formType]
  const is360     = formType === 'most_360'

  // step: 'pricing' | 'form'
  const [step, setStep]               = useState('pricing')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [paying, setPaying]           = useState(false)
  const [payError, setPayError]       = useState(null)

  const [form, setForm]       = useState({ nombre: '', email: '', departamento: '' })
  const [cargando, setCargando] = useState(false)
  const [formError, setFormError] = useState(null)

  // Reset when user switches navbar tabs
  if (!is360 && step !== 'pricing') setStep('pricing')
  if (!is360 && selectedPlan)       setSelectedPlan(null)

  // ── Step 1: Pay ──────────────────────────────────────────────────────────
  async function handlePay() {
    if (!selectedPlan) return
    setPaying(true)
    setPayError(null)
    try {
      // TODO: replace with real payment gateway call
      // For now: simulate a successful payment check with a small delay
      await new Promise(res => setTimeout(res, 800))
      // On success → reveal the data collection form
      setStep('form')
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    } catch {
      setPayError('Payment could not be processed. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  // ── Step 2: Submit form ──────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    setCargando(true)
    setFormError(null)
    try {
      const { data } = await axios.post('/api/subjects/', {
        ...form,
        form_type: formType,
        plan: selectedPlan ?? undefined,
      })
      if (data.form_type === 'most_2.0') {
        navigate(`/self/${data.self_token}`)
      } else {
        navigate(`/dashboard/${data.id}`)
      }
    } catch (err) {
      setFormError(err?.response?.data?.detail || 'Something went wrong. Please try again.')
      setCargando(false)
    }
  }

  const activePlan = PLANS.find(p => p.id === selectedPlan)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-dark text-white py-20 px-6 text-center">
        <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">
          {meta.badge}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight whitespace-pre-line">
          {meta.heading}
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          {meta.subhead}
        </p>
      </div>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto py-16 px-6 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {howSteps.map(item => (
            <div key={item.step} className="card text-center">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 font-bold text-dark">
                {item.step}
              </div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pricing + Form (360 only) ──────────────────────────────────────── */}
      {is360 ? (
        <div className="bg-white border-t border-gray-100 py-16 px-6">
          <div className="max-w-5xl mx-auto">

            <StepIndicator current={step === 'pricing' ? 1 : 2} />

            {/* ── STEP 1: Plan selection ─────────────────────────────────── */}
            <div className={step === 'pricing' ? 'block' : 'hidden'}>
              <h2 className="text-2xl font-bold text-center mb-2">Choose your plan</h2>
              <p className="text-muted text-sm text-center mb-10">
                Select the participant size that best fits your organization.
              </p>

              {/* Plan cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {PLANS.map(plan => {
                  const isSelected = selectedPlan === plan.id
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={[
                        'relative flex flex-col text-left rounded-2xl border-2 p-5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-gray-200 bg-white hover:border-primary/40 hover:shadow-sm',
                      ].join(' ')}
                    >
                      {plan.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-dark text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                          Most popular
                        </span>
                      )}

                      <div className={[
                        'w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors',
                        isSelected ? 'bg-primary text-dark' : 'bg-gray-100 text-gray-500',
                      ].join(' ')}>
                        {plan.icon}
                      </div>

                      <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">{plan.label}</p>
                      <p className="text-lg font-bold text-dark leading-tight">{plan.size}</p>
                      <p className="text-xs text-muted mb-3">{plan.unit}</p>
                      <p className="text-xs text-muted leading-snug mb-4 flex-1">{plan.useCase}</p>

                      <div className={['mt-auto pt-3 border-t transition-colors', isSelected ? 'border-primary/20' : 'border-gray-100'].join(' ')}>
                        <p className="text-xl font-bold text-dark">{plan.price}</p>
                        <p className="text-xs text-muted">{plan.priceNote}</p>
                      </div>

                      {isSelected && (
                        <span className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 6l3 3 5-5"/>
                          </svg>
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Pay button */}
              <div className="flex flex-col items-center gap-3">
                {payError && <p className="text-red-500 text-sm">{payError}</p>}
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={!selectedPlan || paying}
                  className={[
                    'flex items-center gap-2 px-10 py-3.5 rounded-full font-semibold text-sm transition-all duration-200',
                    selectedPlan && !paying
                      ? 'bg-primary text-dark hover:opacity-90 shadow-md shadow-primary/20'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                  ].join(' ')}
                >
                  {paying ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                      {selectedPlan
                        ? `Pay · ${activePlan?.price} ${activePlan?.priceNote}`
                        : 'Select a plan to continue'}
                    </>
                  )}
                </button>
                {!selectedPlan && (
                  <p className="text-xs text-muted">Choose one of the plans above to unlock payment</p>
                )}
              </div>
            </div>

            {/* ── STEP 2: Data collection form ──────────────────────────── */}
            <div ref={formRef} className={step === 'form' ? 'block' : 'hidden'}>
              <div className="max-w-md mx-auto">
                {/* Plan summary */}
                {activePlan && (
                  <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 mb-8">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shrink-0">
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 6l3 3 5-5"/>
                        </svg>
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-dark">{activePlan.label} plan</p>
                        <p className="text-xs text-muted">{activePlan.size} {activePlan.unit} · {activePlan.price} {activePlan.priceNote}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('pricing')}
                      className="text-xs text-muted hover:text-primary transition-colors underline underline-offset-2"
                    >
                      Change
                    </button>
                  </div>
                )}

                <h2 className="text-2xl font-bold mb-2 text-center">Your details</h2>
                <p className="text-muted text-sm text-center mb-8">
                  Tell us about yourself to set up your 360 assessment.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="label">Full name</label>
                    <input
                      className="input"
                      placeholder="Jane Doe"
                      value={form.nombre}
                      onChange={e => setForm({ ...form, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="jane@company.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Department</label>
                    <input
                      className="input"
                      placeholder="e.g. Engineering, Marketing..."
                      value={form.departamento}
                      onChange={e => setForm({ ...form, departamento: e.target.value })}
                      required
                    />
                  </div>

                  {formError && <p className="text-red-500 text-sm">{formError}</p>}

                  <button
                    type="submit"
                    className="btn-primary w-full mt-2 py-3"
                    disabled={cargando}
                  >
                    {cargando ? 'Setting up your assessment...' : `Begin assessment →`}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ── MOST 2.0: direct form (no pricing) ───────────────────────────── */
        <div className="bg-white border-t border-gray-100 py-16 px-6">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-2 text-center">Start your assessment</h2>
            <p className="text-muted text-sm text-center mb-8">
              Enter your details to begin a MOST 2.0 assessment.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="label">Full name</label>
                <input className="input" placeholder="Jane Doe" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="jane@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="label">Department</label>
                <input className="input" placeholder="e.g. Engineering, Marketing..." value={form.departamento} onChange={e => setForm({ ...form, departamento: e.target.value })} required />
              </div>
              {formError && <p className="text-red-500 text-sm">{formError}</p>}
              <button type="submit" className="btn-primary w-full mt-2 py-3" disabled={cargando}>
                {cargando ? 'Creating assessment...' : meta.cta}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
