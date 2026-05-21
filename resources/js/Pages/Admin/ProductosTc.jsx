import { useState } from "react";
import AdminLayout from "@/Layouts/admin/AdminLayout";
import CategoriasPanel from "@/Components/admin/ProductosTc/CategoriasPanel";
import ProductosPanel from "@/Components/admin/ProductosTc/ProductosPanel";

export default function ProductosTc({ categorias: initialCategorias }) {
    const [categorias, setCategorias] = useState(initialCategorias);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

    const handleSelectCategoria = (cat) => {
        setCategoriaSeleccionada((prev) => (prev?.id === cat.id ? null : cat));
    };

    const handleCategoriasSaved = (nuevasCategorias) => {
        setCategorias(nuevasCategorias);
        // Si la categoría seleccionada fue modificada, actualizarla
        if (categoriaSeleccionada) {
            const actualizada = nuevasCategorias.find((c) => c.id === categoriaSeleccionada.id);
            setCategoriaSeleccionada(actualizada ?? null);
        }
    };

    const handleProductosSaved = (categoriaActualizada) => {
        setCategorias((prev) =>
            prev.map((c) => (c.id === categoriaActualizada.id ? categoriaActualizada : c))
        );
        setCategoriaSeleccionada(categoriaActualizada);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                    <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-700">
                        Categorías TC Puntos
                    </h2>
                    <CategoriasPanel
                        categorias={categorias}
                        categoriaSeleccionada={categoriaSeleccionada}
                        onSelect={handleSelectCategoria}
                        onSaved={handleCategoriasSaved}
                    />
                </div>

                {categoriaSeleccionada && (
                    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-700">
                            Productos —{" "}
                            <span className="text-blue-500">{categoriaSeleccionada.nombre}</span>
                        </h2>
                        <ProductosPanel
                            categoria={categoriaSeleccionada}
                            onSaved={handleProductosSaved}
                        />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
