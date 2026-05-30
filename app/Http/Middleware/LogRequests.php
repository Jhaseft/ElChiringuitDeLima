<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogRequests
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        if (str_starts_with($request->getPathInfo(), '/build/')) {
            return;
        }

        $status = $response->getStatusCode();
        $method = $request->method();
        $path   = $request->getPathInfo();
        $ms     = round((microtime(true) - LARAVEL_START) * 1000);
        $userId = $request->user()?->id ? ' user=' . $request->user()->id : '';
        $date   = date('D M d H:i:s Y');

        fwrite(STDERR, "[{$date}] [{$status}]: {$method} {$path}{$userId} ({$ms}ms)\n");
    }
}
