import { Link } from 'react-router-dom'

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

export default function Navbar() {
  return (
    <nav className="bg-dark text-white px-8 py-4 flex items-center justify-between">
      <Link to="/">
        <OsodLogo />
      </Link>
      <div className="flex gap-8 text-sm font-light tracking-wide">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <Link to="/admin" className="hover:text-primary transition-colors">Admin</Link>
      </div>
    </nav>
  )
}
