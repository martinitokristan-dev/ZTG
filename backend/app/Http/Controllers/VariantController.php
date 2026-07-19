<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVariantOptionRequest;
use App\Http\Requests\StoreVariantTypeRequest;
use App\Http\Requests\UpdateVariantOptionRequest;
use App\Http\Requests\UpdateVariantTypeRequest;
use App\Models\VariantOption;
use App\Models\VariantType;
use App\Services\Settings\VariantService;
use Illuminate\Http\JsonResponse;

class VariantController extends Controller
{
    protected VariantService $variantService;

    public function __construct(VariantService $variantService)
    {
        $this->variantService = $variantService;
    }

    /**
     * Display a listing of variant types with their options.
     */
    public function index(): JsonResponse
    {
        return response()->json($this->variantService->getAllTypes());
    }

    /**
     * Store a newly created variant type.
     */
    public function storeType(StoreVariantTypeRequest $request): JsonResponse
    {
        $variantType = $this->variantService->createType($request->validated());

        return response()->json([
            'message' => 'Variant type created successfully.',
            'variant_type' => $variantType,
        ], 201);
    }

    /**
     * Update the specified variant type name.
     */
    public function updateType(UpdateVariantTypeRequest $request, VariantType $variantType): JsonResponse
    {
        $updatedType = $this->variantService->updateType($variantType, $request->validated());

        return response()->json([
            'message' => 'Variant type updated successfully.',
            'variant_type' => $updatedType,
        ]);
    }

    /**
     * Remove the specified variant type.
     */
    public function destroyType(VariantType $variantType): JsonResponse
    {
        $this->variantService->deleteType($variantType);

        return response()->json([
            'message' => 'Variant type deleted successfully.',
        ]);
    }

    /**
     * Add a variant option to a variant type.
     */
    public function storeOption(StoreVariantOptionRequest $request, VariantType $variantType): JsonResponse
    {
        $option = $this->variantService->addOption($variantType, $request->validated());

        return response()->json([
            'message' => 'Variant option added successfully.',
            'variant_option' => $option,
        ], 201);
    }

    /**
     * Update the specified variant option.
     */
    public function updateOption(UpdateVariantOptionRequest $request, VariantOption $variantOption): JsonResponse
    {
        $updatedOption = $this->variantService->updateOption($variantOption, $request->validated());

        return response()->json([
            'message' => 'Variant option updated successfully.',
            'variant_option' => $updatedOption,
        ]);
    }

    /**
     * Remove the specified variant option.
     */
    public function destroyOption(VariantOption $variantOption): JsonResponse
    {
        $this->variantService->deleteOption($variantOption);

        return response()->json([
            'message' => 'Variant option deleted successfully.',
        ]);
    }
}
