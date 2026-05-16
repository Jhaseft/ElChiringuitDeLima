import AdminLayout from "@/Layouts/admin/AdminLayout";
import ConfiguracionForm from "@/Components/admin/Configuracion";

export default function Configuracion({ configuracion }) {
    return (
        <AdminLayout>
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-gray-700">
                    Configuración de la APP
                </h2>
                <ConfiguracionForm configuracion={configuracion} />
            </div>
        </AdminLayout>
    );
}
