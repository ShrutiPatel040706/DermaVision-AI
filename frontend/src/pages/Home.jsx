import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, HeartPulse, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const steps = [
    {
      icon: Camera,
      title: "1. Capture Image",
      desc: "Take a clear, close-up photograph of the skin lesion or area of concern in well-lit conditions."
    },
    {
      icon: HeartPulse,
      title: "2. Deep Analysis",
      desc: "Our neural network evaluates the patch characteristics and identifies visual patterns."
    },
    {
      icon: Sparkles,
      title: "3. Smart Regimen",
      desc: "Get personalized ingredients checklists, dynamic daily routines, and doctor directories."
    }
  ];

  const features = [
    "Supports 22 conditions (Acne, Eczema, Psoriasis, Skin Cancer, Moles...)",
    "Secure & Private: images are encrypted and stored safely",
    "Generates detailed ingredient matches and products to avoid",
    "Connects you directly to certified nearby dermatologists"
  ];

  return (
    <div className="relative pt-28 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center">
      {/* Hero Section */}
      <div className="text-center max-w-3xl flex flex-col items-center mt-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          Reveal the Health of <br className="hidden sm:inline" />
          Your Skin <span className="bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">Instantly</span>
        </h1>
        
        <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
          Upload a photo of your skin lesion to detect concerns across 22 conditions (such as Acne, Eczema, Skin Cancer, or Moles), and receive expert-backed recommendations in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            to="/scan"
            className="flex items-center justify-center space-x-2 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 hover:shadow-cyan-500/35 cursor-pointer text-sm"
          >
            <span>Scan Skin Now</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          
          {!user && (
            <Link
              to="/register"
              className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl border border-slate-200 transition text-sm shadow-sm"
            >
              Sign Up for History Logs
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-20 relative z-10">
        {[
          { number: "96.4%", label: "Model Accuracy" },
          { number: "< 2s", label: "Analysis Time" },
          { number: "22", label: "Conditions Mapped" },
          { number: "100%", label: "Privacy Ensured" }
        ].map((metric, i) => (
          <div key={i} className="glass-panel rounded-2xl p-6 text-center bg-white border border-cyan-100 shadow-md shadow-cyan-500/5">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-600 mb-1">
              {metric.number}
            </div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Section */}
      <div className="w-full mt-28 relative z-10 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">How DermaVision Works</h2>
        <p className="text-slate-600 max-w-md mx-auto mb-12 text-sm leading-relaxed">
          An easy 3-step digital check-up designed to clarify skin conditions and map a pathway to relief.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="glass-panel glass-panel-hover rounded-3xl p-8 flex flex-col items-center text-center bg-white border border-cyan-100 shadow-md shadow-cyan-500/5">
                <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-600 mb-6">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail / Features Section */}
      <div className="w-full mt-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="flex flex-col space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
            High Precision Skin Analysis Powered by Computer Vision
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            Our neural classification algorithm evaluates lesions based on key morphological features, such as discoloration, size irregularity, and borders, matching them against standard clinical catalogs.
          </p>
          <div className="flex flex-col space-y-3 pt-2">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-slate-700">
                <CheckCircle2 className="h-5 w-5 text-cyan-600 shrink-0" />
                <span className="text-sm font-semibold">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Mockup Dashboard Visual */}
        <div className="glass-panel rounded-3xl p-6 border border-cyan-100 shadow-xl shadow-cyan-500/10 relative overflow-hidden flex flex-col space-y-4 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-400"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-teal-400"></span>
            </div>
            <span className="text-xs text-slate-400 font-mono">analysis_dashboard.json</span>
          </div>
          
          <div className="flex space-x-4">
            <div className="w-24 h-24 bg-cyan-50 rounded-2xl flex items-center justify-center border border-cyan-200">
              <Camera className="h-8 w-8 text-cyan-600/70" />
            </div>
            <div className="flex-1 flex flex-col space-y-2 justify-center">
              <div className="h-5 bg-cyan-500/20 w-32 rounded-md"></div>
              <div className="h-4 bg-slate-100 w-full rounded-md"></div>
              <div className="h-4 bg-slate-100 w-2/3 rounded-md"></div>
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Match Probability</span>
              <span className="text-cyan-600 font-bold">96.8%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-teal-500 h-full rounded-full" style={{ width: '96.8%' }}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">CLEANSER</span>
              <span className="text-xs font-bold text-slate-800">Salicylic Gel</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">TREATMENT</span>
              <span className="text-xs font-bold text-slate-800">Niacinamide Serum</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
