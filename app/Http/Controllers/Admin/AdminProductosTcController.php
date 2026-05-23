<?php

namespace App\Http\Controllers\Admin;
 
use App\Http\Controllers\Controller;
use App\Models\TcCategoria;
use App\Models\TcProducto;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminProductosTcController extends Controller
{
    public function index()
    {
        $categorias = TcCategoria::with('productos')->orderBy('orden')->get();

        return Inertia::render('Admin/ProductosTc', [
            'categorias' => $categorias,
        ]);
    }

    // ── Categorías ──────────────────────────────────────────

    public function storeCategoria(Request $request)
    {
        $data = $request->validate([
            'nombre'      => 'required|string|max:150',
            'descripcion' => 'nullable|string|max:500',
            'activo'      => 'boolean',
            'orden'       => 'integer|min:0',
            'imagen'      => 'nullable|file|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if ($request->hasFile('imagen')) {
            $data['imagen_url'] = $this->subirImagen($request->file('imagen'), 'tc-categorias');
        }
        unset($data['imagen']);

        $categoria = TcCategoria::create($data);

        return response()->json($categoria->load('productos'));
    }

    public function updateCategoria(Request $request, $id)
    {
        $categoria = TcCategoria::findOrFail($id);

        $data = $request->validate([
            'nombre'      => 'required|string|max:150',
            'descripcion' => 'nullable|string|max:500',
            'activo'      => 'boolean',
            'orden'       => 'integer|min:0',
            'imagen'      => 'nullable|file|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if ($request->hasFile('imagen')) {
            $data['imagen_url'] = $this->subirImagen($request->file('imagen'), 'tc-categorias');
        }
        unset($data['imagen']);

        $categoria->update($data);

        return response()->json($categoria->load('productos'));
    }

    public function destroyCategoria($id)
    {
        TcCategoria::findOrFail($id)->delete();

        return response()->json(['ok' => true]);
    }

    // ── Productos ────────────────────────────────────────────

    public function storeProducto(Request $request)
    {
        $data = $request->validate([
            'categoria_id' => 'required|exists:tc_categorias,id',
            'nombre'       => 'required|string|max:150',
            'descripcion'  => 'nullable|string',
            'costo_puntos' => 'required|numeric|min:0',
            'stock'        => 'nullable|integer|min:0',
            'activo'       => 'boolean',
            'orden'        => 'integer|min:0',
            'imagen'       => 'nullable|file|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if ($request->hasFile('imagen')) {
            $data['imagen_url'] = $this->subirImagen($request->file('imagen'), 'tc-productos');
        }
        unset($data['imagen']);

        $producto = TcProducto::create($data);

        return response()->json($producto);
    }

    public function updateProducto(Request $request, $id)
    {
        $producto = TcProducto::findOrFail($id);

        $data = $request->validate([
            'nombre'       => 'required|string|max:150',
            'descripcion'  => 'nullable|string',
            'costo_puntos' => 'required|numeric|min:0',
            'stock'        => 'nullable|integer|min:0',
            'activo'       => 'boolean',
            'orden'        => 'integer|min:0',
            'imagen'       => 'nullable|file|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if ($request->hasFile('imagen')) {
            $data['imagen_url'] = $this->subirImagen($request->file('imagen'), 'tc-productos');
        }
        unset($data['imagen']);

        $producto->update($data);

        return response()->json($producto);
    }

    public function destroyProducto($id)
    {
        TcProducto::findOrFail($id)->delete();

        return response()->json(['ok' => true]);
    }

    // ── Helpers ──────────────────────────────────────────────

    private function subirImagen($file, string $folder): string
    {
        try {
            $uploaded = (new UploadApi())->upload($file->getRealPath(), [
                'folder'        => $folder,
                'resource_type' => 'auto',
            ]);
            return $uploaded['secure_url'];
        } catch (\Exception $e) {
            Log::error("Error subiendo imagen a Cloudinary [{$folder}]", ['msg' => $e->getMessage()]);
            throw $e;
        }
    }
}
