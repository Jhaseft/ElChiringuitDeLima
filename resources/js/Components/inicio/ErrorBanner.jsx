// components/ErrorBanner.jsx
import { AlertTriangle } from "lucide-react";

export default function ErrorBanner({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-[70%] lg:w-[50%] z-50">
      <div className="bg-red-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-yellow-300" />
          <span className="font-semibold text-sm sm:text-base">{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-white font-bold hover:text-gray-200"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
