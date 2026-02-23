import { useEffect } from "react";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

/**
 * AdminOverlay — tarjeta flotante de estado, centrada en pantalla.
 *
 * Props:
 *  state       : "loading" | "success" | "error" | "warning" | null  (null = oculto)
 *  message     : string opcional para sobreescribir el texto
 *  autoDismiss : ms para auto-cerrar en success/error/warning (default 1800)
 *  onDismiss   : callback al cerrarse
 */
export default function AdminOverlay({ state, message, autoDismiss = 1800, onDismiss }) {
  useEffect(() => {
    if ((state === "success" || state === "error" || state === "warning") && onDismiss) {
      const t = setTimeout(onDismiss, autoDismiss);
      return () => clearTimeout(t);
    }
  }, [state, autoDismiss, onDismiss]);

  if (!state) return null;

  const config = {
    loading: {
      Icon: Loader2,
      iconCls: "animate-spin text-blue-500",
      label: "Cargando…",
    },
    success: {
      Icon: CheckCircle2,
      iconCls: "text-emerald-500",
      label: "¡Completado!",
    },
    error: {
      Icon: XCircle,
      iconCls: "text-red-500",
      label: "Ocurrió un error",
    },
    warning: {
      Icon: AlertTriangle,
      iconCls: "text-amber-500",
      label: "Atención",
    },
  };

  const c = config[state];
  if (!c) return null;
  const { Icon } = c;

  return (
    <>
      <style>{`
        @keyframes overlayFadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .overlay-card { animation: overlayFadeIn 0.2s ease-out both; }
      `}</style>

      {/* Fondo semitransparente fijo */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20">
        {/* Tarjeta blanca */}
        <div className="overlay-card flex items-center gap-4 bg-white rounded-2xl shadow-xl px-8 py-5 border border-gray-100">
          <Icon size={32} strokeWidth={1.8} className={c.iconCls} />
          <span className="text-sm font-semibold text-gray-700">
            {message ?? c.label}
          </span>
        </div>
      </div>
    </>
  );
}
