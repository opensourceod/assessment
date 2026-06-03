import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function OsodLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="19" cy="19" r="15" stroke="white" strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="62 30"
          strokeDashoffset="8"
        />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="font-bold text-2xl tracking-tight">
          <span className="text-white">OS</span>
          <span className="text-primary">OD</span>
        </span>
        <span className="text-gray-400 text-[11px] tracking-wider font-light">OpenSourceOD</span>
      </div>
    </div>
  )
}

const tabClass = ({ isActive }) =>
  isActive
    ? 'bg-primary text-dark font-semibold text-sm px-4 py-1.5 rounded-full transition-all'
    : 'text-gray-400 hover:text-white text-sm px-4 py-1.5 rounded-full transition-all'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-dark text-white px-8 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link to="/360-feedback">
        <OsodLogo />
      </Link>

      {/* Assessment type tabs */}
      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1">
        <NavLink to="/360-feedback" className={tabClass}>
          360 Feedback
        </NavLink>
        <NavLink to="/most-2.0" className={tabClass}>
          MOST 2.0
        </NavLink>
      </div>

      {/* Auth Actions & Admin */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden sm:flex flex-col items-end text-xs text-gray-400 font-medium">
            <span className="text-white font-semibold">{user.nombre}</span>
            <span>{user.departamento}</span>
          </div>
        )}

        {user ? (
          <button
            onClick={logout}
            className="flex items-center gap-1.5 border border-white/15 text-gray-300 hover:border-red-400 hover:text-red-400 text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-200"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/admin"
            className="flex items-center gap-2 border border-white/20 text-gray-300 hover:border-primary hover:text-primary text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-200"
          >
            <svg
              width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Admin
          </Link>
        )}
      </div>
    </nav>
  )
}
