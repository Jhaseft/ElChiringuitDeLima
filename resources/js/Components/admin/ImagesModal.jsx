import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ImagesModal({ isOpen, onClose, images = [], title = "Comprobantes" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (isOpen) setIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, images.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, images.length, onClose]);

  if (!isOpen || !images.length) return null;

  const current = images[index];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            {title}
            <span className="ml-2 text-sm text-gray-500 font-normal">
              {index + 1} / {images.length}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition"
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative flex-1 bg-gray-50 flex items-center justify-center min-h-[300px] overflow-auto">
          <img
            src={current}
            alt={`Comprobante ${index + 1}`}
            className="max-w-full max-h-[70vh] object-contain"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                disabled={index === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setIndex((i) => Math.min(i + 1, images.length - 1))}
                disabled={index === images.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Siguiente"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 p-3 border-t border-gray-100 overflow-x-auto bg-white">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                  i === index ? "border-blue-600" : "border-transparent hover:border-gray-300"
                }`}
              >
                <img src={src} alt={`Miniatura ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
