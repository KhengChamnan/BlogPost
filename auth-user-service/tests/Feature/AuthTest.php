<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('user can register with valid data', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'user' => ['id', 'name', 'email', 'created_at', 'updated_at'],
            'token',
        ]);

    // Verify user was created in database
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'name' => 'Test User',
    ]);

    // Verify password is hashed
    $user = User::where('email', 'test@example.com')->first();
    expect(Hash::check('password123', $user->password))->toBeTrue();
});

test('user registration fails with invalid email', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => 'Test User',
        'email' => 'invalid-email',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('user registration fails with duplicate email', function () {
    User::factory()->create(['email' => 'existing@example.com']);

    $response = $this->postJson('/api/auth/register', [
        'name' => 'Test User',
        'email' => 'existing@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('user registration fails with short password', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'short',
        'password_confirmation' => 'short',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['password']);
});

test('user registration fails with mismatched password confirmation', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'different123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['password']);
});

test('user registration fails with missing required fields', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => '',
        'email' => '',
        'password' => '',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'email', 'password']);
});

test('user can login with valid credentials', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'user' => ['id', 'name', 'email'],
            'token',
        ]);

    expect($response->json('user.email'))->toBe('test@example.com');
    expect($response->json('token'))->not->toBeEmpty();
});

test('user login fails with invalid email', function () {
    $response = $this->postJson('/api/auth/login', [
        'email' => 'nonexistent@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('user login fails with incorrect password', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'test@example.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(401)
        ->assertJson(['message' => 'Invalid credentials']);
});

test('user login fails with missing credentials', function () {
    $response = $this->postJson('/api/auth/login', [
        'email' => '',
        'password' => '',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email', 'password']);
});

test('authenticated user can verify token', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withHeader('Authorization', 'Bearer ' . $token)
        ->postJson('/api/auth/verify');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'id',
            'name',
            'email',
        ])
        ->assertJson([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ]);
});

test('verify endpoint requires authentication', function () {
    $response = $this->postJson('/api/auth/verify');

    $response->assertStatus(401);
});

test('authenticated user can logout', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    // Verify token exists before logout
    expect($user->tokens()->count())->toBe(1);

    $response = $this->withHeader('Authorization', 'Bearer ' . $token)
        ->postJson('/api/auth/logout');

    $response->assertStatus(200)
        ->assertJson(['message' => 'Logged out']);

    // Verify token was deleted
    expect($user->fresh()->tokens()->count())->toBe(0);
});

test('logout endpoint requires authentication', function () {
    $response = $this->postJson('/api/auth/logout');

    $response->assertStatus(401);
});

