<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any?}', function () {
    return response()->json([
        'status'  => 'active',
        'message' => 'ZTG Heavy Parts API Backend is running.'
    ]);
})->where('any', '^(?!api).*$');
