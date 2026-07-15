<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle authentication login attempt.
     */
    public function login(Request $request)
    {
        $request->validate([
            'login_id' => 'required|string',
            'password' => 'required|string',
            'role' => 'required|string|in:Admin,Cashier,Supervisor',
        ]);

        // Find user by either username or employee_id, matching their selected role
        $user = User::where(function ($query) use ($request) {
            $query->where('username', $request->login_id)
                  ->orWhere('employee_id', $request->login_id);
        })
        ->where('role', $request->role)
        ->where('status', 'Active')
        ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login_id' => ['The provided credentials do not match our records or the selected role.'],
            ]);
        }

        // Generate Sanctum access token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'employee_id' => $user->employee_id,
                'name' => $user->name,
                'real_name' => $user->real_name,
                'role' => $user->role->value ?? $user->role, // handle backed enum serialization
                'profile_photo' => $user->profile_photo,
            ],
        ]);
    }

    /**
     * Log the user out and revoke token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated user details.
     */
    public function user(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'user' => [
                'id' => $user->id,
                'employee_id' => $user->employee_id,
                'name' => $user->name,
                'real_name' => $user->real_name,
                'role' => $user->role->value ?? $user->role,
                'profile_photo' => $user->profile_photo,
            ]
        ]);
    }
}
