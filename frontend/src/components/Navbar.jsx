import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Sparkles, History, LogOut, Menu, X, LogIn, ShoppingBag, Package } from 'lucide-react';
import { authService } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(authService.getCurrentUser());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Scan Analyzer', path: '/scan', icon: Activity },
    { name: 'Skincare Advice', path: '/recommendations', icon: Sparkles },
    { name: 'Store', path: '/store', icon: ShoppingBag },
    ...(user ? [
      { name: 'Dashboard', path: '/dashboard', icon: History },
      { name: 'Orders', path: '/orders', icon: Package }
    ] : []),
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md py-3 shadow-md shadow-cyan-500/5 border-b border-cyan-100' 
        : 'bg-white/80 backdrop-blur-sm py-4 border-b border-cyan-100/60'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="p-2 bg-cyan-500/10 rounded-xl group-hover:bg-cyan-500/20 transition border border-cyan-500/20">
            <Activity className="h-6 w-6 text-cyan-600 transition group-hover:scale-110" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            DermaVision<span className="text-cyan-600">AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  active
                    ? 'bg-cyan-500/10 text-cyan-700 border border-cyan-500/20 shadow-sm shadow-cyan-500/5'
                    : 'text-slate-600 hover:text-cyan-600 hover:bg-cyan-50/50'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-cyan-600' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User Auth Action (Desktop) */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-cyan-50/80 px-3 py-1.5 rounded-xl border border-cyan-200/60">
                <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                  {user.username.substring(0, 2)}
                </div>
                <span className="text-xs text-slate-800 font-bold">{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100/80 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5">
              <Link
                to="/login"
                className="px-4 py-2 text-slate-700 hover:text-cyan-600 text-sm font-semibold transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center space-x-1.5 px-4.5 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-xl text-sm font-bold transition shadow-md shadow-cyan-500/20"
              >
                <LogIn className="h-4 w-4" />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-cyan-600 rounded-lg focus:outline-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white border border-cyan-100 mt-2 mx-4 rounded-2xl p-4 shadow-xl">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2.5 p-3 rounded-xl font-semibold transition ${
                    active
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                      : 'text-slate-600 hover:text-cyan-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            <hr className="border-slate-100 my-1" />
            {user ? (
              <div className="flex flex-col space-y-2 pt-1">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center text-sm font-bold text-white uppercase">
                    {user.username.substring(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{user.username}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center space-x-2 w-full p-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center p-2.5 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center p-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-xl shadow-md shadow-cyan-500/20 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
