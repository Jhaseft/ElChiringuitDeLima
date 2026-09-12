import { useState } from "react";
import AdminLayout from "@/Layouts/admin/AdminLayout";
import BannersPanel from "@/Components/admin/Banners/BannersPanel";

export default function Banners({ banners: initialBanners }) {
    const [banners, setBanners] = useState(initialBanners);

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                    <h2 className="text-2xl sm:text-3xl font-semibold mb-2 text-gray-700">
                        Banners del home
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Imágenes del carrusel superior de la app. Se recomienda un formato
                        horizontal (~2.6:1, ej. 1080×415 px). El orden más bajo aparece primero.
                    </p>
                    <BannersPanel banners={banners} onChange={setBanners} />
                </div>
            </div>
        </AdminLayout>
    );
}
