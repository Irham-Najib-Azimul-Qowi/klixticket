import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Camera, 
  Maximize2,
  X,
  History,
  Ticket,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { adminApi } from '@/services/api';
import { useToast } from '@/context/ToastContext';

declare global {
  interface Window {
    jsQR: any;
  }
}

const ScanPage: React.FC = () => {
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  // Load jsQR from CDN safely
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleScan = async (scannedCode: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setScanning(false);
    setResult(null);
    
    try {
      const resp = await adminApi.scanItem(scannedCode);
      setResult({
        success: true,
        data: resp
      });
      setScanHistory(prev => [resp, ...prev].slice(0, 10));
      showToast('Item successfully validated & used', 'success');
      setCode('');
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Validation failed'
      });
      showToast(err.message || 'Verification error', 'error');
    } finally {
      setIsLoading(false);
      // Stop camera if it was running
      stopCamera();
    }
  };

  const startCamera = async () => {
    setScanning(true);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestRef.current = requestAnimationFrame(tick);
      }
    } catch (err) {
      console.error(err);
      showToast('Could not access camera', 'error');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    setScanning(false);
    if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        if (window.jsQR) {
          const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });
          
          if (code) {
            handleScan(code.data);
            return; // Stop animation loop
          }
        }
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      handleScan(code.trim());
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">Fulfillment Scanner</h2>
        <p className="text-sm text-slate-500 font-medium">Verify digital passes and collect merchandise assets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Scanner & Input */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 rounded text-white">
                     <QrCode size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Validation Core</h3>
               </div>
               {!scanning ? (
                 <button 
                  onClick={startCamera}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
                 >
                   <Camera size={14} /> Open Lens
                 </button>
               ) : (
                 <button 
                  onClick={stopCamera}
                  className="flex items-center gap-2 px-3 py-1.5 bg-rose-500 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all"
                 >
                   <X size={14} /> Close Lens
                 </button>
               )}
            </div>

            <div className="p-8">
              {scanning ? (
                <div className="relative aspect-square w-full max-w-md mx-auto bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-900 shadow-2xl">
                   <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
                   <canvas ref={canvasRef} className="hidden" />
                   <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
                      <div className="w-full h-full border-2 border-slate-100/30 rounded relative">
                         <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                         <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                         <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                         <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
                         <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/40 shadow-[0_0_15px_white] animate-[pulse_1.5s_infinite]"></div>
                      </div>
                   </div>
                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 whitespace-nowrap border border-white/10">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      Awaiting QR Pattern...
                   </div>
                </div>
              ) : (
                <form onSubmit={handleManualSubmit} className="max-w-md mx-auto space-y-6 py-4">
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Manual Access Code</label>
                    <div className="relative">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={20} />
                       <input 
                         type="text" 
                         value={code}
                         onChange={(e) => setCode(e.target.value.toUpperCase())}
                         placeholder="TKT-XXXX-XXXX"
                         className="w-full bg-slate-50 border-2 border-slate-100 rounded-lg p-5 pl-12 text-2xl font-black text-slate-900 uppercase tracking-widest focus:outline-none focus:border-slate-950 focus:bg-white transition-all placeholder:text-slate-200"
                       />
                       {isLoading && (
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-white border border-slate-100 rounded text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Loader2 size={12} className="animate-spin" /> Verifying
                         </div>
                       )}
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={isLoading || !code.trim()}
                    className="w-full py-5 bg-slate-950 text-white rounded-lg font-bold text-lg uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-950/10 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    Validate Identity <ArrowRight size={20} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Validation Result Box */}
          {result && (
            <div className={`p-6 rounded-lg border-2 animate-in slide-in-from-top-4 duration-300 ${
              result.success ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
            }`}>
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                   result.success ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                   {result.success ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                </div>
                <div className="flex-1">
                   <h4 className={`text-lg font-bold uppercase tracking-tight ${
                     result.success ? 'text-emerald-900' : 'text-rose-900'
                   }`}>
                     {result.success ? 'Verification Successful' : 'Validation Error'}
                   </h4>
                   <p className={`text-sm font-medium mt-0.5 ${
                     result.success ? 'text-emerald-700/70' : 'text-rose-700/70'
                   }`}>
                     {result.success ? `Redeemable item has been marked as used.` : result.message}
                   </p>

                   {result.success && result.data && (
                     <div className="mt-6 p-4 bg-white/80 rounded-md border border-emerald-100 space-y-4">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Asset Name</p>
                              <p className="text-xl font-black text-slate-950 uppercase tracking-tight">{result.data.item_name}</p>
                           </div>
                           <div className="px-2 py-1 bg-emerald-500 text-white text-[8px] font-black rounded uppercase tracking-widest">
                              {result.data.item_type}
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-200/50">
                           <div>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Code Hash</p>
                              <p className="text-xs font-mono font-bold text-slate-800">{result.data.code}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Reference ID</p>
                              <p className="text-xs font-mono font-bold text-slate-800">#{result.data.order_id.slice(-8).toUpperCase()}</p>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: History */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col h-full max-h-[700px]">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <History size={18} className="text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Recent Sessions</h3>
                 </div>
                 <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[8px] font-black rounded uppercase tracking-widest">
                    {scanHistory.length} Active
                 </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                 {scanHistory.length === 0 ? (
                   <div className="py-24 flex flex-col items-center text-center px-6">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                         <Maximize2 size={24} className="text-slate-200" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No validated items in current session cache.</p>
                   </div>
                 ) : (
                   <div className="space-y-1">
                      {scanHistory.map((item, idx) => (
                        <div key={idx} className="p-4 hover:bg-slate-50 rounded-md transition-colors flex items-center justify-between group">
                           <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded border flex items-center justify-center ${
                                item.item_type === 'ticket' ? 'bg-indigo-50 border-indigo-100 text-indigo-500' : 'bg-amber-50 border-amber-100 text-amber-500'
                              }`}>
                                 {item.item_type === 'ticket' ? <Ticket size={16} /> : <ShoppingBag size={16} />}
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-slate-900 leading-none mb-1">{item.item_name}</p>
                                 <p className="text-[9px] font-mono text-slate-400">{item.code}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[8px] font-bold text-slate-300 uppercase mb-1">Authenticated</p>
                              <p className="text-[9px] font-bold text-slate-900">{new Date(item.used_at).toLocaleTimeString()}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ScanPage;
