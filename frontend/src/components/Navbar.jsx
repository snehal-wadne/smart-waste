import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Recycle, Calendar, Search, ShieldCheck, Menu, X, Sparkles } from 'lucide-react';

export default function Navbar({ onRequestClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Waste Categories', path: '/#categories' },
    { label: 'How It Works', path: '/#how-it-works' },
    { label: 'Track Pickup', path: '/track' },
    { label: 'Pickup History', path: '/history' },
    { label: 'Admin Portal', path: '/admin' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-eco-border/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-eco-light flex items-center justify-center text-eco-dark group-hover:bg-eco-primary group-hover:text-white transition-all shadow-eco-sm">
              <Recycle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-eco-dark flex items-center gap-1.5">
                EcoCollect
                <span className="inline-block w-2 h-2 rounded-full bg-eco-primary"></span>
              </span>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-eco-muted">
                Civic Waste Network
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks
              .filter((l) => l.path !== '/admin')
              .map((link) => {
                const isActive =
                  !link.path.startsWith('/#') && location.pathname === link.path;
                return link.path.startsWith('/#') ? (
                  <a
                    key={link.label}
                    href={link.path}
                    className="text-xs lg:text-sm font-medium px-3 py-2 rounded-xl text-eco-charcoal/80 hover:text-eco-primary hover:bg-eco-light/50 transition-all"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`text-xs lg:text-sm font-medium px-3 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-eco-light text-eco-dark font-bold border border-eco-primary/20 shadow-2xs'
                        : 'text-eco-charcoal/80 hover:text-eco-primary hover:bg-eco-light/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
          </nav>

          {/* Right Action CTA & Admin Access */}
          <div className="hidden sm:flex items-center space-x-2.5">
            {/* Prominent Admin Access Button */}
            <Link
              to="/admin"
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all border ${
                location.pathname === '/admin'
                  ? 'bg-purple-100 text-purple-900 border-purple-400 shadow-xs ring-2 ring-purple-200'
                  : 'bg-purple-50/70 hover:bg-purple-100 text-purple-800 border-purple-200/80 shadow-2xs'
              }`}
              title="Municipal Operations & Dispatch Console"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin Portal</span>
              <span className="bg-purple-200 text-purple-800 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                Staff
              </span>
            </Link>

            <Link
              to="/track"
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors border ${
                location.pathname === '/track'
                  ? 'bg-eco-light text-eco-dark border-eco-primary/30 font-bold'
                  : 'text-eco-dark hover:bg-eco-light/50 border-eco-border'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-eco-primary" />
              <span>Track Request</span>
            </Link>

            <button
              onClick={onRequestClick}
              className="inline-flex items-center gap-2 bg-eco-primary hover:bg-eco-dark text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-eco transition-all transform active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Pickup</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-eco-charcoal hover:bg-eco-light/40 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-eco-border bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) =>
              link.path.startsWith('/#') ? (
                <a
                  key={link.label}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-eco-charcoal hover:bg-eco-light hover:text-eco-dark"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-eco-charcoal hover:bg-eco-light hover:text-eco-dark"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
          <div className="pt-2 flex flex-col space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onRequestClick) onRequestClick();
              }}
              className="w-full flex items-center justify-center gap-2 bg-eco-primary text-white font-semibold py-2.5 rounded-xl shadow-eco"
            >
              <Calendar className="w-4 h-4" />
              Request a Pickup
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
