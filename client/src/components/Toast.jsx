import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const NotificationToast = ({ message, type, onClose }) => {
  useEffect(() => {
    const autoCloseTimer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(autoCloseTimer);
  }, [onClose]);

  const backgroundColorClass = type === 'success' 
    ? 'bg-gradient-to-r from-violet-600 to-indigo-600' 
    : type === 'error' 
    ? 'bg-red-500' 
    : 'bg-slate-700';

  const NotificationIcon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div className="fixed top-5 right-5 z-50 animate-slide-in">
      <div className={`${backgroundColorClass} text-white px-7 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] backdrop-blur-sm border border-white/10`}>
        <NotificationIcon size={22} />
        <span className="flex-1 font-medium">{message}</span>
        <button
          onClick={onClose}
          className="hover:opacity-70 transition-opacity duration-200"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default NotificationToast;

