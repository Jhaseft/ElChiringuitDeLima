<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminBannersController extends Controller
{
    public function index()
    {
        $banners = Banner::orderBy('sort_order')->orderBy('id')->get();

        return Inertia::render('Admin/Banners', [
            'banners' => $banners,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'sort_order' => 'integer|min:0',
            'is_active'  => 'boolean',
            'imagen'     => 'required|file|mimes:jpg,jpeg,png,webp|max:8192',
        ]);

        $data['image_url']  = $this->subirImagen($request->file('imagen'), 'banners');
        $data['sort_order'] = $data['sort_order'] ?? Banner::max('sort_order') + 1;
        unset($data['imagen']);

        $banner = Banner::create($data);

        return response()->json($banner);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $data = $request->validate([
            'sort_order' => 'integer|min:0',
            'is_active'  => 'boolean',
            'imagen'     => 'nullable|file|mimes:jpg,jpeg,png,webp|max:8192',
        ]);

        if ($request->hasFile('imagen')) {
            $data['image_url'] = $this->subirImagen($request->file('imagen'), 'banners');
        }
        unset($data['imagen']);

        $banner->update($data);

        return response()->json($banner);
    }

    public function destroy($id)
    {
        Banner::findOrFail($id)->delete();

        return response()->json(['ok' => true]);
    }

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
