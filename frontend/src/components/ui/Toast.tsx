import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onHide={() => hideToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: any; onHide: () => void }> = ({ toast, onHide }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-white border-emerald-100',
    error: 'bg-white border-rose-100',
    warning: 'bg-white border-amber-100',
    info: 'bg-white border-blue-100',
  };

  return (
    <div 
      className={`pointer-events-auto flex items-center gap-3 px-4 py-4 rounded-lg border shadow-lg shadow-slate-200/50 min-w-[320px] max-w-md animate-in slide-in-from-right duration-300 ${bgColors[toast.type as keyof typeof bgColors]}`}
      role="alert"
    >
      <div className="flex-shrink-0">
        {icons[toast.type as keyof typeof icons]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">{toast.message}</p>
      </div>
      <button 
        onClick={onHide}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
      >
        <X size={16} />
      </button>
    </div>
  );
};
