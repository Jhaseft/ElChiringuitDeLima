import AdminLayout from "@/Layouts/admin/AdminLayout";
import CanjesTable from "@/Components/admin/CanjesTc/CanjesTable";

export default function CanjesTc({ canjes, filters }) {
    return (
        <AdminLayout>
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-700">
                    Canjes TC Puntos
                </h2>
                <CanjesTable canjes={canjes} filters={filters} />
            </div>
        </AdminLayout>
    );
}
