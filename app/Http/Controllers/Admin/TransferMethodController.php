<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TransferMethod;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TransferMethodController extends Controller
{
    public function index()
    {
        $transferMethod = TransferMethod::all();
        return Inertia::render('Admin/Metodos', [
            'metodos' => $transferMethod,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'currency_pair' => 'required|in:BOBtoPEN,PENtoBOB',
            'type'          => 'required|string|max:50',
            'title'         => 'required|string|max:100',
            'number'        => 'nullable|string|max:100',
            'image'         => 'nullable|image|max:4096',
        ]);

        $data = $request->only(['currency_pair', 'type', 'title', 'number']);

        if ($request->hasFile('image')) {
            try {
                $uploadApi = new UploadApi();
                $uploaded = $uploadApi->upload(
                    $request->file('image')->getRealPath(),
                    ['folder' => 'transfer-methods', 'resource_type' => 'image']
                );
                $data['image'] = $uploaded['secure_url'];
            } catch (\Exception $e) {
                Log::error('Error subiendo imagen a Cloudinary', ['message' => $e->getMessage()]);
                return response()->json(['message' => 'Error subiendo la imagen.'], 500);
            }
        }

        $method = TransferMethod::create($data);

        return response()->json(['success' => true, 'method' => $method]);
    }

    public function update(Request $request, string $id)
    {
        $method = TransferMethod::findOrFail($id);

        $request->validate([
            'currency_pair' => 'required|in:BOBtoPEN,PENtoBOB',
            'type'          => 'required|string|max:50',
            'title'         => 'required|string|max:100',
            'number'        => 'nullable|string|max:100',
            'image'         => 'nullable|image|max:4096',
        ]);

        $data = $request->only(['currency_pair', 'type', 'title', 'number']);

        if ($request->hasFile('image')) {
            try {
                $uploadApi = new UploadApi();
                $uploaded = $uploadApi->upload(
                    $request->file('image')->getRealPath(),
                    ['folder' => 'transfer-methods', 'resource_type' => 'image']
                );
                $data['image'] = $uploaded['secure_url'];
            } catch (\Exception $e) {
                Log::error('Error subiendo imagen a Cloudinary', ['message' => $e->getMessage()]);
                return response()->json(['message' => 'Error subiendo la imagen.'], 500);
            }
        }

        $method->update($data);
        $method->refresh();

        return response()->json(['success' => true, 'method' => $method]);
    }

    public function destroy(string $id)
    {
        $method = TransferMethod::findOrFail($id);
        $method->delete();

        return response()->json(['success' => true]);
    }
}
