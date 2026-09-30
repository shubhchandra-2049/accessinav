import { Navigate, Route, Routes } from 'react-router-dom'
import AuthChoice from './pages/AuthChoice.jsx'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Results from './pages/Results.jsx'
import ReportForm from './pages/ReportForm.jsx'
import VolunteerDashboard from './pages/VolunteerDashboard.jsx'
import NgoDashboard from './pages/NgoDashboard.jsx'

export default function App() {
  return <Routes>
    <Route path="/" element={<AuthChoice />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/home" element={<Home />} />
    <Route path="/search" element={<Search />} />
    <Route path="/results" element={<Results />} />
    <Route path="/report" element={<ReportForm />} />
    <Route path="/volunteer" element={<VolunteerDashboard />} />
    <Route path="/ngo" element={<NgoDashboard />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
