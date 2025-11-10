import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
              <img
                src="/Logotyp1.jpg"
                alt="Föreningens logotyp"
                className="h-14 w-auto object-contain"
              />
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
              aria-label="Meny"
            >
              <svg className="w-6 h-6" viewBox="0 0 100 80" fill="currentColor">
                <rect width="100" height="10" rx="5"></rect>
                <rect y="30" width="100" height="10" rx="5"></rect>
                <rect y="60" width="100" height="10" rx="5"></rect>
              </svg>
            </button>

            <ul className="hidden md:flex md:space-x-6 lg:space-x-8">
              <li>
                <Link
                  to="/"
                  className={`text-base lg:text-lg font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                    isActive('/')
                      ? 'text-white bg-primary shadow-md'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-100 hover:shadow-sm'
                  }`}
                >
                  Händelser
                </Link>
              </li>
              <li>
                <Link
                  to="/packlista"
                  className={`text-base lg:text-lg font-medium transition-colors px-3 py-2 rounded-lg ${
                    isActive('/packlista')
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                  }`}
                >
                  Packlista
                </Link>
              </li>
              <li>
                <Link
                  to="/budget"
                  className={`text-base lg:text-lg font-medium transition-colors px-3 py-2 rounded-lg ${
                    isActive('/budget')
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                  }`}
                >
                  Budget
                </Link>
              </li>
              <li>
                <Link
                  to="/sasongsoversikt"
                  className={`text-base lg:text-lg font-medium transition-colors px-3 py-2 rounded-lg ${
                    isActive('/sasongsoversikt')
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                  }`}
                >
                  Säsongsöversikt
                </Link>
              </li>
            </ul>
          </div>

          {menuOpen && (
            <ul className="md:hidden pb-4 space-y-2">
              <li>
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive('/')
                      ? 'text-white bg-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Händelser
                </Link>
              </li>
              <li>
                <Link
                  to="/packlista"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive('/packlista')
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Packlista
                </Link>
              </li>
              <li>
                <Link
                  to="/budget"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive('/budget')
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Budget
                </Link>
              </li>
              <li>
                <Link
                  to="/sasongsoversikt"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive('/sasongsoversikt')
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Säsongsöversikt
                </Link>
              </li>
            </ul>
          )}
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-center gap-3">
          <img
            src="/beaver-logo.png"
            alt="Beaver Consulting logotyp"
            className="h-12 w-auto object-contain"
          />
          <span className="text-gray-600 text-sm">Developed by Beaver Consulting</span>
        </div>
      </footer>
    </div>
  );
}
