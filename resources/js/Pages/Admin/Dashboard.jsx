import AdminLayout from "@/Layouts/admin/AdminLayout";

export default function Dashboard() {
    return (
        <AdminLayout>
            <div className="flex items-center justify-center min-h-[70vh]">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-500 text-center px-4">
                    Bienvenido Admin
                </h1>
            </div>
        </AdminLayout>
    );
}
