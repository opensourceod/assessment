import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SubjectDashboard from './pages/SubjectDashboard'
import EvaluatorSurvey from './pages/EvaluatorSurvey'
import SelfAssessment from './pages/SelfAssessment'
import GapReport from './pages/GapReport'
import AdminPanel from './pages/AdminPanel'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard/:subjectId" element={<SubjectDashboard />} />
        <Route path="/survey/:token" element={<EvaluatorSurvey />} />
        <Route path="/self/:token" element={<SelfAssessment />} />
        <Route path="/report/:subjectId" element={<GapReport />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  )
}
