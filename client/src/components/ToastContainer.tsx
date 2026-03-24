import { useToast } from "../hooks/useToast";
import { Toast } from "../types/toast";
import { useEffect, useState } from "react";

const ToastItem = ({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: () => void;
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onRemove, 300);
  };

  const getStyles = () => {
    const baseClasses =
      "px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 animate-slideIn transition-all";

    switch (toast.type) {
      case "success":
        return `${baseClasses} bg-emerald/15 border-emerald/30 text-emerald`;
      case "error":
        return `${baseClasses} bg-red-500/15 border-red-400/40 text-red-300`;
      case "warning":
        return `${baseClasses} bg-amber/15 border-amber/30 text-amber`;
      case "info":
      default:
        return `${baseClasses} bg-blue/15 border-blue/30 text-cyan`;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
    }
  };

  return (
    <div
      className={`${getStyles()} ${isClosing ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"}`}
    >
      <span className="text-lg font-bold flex-shrink-0">{getIcon()}</span>
      <span className="flex-1 text-sm">{toast.message}</span>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-lg hover:opacity-70 transition"
      >
        ×
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 max-w-md pointer-events-auto">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};
