import AdminLayout from "@/Layouts/admin/AdminLayout";
import AdminTransfers from "@/Components/admin/Efectivo/EfectivoTransfers";

export default function Transferencias({ transfers, filters }) {
    return (
        <AdminLayout>
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-gray-700">
                    Transferencias con Efectivo de Usuarios
                </h2>
                <AdminTransfers transfers={transfers} filters={filters} />
            </div>
        </AdminLayout>
    );
}
