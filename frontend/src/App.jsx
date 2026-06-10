import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import SubjectDashboard from './pages/SubjectDashboard'
import EvaluatorSurvey from './pages/EvaluatorSurvey'
import SelfAssessment from './pages/SelfAssessment'
import GapReport from './pages/GapReport'
import AdminPanel from './pages/AdminPanel'

// Preserves query params when redirecting from / to /360-feedback
// Circle's post-payment redirect lands on / with ?plan=X&status=success
function RootRedirect() {
  const { search } = useLocation()
  return <Navigate to={`/360-feedback${search}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to default assessment type, preserving query params */}
        <Route path="/" element={<RootRedirect />} />

        {/* Assessment entry points — form_type driven by route */}
        <Route path="/360-feedback" element={<Home formType="most_360" />} />
        <Route path="/most-2.0"     element={<Home formType="most_2.0" />} />

        {/* Assessment flows */}
        <Route path="/dashboard/:subjectId" element={<SubjectDashboard />} />
        <Route path="/survey/:token"        element={<EvaluatorSurvey />} />
        <Route path="/self/:token"          element={<SelfAssessment />} />
        <Route path="/report/:subjectId"    element={<GapReport />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  )
}
