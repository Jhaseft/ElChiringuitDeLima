<?php

namespace App\Http\Requests\Auth;

use App\Services\AuthRateLimiter;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $limiter = app(AuthRateLimiter::class);
        $email   = (string) $this->string('email');

        // Bloquea si ya hubo demasiados intentos fallidos (email + IP).
        $limiter->ensureNotLocked($this, $email);

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            $limiter->hit($this, $email);

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        $limiter->clear($this, $email);
    }
}
