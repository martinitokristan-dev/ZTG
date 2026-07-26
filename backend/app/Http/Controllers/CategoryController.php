<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\Settings\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    protected CategoryService $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    /**
     * Display a listing of categories.
     * Pass ?top_selling=5 to return top N categories by total units sold (for POS category pills).
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->has('top_selling')) {
            $limit = max(1, (int) $request->input('top_selling', 5));
            return response()->json($this->categoryService->getTopSelling($limit));
        }

        return response()->json($this->categoryService->getAll());
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->createCategory($request->validated());

        return response()->json([
            'message' => 'Category created successfully.',
            'category' => $category,
        ], 201);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $updatedCategory = $this->categoryService->updateCategory($category, $request->validated());

        return response()->json([
            'message' => 'Category updated successfully.',
            'category' => $updatedCategory,
        ]);
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category): JsonResponse
    {
        $this->categoryService->deleteCategory($category);

        return response()->json([
            'message' => 'Category deleted successfully.',
        ]);
    }
}
