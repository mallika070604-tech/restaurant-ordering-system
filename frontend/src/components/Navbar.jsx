import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="flex flex-wrap gap-2">
      <Link to="/" className="btn-secondary text-xs sm:text-sm">
        Home
      </Link>
      <Link to="/kitchen" className="btn-secondary text-xs sm:text-sm">
        Kitchen
      </Link>
      <Link to="/admin" className="btn-secondary text-xs sm:text-sm">
        Admin
      </Link>
    </nav>
  );
}
