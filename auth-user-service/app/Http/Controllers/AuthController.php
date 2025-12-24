<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $feilds = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create($feilds);

        $token = $user->createToken($request->name)->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email|exists:users',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken($user->name)->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return ['message' => 'Logged out'];
    }

    public function verify(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ]);
    }
}
