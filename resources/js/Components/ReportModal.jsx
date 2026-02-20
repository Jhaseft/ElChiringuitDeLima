import { X, CheckCircle, XCircle } from "lucide-react";

export default function ReportModal({ isOpen, onClose, success, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000000]">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-lg relative flex flex-col items-center">
        
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <div className="mb-4">
          {success ? (
            <CheckCircle size={48} className="text-green-500" />
          ) : (
            <XCircle size={48} className="text-red-500" />
          )}
        </div>

        <p
          className={`text-center text-lg ${
            success ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
