<?php

namespace App\Http\Controllers;

use App\Models\Checker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Checker::query();
        
        if ($request->boolean('active_only')) {
            $query->where('status', 'Active');
        }
        
        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:checkers',
            'status' => 'nullable|string|in:Active,Inactive',
        ]);

        $checker = Checker::create([
            'name' => $validated['name'],
            'status' => $validated['status'] ?? 'Active',
        ]);

        return response()->json([
            'message' => 'Checker created successfully.',
            'checker' => $checker,
        ], 201);
    }

    public function update(Request $request, Checker $checker): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:checkers,name,' . $checker->id,
            'status' => 'sometimes|required|string|in:Active,Inactive',
        ]);

        $checker->update($validated);

        return response()->json([
            'message' => 'Checker updated successfully.',
            'checker' => $checker,
        ]);
    }
}
