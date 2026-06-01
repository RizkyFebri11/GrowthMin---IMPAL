import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, Info } from 'lucide-react';

const Modal = ({ isOpen, type = 'info', title, message, onConfirm, onClose, confirmText = 'OK', cancelText = 'Batal' }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />;
      case 'error':
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
      case 'confirm':
        return <HelpCircle className="w-12 h-12 text-indigo-500" />;
      default:
        return <Info className="w-12 h-12 text-blue-500" />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'success': return 'border-t-emerald-500';
      case 'error': return 'border-t-red-500';
      case 'confirm': return 'border-t-indigo-500';
      default: return 'border-t-blue-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl shadow-2xl border-t-4 ${getHeaderColor()} w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200`}>
        <div className="p-6 flex flex-col items-center text-center">
          <div className="mb-4">{getIcon()}</div>
          {title && <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>}
          <p className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-line">{message}</p>
          
          <div className="flex gap-3 w-full justify-center">
            {type === 'confirm' ? (
              <>
                <button 
                  onClick={onClose} 
                  type="button"
                  className="flex-1 max-w-[120px] px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold transition-colors"
                >
                  {cancelText}
                </button>
                <button 
                  onClick={() => {
                    if (onConfirm) onConfirm();
                    onClose();
                  }}
                  type="button"
                  className="flex-1 max-w-[120px] px-4 py-2 bg-[#2D2B52] hover:bg-indigo-900 text-white rounded-lg text-sm font-semibold transition-all shadow-md"
                >
                  {confirmText}
                </button>
              </>
            ) : (
              <button 
                onClick={onClose}
                type="button"
                className="w-full max-w-[150px] px-6 py-2 bg-[#2D2B52] hover:bg-indigo-900 text-white rounded-lg text-sm font-semibold transition-all shadow-md"
              >
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
