import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';
import { authService } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(username, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        "Incorrect username or password. Please verify and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pt-28 pb-16 px-6 max-w-md mx-auto z-10 flex flex-col justify-center min-h-[80vh]">
      <div className="glass-panel rounded-3xl p-8 border border-cyan-100 shadow-xl shadow-cyan-500/10 flex flex-col space-y-6 bg-white">
        <div className="text-center">
          <div className="w-10 h-10 bg-cyan-50 rounded-xl border border-cyan-200 text-cyan-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In</h1>
          <p className="text-slate-500 text-xs mt-1">Access your skin scan logs and tracking progress</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-rose-700 text-xs">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Username or Email</label>
            <div className="relative">
              <User className="h-4.5 w-4.5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-cyan-400 transition placeholder-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="h-4.5 w-4.5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-cyan-400 transition placeholder-slate-400 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md shadow-cyan-500/20 transition cursor-pointer flex justify-center items-center text-xs"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-600 hover:text-cyan-700 font-bold transition">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
