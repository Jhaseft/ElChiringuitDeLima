import AdminLayout from "@/Layouts/admin/AdminLayout";
import TipoCambioForm from "@/Components/admin/TipoCambio/TipoCambioForm";

export default function TipoCambio({ tipoCambio }) {
    return (
        <AdminLayout>
            <div className="flex items-center justify-center min-h-[80vh]">

                <TipoCambioForm tipoCambio={tipoCambio} />
            </div>
        </AdminLayout>
    );
}