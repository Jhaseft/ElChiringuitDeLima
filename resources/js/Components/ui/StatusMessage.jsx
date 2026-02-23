import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

/**
 * StatusMessage — componente reutilizable para estados de carga, éxito y error.
 *
 * Props:
 *  type          "loading" | "success" | "error"   (default: "success")
 *  title         Texto principal                    (required)
 *  description   Texto secundario                  (optional)
 *  onClose       Callback del botón de acción      (optional — si no se pasa, no muestra botón)
 *  actionLabel   Texto del botón                   (default: "Entendido")
 *  overlay       Pantalla completa con fondo oscuro (default: true)
 *                Pasa overlay={false} para renderizar inline dentro de su contenedor.
 *
 * Ejemplos:
 *  <StatusMessage type="loading" title="Procesando su operación..." description="Estamos registrando la transferencia" />
 *  <StatusMessage type="success" title="¡Listo!" description="Tu operación fue registrada." onClose={handleClose} />
 *  <StatusMessage type="error"   title="Ocurrió un error" description="Intenta nuevamente." onClose={handleClose} actionLabel="Cerrar" />
 *  <StatusMessage type="error"   title="Datos inválidos" overlay={false} onClose={handleClose} />
 */
export default function StatusMessage({
  type = "success",
  title,
  description,
  onClose,
  actionLabel = "Entendido",
  overlay = true,
}) {
  if (type === "loading") {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/60">
        <Loader2 className="animate-spin text-white mb-4" size={48} />
        <p className="text-white font-semibold text-lg">{title}</p>
        {description && (
          <p className="text-gray-300 text-sm mt-1">{description}</p>
        )}
      </div>
    );
  }

  const icons = {
    success: <CheckCircle2 className="text-green-600 mb-3" size={48} />,
    error: <XCircle className="text-red-500 mb-3" size={48} />,
  };

  const buttonColors = {
    success: "bg-green-600 hover:bg-green-700",
    error: "bg-red-600 hover:bg-red-700",
  };

  const card = (
    <div className="flex flex-col items-center justify-center text-center py-8 px-6">
      {icons[type]}
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      {description && (
        <p className="text-gray-600 text-sm mt-2">{description}</p>
      )}
      {onClose && (
        <button
          onClick={onClose}
          className={`mt-6 text-white px-6 py-2 rounded-lg text-sm font-semibold transition ${buttonColors[type] ?? "bg-blue-600 hover:bg-blue-700"}`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );

  if (!overlay) return card;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {card}
      </div>
    </div>
  );
}
