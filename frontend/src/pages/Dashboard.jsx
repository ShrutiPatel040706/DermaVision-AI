import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ExternalLink, Calendar, Search, Activity, Filter, AlertCircle, MessageCircle } from 'lucide-react';
import { scanService, authService } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCondition, setFilterCondition] = useState('All');
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    } else {
      fetchHistory();
    }
  }, [navigate]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await scanService.getHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history list:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await scanService.deleteScan(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  const handleOpenChatForScan = (e, item) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('dv:openchat', {
      detail: { condition: item.condition, confidence: item.confidence }
    }));
  };

  const uniqueConditions = ['All', ...new Set(history.map(item => item.condition))];

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.condition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCondition === 'All' || item.condition === filterCondition;
    return matchesSearch && matchesFilter;
  });

  const getCommonCondition = () => {
    if (history.length === 0) return 'None';
    const counts = {};
    history.forEach(item => {
      counts[item.condition] = (counts[item.condition] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };

  return (
    <>
    <div className="relative pt-28 pb-16 px-6 max-w-7xl mx-auto z-10">
      {/* Welcome Board */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest block mb-1">USER DASHBOARD</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user?.username}</h1>
          <p className="text-slate-600 text-sm mt-1">Review your past skin checks, tracked conditions, and chat history.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/scan"
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold rounded-xl transition shadow-md shadow-cyan-500/20 text-xs cursor-pointer"
          >
            New Skin Scan
          </Link>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="glass-panel rounded-2xl p-6 border border-cyan-100 bg-white shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Logs</span>
          <div className="text-3xl font-black text-slate-900">{history.length}</div>
        </div>
        <div className="glass-panel rounded-2xl p-6 border border-cyan-100 bg-white shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Dominant Condition</span>
          <div className="text-xl font-extrabold text-cyan-700 truncate mt-1">{getCommonCondition()}</div>
        </div>
        <div className="glass-panel rounded-2xl p-6 border border-cyan-100 bg-white shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Last Checked</span>
          <div className="text-sm font-bold text-slate-700 mt-2">
            {history.length > 0 
              ? new Date(history[0].created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) 
              : 'Never'
            }
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="glass-panel rounded-3xl p-6 border border-cyan-100 shadow-md shadow-cyan-500/5 bg-white">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-slate-100 pb-6 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4.5 w-4.5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by condition name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-cyan-400 transition placeholder-slate-400 font-medium"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <div className="flex space-x-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
              {uniqueConditions.slice(0, 4).map((cond) => (
                <button
                  key={cond}
                  onClick={() => setFilterCondition(cond)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    filterCondition === cond
                      ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-100 text-slate-600 hover:text-cyan-700 hover:bg-slate-200/70'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Activity className="h-8 w-8 text-cyan-600 animate-spin" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center max-w-xs mx-auto">
            <div className="p-4 bg-cyan-50 border border-cyan-200 text-cyan-600 rounded-2xl mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-slate-900 font-bold text-base mb-1">No Scans Found</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              {history.length === 0 
                ? "You haven't analyzed any skin patches yet. Begin your first scan to populate this board."
                : "No logs match your search terms or active filters."
              }
            </p>
            {history.length === 0 && (
              <Link
                to="/scan"
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-xl transition text-xs shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                Scan Now
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/recommendations?condition=${encodeURIComponent(item.condition)}`)}
                className="glass-panel glass-panel-hover rounded-2xl p-4 border border-cyan-100 flex gap-4 cursor-pointer relative group bg-white"
              >
                {/* Image Preview Thumbnail */}
                <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.condition}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Activity className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 truncate leading-tight mb-1 group-hover:text-cyan-600 transition">
                      {item.condition}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        {new Date(item.created_at).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between items-center text-[10px] font-semibold">
                      <span className="text-slate-400">Confidence</span>
                      <span className="text-teal-600 font-bold">{(item.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-teal-500 h-full rounded-full"
                        style={{ width: `${item.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col justify-between items-end shrink-0 space-y-2">
                  <div className="flex items-center space-x-1">
                    {/* Chat with AI Button */}
                    <button
                      onClick={(e) => handleOpenChatForScan(e, item)}
                      className="flex items-center space-x-1 px-2.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg text-cyan-700 hover:text-cyan-800 text-[11px] font-bold transition cursor-pointer shadow-sm"
                      title={`Open AI Chat Assistant for ${item.condition}`}
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-cyan-600" />
                      <span>Chat</span>
                    </button>

                    {/* Delete Record Button */}
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <span className="p-1 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition duration-300">
                    <ExternalLink className="h-4 w-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Dashboard;
