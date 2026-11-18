import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Info } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-cyan-100 mt-auto py-12 relative z-10 shadow-inner shadow-cyan-500/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Section */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <Activity className="h-5 w-5 text-cyan-600" />
            </div>
            <span className="text-lg font-bold text-slate-900">
              DermaVision<span className="text-cyan-600">AI</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Using advanced machine learning models to analyze skin lesions, track conditions, and deliver tailored dermatological advice.
          </p>
        </div>

        {/* Center Links */}
        <div className="flex flex-col space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Actions</h4>
          <div className="flex flex-col space-y-2 text-xs font-medium text-slate-600">
            <Link to="/scan" className="hover:text-cyan-600 transition">Analyze Skin Condition</Link>
            <Link to="/recommendations" className="hover:text-cyan-600 transition">Skincare Recommendations</Link>
            <Link to="/store" className="hover:text-cyan-600 transition">Skincare Store</Link>
            <Link to="/login" className="hover:text-cyan-600 transition">Sign In</Link>
          </div>
        </div>

        {/* Right Section (Medical Disclaimer Info) */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2 text-amber-700 text-xs font-bold uppercase tracking-wider">
            <Shield className="h-4 w-4 text-amber-600" />
            <span>Important Notice</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start space-x-2">
            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              DermaVision AI calculations are for educational and advisory purposes only. They do not constitute official clinical diagnoses or medical therapy prescriptions.
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-cyan-100/60 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} DermaVision AI. All rights reserved.</p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <span className="hover:text-cyan-600 cursor-pointer transition">Privacy Policy</span>
          <span className="hover:text-cyan-600 cursor-pointer transition">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
