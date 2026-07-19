<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAlertRuleRequest;
use App\Http\Requests\UpdateAlertRuleRequest;
use App\Models\AlertRule;
use App\Services\Settings\AlertRuleService;
use Illuminate\Http\JsonResponse;

class AlertRuleController extends Controller
{
    protected AlertRuleService $alertRuleService;

    public function __construct(AlertRuleService $alertRuleService)
    {
        $this->alertRuleService = $alertRuleService;
    }

    /**
     * Display a listing of alert rules.
     */
    public function index(): JsonResponse
    {
        return response()->json($this->alertRuleService->getAll());
    }

    /**
     * Store a newly created alert rule.
     */
    public function store(StoreAlertRuleRequest $request): JsonResponse
    {
        $rule = $this->alertRuleService->createRule($request->validated());

        return response()->json([
            'message' => 'Alert rule created successfully.',
            'alert_rule' => $rule,
        ], 201);
    }

    /**
     * Update the specified alert rule.
     */
    public function update(UpdateAlertRuleRequest $request, AlertRule $alertRule): JsonResponse
    {
        $updatedRule = $this->alertRuleService->updateRule($alertRule, $request->validated());

        return response()->json([
            'message' => 'Alert rule updated successfully.',
            'alert_rule' => $updatedRule,
        ]);
    }

    /**
     * Remove the specified alert rule.
     */
    public function destroy(AlertRule $alertRule): JsonResponse
    {
        $this->alertRuleService->deleteRule($alertRule);

        return response()->json([
            'message' => 'Alert rule deleted successfully.',
        ]);
    }

    /**
     * Toggle the enabled/disabled state of the alert rule.
     */
    public function toggle(AlertRule $alertRule): JsonResponse
    {
        $updatedRule = $this->alertRuleService->toggleStatus($alertRule);

        return response()->json([
            'message' => 'Alert rule status toggled successfully.',
            'alert_rule' => $updatedRule,
        ]);
    }
}
