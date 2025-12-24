<?php

test('the application returns a successful response', function () {
    $response = $this->get('/api/health');

    $response->assertStatus(200)
        ->assertJson([
            'status' => 'ok',
            'service' => 'auth-user-service'
        ]);
});
