import { useState } from "react";
import AdminLayout from "@/Layouts/admin/AdminLayout";
import AdminOverlay from "@/Components/admin/AdminOverlay";
import RolesTable from "@/Components/admin/Administradores/RolesTable";
import AdminsTable from "@/Components/admin/Administradores/AdminsTable";

export default function Administradores({ admins, roles, modules }) {
    const [overlay, setOverlay] = useState(null);
    const [overlayMsg, setOverlayMsg] = useState(null);

    const notify = (state, message) => {
        setOverlayMsg(message ?? null);
        setOverlay(state);
    };

    return (
        <AdminLayout>
            <AdminOverlay
                state={overlay}
                message={overlayMsg}
                onDismiss={() => {
                    setOverlay(null);
                    setOverlayMsg(null);
                }}
            />

            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                    <h2 className="text-2xl sm:text-3xl font-semibold mb-1 text-gray-700">
                        Roles y permisos
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Crea roles y elige a que pestanas del panel accede cada uno.
                    </p>
                    <RolesTable roles={roles} modules={modules} notify={notify} />
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                    <h2 className="text-2xl sm:text-3xl font-semibold mb-1 text-gray-700">
                        Administradores
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Agrega cuentas de acceso al panel y asignales un rol.
                    </p>
                    <AdminsTable admins={admins} roles={roles} notify={notify} />
                </div>
            </div>
        </AdminLayout>
    );
}
