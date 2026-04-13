import AdminLayout from "@/Layouts/admin/AdminLayout";
import AdminMetodosTable from "@/Components/admin/Metodos/AdminMetodosTable";

export default function Metodos({ metodos }) {
    return (
        <AdminLayout>
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-gray-700">
                    Métodos de Pago
                </h2>
                <AdminMetodosTable metodos={metodos} />
            </div>
        </AdminLayout>
    );
}
