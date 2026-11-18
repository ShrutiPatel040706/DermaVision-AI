import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Zap, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { scanService } from '../services/api';

const Scan = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  const submitScan = async () => {
    if (!image) return;

    setIsScanning(true);
    setUploadProgress(10);
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => (prev < 90 ? prev + 15 : prev));
    }, 300);

    try {
      const result = await scanService.scan(image);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setScanResult(result);
        setIsScanning(false);
        // Dispatch event to global ChatBox instead of rendering a duplicate one locally
        const conditionStr = result.disease_name || result.condition;
        const confidenceVal = result.confidence_score !== undefined ? result.confidence_score : result.confidence;
        const event = new CustomEvent('dv:openchat', {
          detail: { condition: conditionStr, confidence: confidenceVal }
        });
        window.dispatchEvent(event);
      }, 600);
    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      alert("Failed to analyze skin image. Please try again.");
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setPreviewUrl(null);
    setScanResult(null);
    setUploadProgress(0);
  };

  return (
    <>
    <div className="relative pt-28 pb-16 px-6 max-w-4xl mx-auto z-10 flex flex-col items-center">
      <div className="text-center max-w-xl mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">AI Lesion Scanner</h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Select a clear photo of the skin issue. For best results, avoid blurry lighting, shadows, or zoom.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Scanning Window */}
        <div className="md:col-span-7 flex flex-col items-center">
          <div 
            className="w-full aspect-[4/3] rounded-3xl overflow-hidden glass-panel border border-cyan-200/80 shadow-lg shadow-cyan-500/5 relative flex flex-col items-center justify-center cursor-pointer group bg-white"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !previewUrl && fileInputRef.current?.click()}
          >
            {/* Preview image */}
            {previewUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <img 
                  src={previewUrl} 
                  alt="Skin Preview" 
                  className="w-full h-full object-contain"
                />
                
                {/* Scanner Overlay Animation */}
                {isScanning && (
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute left-0 animate-[bounce_2s_infinite] shadow-lg shadow-cyan-500/50"></div>
                    <div className="absolute inset-0 bg-cyan-500/10 scanning-pulse"></div>
                  </div>
                )}
              </div>
            )}

            {/* Empty Upload State */}
            {!previewUrl && (
              <div className="p-8 text-center flex flex-col items-center space-y-4">
                <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-600 group-hover:scale-105 transition duration-300">
                  <Upload className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-base">Drag & Drop Image Here</p>
                  <p className="text-slate-500 text-xs mt-1">or click to browse from device files</p>
                </div>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {/* Action Toolbar */}
          <div className="flex space-x-3 w-full mt-4 justify-between">
            {previewUrl && (
              <button
                onClick={resetScanner}
                className="flex items-center justify-center space-x-1.5 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl text-slate-700 font-bold flex-1 transition cursor-pointer text-xs"
                disabled={isScanning}
              >
                <RefreshCw className="h-4 w-4 text-slate-500" />
                <span>Clear & Reset</span>
              </button>
            )}

            {previewUrl && !scanResult && (
              <button
                onClick={submitScan}
                disabled={isScanning}
                className="flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 disabled:opacity-50 text-white font-bold rounded-2xl flex-1 shadow-md shadow-cyan-500/20 transition cursor-pointer text-xs"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing ({uploadProgress}%)</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Run AI Diagnostics</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Results Display */}
        <div className="md:col-span-5 w-full">
          {scanResult ? (
            <div className="glass-panel rounded-3xl p-6 border border-cyan-200/80 shadow-lg shadow-cyan-500/5 flex flex-col space-y-6 bg-white">
              <div>
                <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest block mb-1">SCAN COMPLETED</span>
                <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                  {scanResult.condition}
                </h2>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs text-slate-500 font-medium">Confidence Match:</span>
                  <span className="text-sm font-extrabold text-teal-600">
                    {(scanResult.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Probabilities Breakdown */}
              <div className="space-y-3.5 border-t border-slate-100 pt-5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Classifier Diagnostics</span>
                
                {Object.entries(scanResult.probabilities || {}).map(([condition, prob], index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{condition}</span>
                      <span className="font-bold text-cyan-700">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          condition === scanResult.condition 
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-500' 
                            : 'bg-slate-300'
                        }`} 
                        style={{ width: `${prob * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Banner */}
              <div className="bg-cyan-50 border border-cyan-200/80 p-4 rounded-2xl flex flex-col space-y-3">
                <div className="flex items-center space-x-2 text-cyan-800 font-bold text-sm">
                  <Sparkles className="h-4 w-4 text-cyan-600" />
                  <span>Dermatologist Advice Ready</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We have mapped dynamic morning and evening skin routines, key ingredients checklists, and clinics specialized in treating {scanResult.condition}.
                </p>
                <button
                  onClick={() => navigate(`/recommendations?condition=${encodeURIComponent(scanResult.condition)}`)}
                  className="py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-xl text-white text-xs font-bold transition w-full shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  View Skincare Action Plan
                </button>
              </div>

              {scanResult.condition.toLowerCase().includes('malignant') || scanResult.condition.toLowerCase().includes('melanoma') ? (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start space-x-3 text-rose-700">
                  <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <span className="text-xs font-bold block mb-1">CRITICAL CLINICAL ADVISORY</span>
                    <p className="text-[11px] leading-relaxed text-rose-800">
                      This diagnostic indicates suspicion of a malignant lesion. It is strongly advised to book an in-person dermatological consult immediately for a biopsy.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-8 border border-cyan-200/80 shadow-lg shadow-cyan-500/5 flex flex-col items-center justify-center text-center aspect-[4/3] md:aspect-auto md:h-full min-h-[300px] bg-white">
              <div className="w-12 h-12 bg-cyan-50 rounded-2xl border border-cyan-200 flex items-center justify-center text-cyan-600 mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-slate-900 font-extrabold text-lg mb-1">Awaiting AI Scan</h3>
              <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                Provide or capture a photo on the left. The Keras model evaluation will display here once execution finishes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default Scan;
