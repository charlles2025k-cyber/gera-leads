import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function Alert({ message, type = 'info', onClose }) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fading out slightly before dismiss
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2700);

    // Call onClose callback after 3 seconds total
    const dismissTimer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [onClose]);

  const handleClose = () => {
    setIsFading(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const variants = {
    success: {
      bg: 'bg-emerald-950/70 border-emerald-500/30 text-emerald-200',
      iconColor: 'text-emerald-400',
      icon: CheckCircle2,
      shadow: 'shadow-emerald-950/20'
    },
    error: {
      bg: 'bg-red-950/70 border-red-500/30 text-red-200',
      iconColor: 'text-red-400',
      icon: AlertCircle,
      shadow: 'shadow-red-950/20'
    },
    warning: {
      bg: 'bg-amber-950/70 border-amber-500/30 text-amber-200',
      iconColor: 'text-amber-400',
      icon: AlertTriangle,
      shadow: 'shadow-amber-950/20'
    },
    info: {
      bg: 'bg-blue-950/70 border-blue-500/30 text-blue-200',
      iconColor: 'text-blue-400',
      icon: Info,
      shadow: 'shadow-blue-950/20'
    }
  };

  const currentVariant = variants[type] || variants.info;
  const Icon = currentVariant.icon;

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes toastFadeOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(120%);
            opacity: 0;
          }
        }

        .toast-slide-in {
          animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .toast-fade-out {
          animation: toastFadeOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      <div 
        className={`fixed top-6 right-6 z-50 flex items-start gap-3.5 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 max-w-sm w-full md:w-96 text-xs sm:text-sm font-sans ${
          currentVariant.bg
        } ${
          currentVariant.shadow
        } ${
          isFading ? 'toast-fade-out' : 'toast-slide-in'
        }`}
      >
        <div className={`p-0.5 rounded-lg shrink-0 ${currentVariant.iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-grow pt-0.5 leading-relaxed font-semibold">
          {message}
        </div>
        
        <button 
          onClick={handleClose}
          className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
