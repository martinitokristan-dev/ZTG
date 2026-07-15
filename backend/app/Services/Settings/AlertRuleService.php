<?php

namespace App\Services\Settings;

use App\Models\AlertRule;
use Illuminate\Database\Eloquent\Collection;

class AlertRuleService
{
    /**
     * Get all alert rules.
     */
    public function getAll(): Collection
    {
        return AlertRule::all();
    }

    /**
     * Create a new alert rule.
     */
    public function createRule(array $data): AlertRule
    {
        return AlertRule::create($data);
    }

    /**
     * Update an existing alert rule.
     */
    public function updateRule(AlertRule $rule, array $data): AlertRule
    {
        $rule->update($data);
        return $rule;
    }

    /**
     * Delete an alert rule.
     */
    public function deleteRule(AlertRule $rule): void
    {
        $rule->delete();
    }

    /**
     * Toggle enabled status of an alert rule.
     */
    public function toggleStatus(AlertRule $rule): AlertRule
    {
        $rule->is_enabled = !$rule->is_enabled;
        $rule->save();
        return $rule;
    }
}
