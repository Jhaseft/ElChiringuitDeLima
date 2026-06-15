import AdminLayout from "@/Layouts/admin/AdminLayout";
import TipoCambioForm from "@/Components/admin/TipoCambio/TipoCambioForm";

export default function TipoCambio({ tipoCambio, pips_compra, pips_venta, modo_automatico }) {
    return (
        <AdminLayout>
            <div className="flex items-center justify-center min-h-[80vh]">
                <TipoCambioForm
                    tipoCambio={tipoCambio}
                    pips_compra={pips_compra}
                    pips_venta={pips_venta}
                    modo_automatico={modo_automatico}
                />
            </div>
        </AdminLayout>
    );
}
