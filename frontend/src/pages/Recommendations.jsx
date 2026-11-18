import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, User, Phone, MapPin, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { recommendationService } from '../services/api';

const Recommendations = () => {
  const [searchParams] = useSearchParams();
  const conditionParam = searchParams.get('condition') || 'Unknown_Normal';
  const [selectedCondition, setSelectedCondition] = useState(conditionParam);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointmentRequested, setAppointmentRequested] = useState(false);
  const [patientName, setPatientName] = useState('');

  const conditionsList = [
    'Unknown_Normal',
    'Acne',
    'Eczema',
    'Psoriasis',
    'SkinCancer',
    'Moles',
    'Vitiligo',
    'Rosacea',
    'Warts'
  ];

  useEffect(() => {
    fetchRecommendations(selectedCondition);
  }, [selectedCondition]);

  const fetchRecommendations = async (condition) => {
    setLoading(true);
    try {
      const responseData = await recommendationService.getRecommendations(condition);
      setData(responseData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (e) => {
    e.preventDefault();
    if (!patientName.trim()) return;
    setAppointmentRequested(true);
    setTimeout(() => {
      setAppointmentRequested(false);
      setPatientName('');
      alert("Consultation Request Submitted! The clinic coordinator will contact you shortly.");
    }, 1500);
  };

  return (
    <div className="relative pt-28 pb-16 px-6 max-w-7xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar - Condition Selector */}
      <div className="lg:col-span-3 flex flex-col space-y-4">
        <div className="glass-panel rounded-2xl p-4 border border-cyan-100 bg-white shadow-sm">
          <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest block mb-3">Skin Conditions</span>
          <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {conditionsList.map((cond) => (
              <button
                key={cond}
                onClick={() => setSelectedCondition(cond)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap lg:whitespace-normal transition cursor-pointer ${
                  selectedCondition.toLowerCase() === cond.toLowerCase()
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-transparent text-slate-600 hover:text-cyan-600 hover:bg-cyan-50/50'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Diagnostic disclaimer warning */}
        <div className="glass-panel rounded-2xl p-4 border border-amber-200 bg-amber-50 shadow-sm">
          <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>AI Notice</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Recommendations are generated using automated clinical literature mapping. They are not direct diagnoses. Always consult a dermatologist before altering active prescriptions.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-9 space-y-8">
        {loading ? (
          <div className="glass-panel rounded-3xl p-20 flex justify-center items-center border border-cyan-100 bg-white shadow-sm">
            <Sparkles className="h-8 w-8 text-cyan-600 animate-spin" />
          </div>
        ) : data ? (
          <>
            {/* Header info */}
            <div className="glass-panel rounded-3xl p-6 border border-cyan-100 shadow-md shadow-cyan-500/5 flex flex-col md:flex-row justify-between items-start gap-4 bg-white">
              <div>
                <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest block mb-1">Condition Profile</span>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{data.condition}</h1>
                <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">{data.description}</p>
              </div>
              <div className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 self-start md:self-auto border ${
                data.severity.toLowerCase().includes('critical')
                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                  : 'bg-cyan-50 text-cyan-800 border-cyan-200'
              }`}>
                {data.severity}
              </div>
            </div>

            {/* Routines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Morning */}
              <div className="glass-panel rounded-3xl p-6 border border-cyan-100 shadow-md shadow-cyan-500/5 bg-white">
                <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider block mb-4">AM Regimen</span>
                <div className="space-y-4">
                  {data.routine.morning.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-5 h-5 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-cyan-200">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evening */}
              <div className="glass-panel rounded-3xl p-6 border border-cyan-100 shadow-md shadow-cyan-500/5 bg-white">
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block mb-4">PM Regimen</span>
                <div className="space-y-4">
                  {data.routine.evening.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-teal-200">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ingredient & Product Warnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Safe Ingredients */}
              <div className="glass-panel rounded-3xl p-6 border border-cyan-100 shadow-md shadow-cyan-500/5 bg-white">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-4">Key Active Ingredients</span>
                <div className="flex flex-wrap gap-2">
                  {data.ingredients.map((ing, i) => (
                    <span 
                      key={i} 
                      className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ingredients to Avoid */}
              <div className="glass-panel rounded-3xl p-6 border border-cyan-100 shadow-md shadow-cyan-500/5 bg-white">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-4">Ingredients to Avoid</span>
                <div className="flex flex-wrap gap-2">
                  {data.ingredients_to_avoid.map((ing, i) => (
                    <span 
                      key={i} 
                      className="px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Lifestyle & Clinical Consultations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Lifestyle Recommendations */}
              <div className="glass-panel rounded-3xl p-6 border border-cyan-100 shadow-md shadow-cyan-500/5 md:col-span-6 flex flex-col space-y-4 bg-white">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Lifestyle Adjustments</span>
                <div className="space-y-3.5">
                  {data.lifestyle.map((tip, i) => (
                    <div key={i} className="flex items-start space-x-2.5">
                      <CheckCircle className="h-4.5 w-4.5 text-cyan-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dermatologists and Appointments */}
              <div className="glass-panel rounded-3xl p-6 border border-cyan-100 shadow-md shadow-cyan-500/5 md:col-span-6 flex flex-col space-y-4 bg-white">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Dermatology Referrals</span>
                
                <div className="space-y-4 flex-1">
                  {data.dermatologists.map((doc, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col space-y-2">
                      <div className="flex items-center space-x-2.5">
                        <User className="h-4.5 w-4.5 text-cyan-600" />
                        <span className="text-sm font-bold text-slate-900">{doc.name}</span>
                      </div>
                      <div className="flex items-center space-x-2.5 text-xs text-slate-600">
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{doc.clinic}</span>
                      </div>
                      <div className="flex items-center space-x-2.5 text-xs text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{doc.contact}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Consultation Request Form */}
                <form onSubmit={handleBookAppointment} className="border-t border-slate-100 pt-4 flex flex-col space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Request Specialist Referral Callback</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Patient Full Name..."
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-400 flex-1 placeholder-slate-400 font-medium"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-xl text-white text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-sm shadow-cyan-500/20"
                    >
                      Request Referral
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="glass-panel rounded-3xl p-10 text-center border border-cyan-100 bg-white shadow-sm">
            <HelpCircle className="h-10 w-10 text-slate-400 mx-auto mb-4" />
            <h2 className="text-slate-900 font-bold text-lg">No Recommendations Mapped</h2>
            <p className="text-slate-500 text-sm mt-1">Select a condition from the left-side menu to view advice files.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
