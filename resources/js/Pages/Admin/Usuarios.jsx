import AdminLayout from "@/Layouts/admin/AdminLayout";
import AdminUserMediaTable from "@/Components/admin/Users/AdminUserMediaTable";

export default function Usuarios() {
    return (
        <AdminLayout>
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-gray-700">
                    Información de Usuarios
                </h2>
                <AdminUserMediaTable />
            </div>
        </AdminLayout>
    );
}
