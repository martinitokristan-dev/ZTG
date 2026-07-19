<?php

namespace App\Services\Settings;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class CategoryService
{
    /**
     * Get all categories.
     */
    public function getAll(): Collection
    {
        return Category::all();
    }

    /**
     * Create a new category.
     */
    public function createCategory(array $data): Category
    {
        return Category::create($data);
    }

    /**
     * Update an existing category.
     */
    public function updateCategory(Category $category, array $data): Category
    {
        $category->update($data);
        return $category;
    }

    /**
     * Delete a category if it has no associated products.
     */
    public function deleteCategory(Category $category): void
    {
        if ($category->products()->exists()) {
            throw ValidationException::withMessages([
                'category' => ['Cannot delete category because it has associated products.'],
            ]);
        }

        $category->delete();
    }
}
