<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $th) {
            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/?error=google_auth_failed');
        }

        $user = User::query()->firstOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName() ?: 'Google User',
                'password' => Hash::make(bin2hex(random_bytes(16))),
                'avatar' => $googleUser->getAvatar(),
                'provider' => 'google',
                'provider_id' => $googleUser->getId(),
            ]
        );

        $token = $user->createToken('auth-token')->plainTextToken;

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        return redirect($frontendUrl . '/auth/callback?token=' . urlencode($token));
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'avatar' => $request->user()->avatar,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout realizado com sucesso.',
        ]);
    }
}
