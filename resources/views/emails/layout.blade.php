@php
    $appName = config('app.name', 'TransferCash');
    $appUrl  = config('app.site_url', config('app.url'));
    $logo    = rtrim($appUrl, '/').'/images/Logo_web_03.webp';
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="color-scheme" content="light only">
    <title>@yield('title', $appName)</title>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; padding:32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #E5E7EB;">

                    <tr>
                        <td style="height:6px; background-color:#FACC15; font-size:0; line-height:0;">&nbsp;</td>
                    </tr>

                    <tr>
                        <td align="center" style="padding:28px 32px 8px 32px; background-color:#ffffff;">
                            <img src="{{ $logo }}" alt="{{ $appName }}" width="170" style="display:block; margin:0 auto; width:170px; height:auto; border:0;">
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:12px 32px 24px 32px; color:#111827; font-size:15px; line-height:1.6;">
                            @yield('content')
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:24px 32px; background-color:#111827;">
                            <p style="margin:0 0 10px 0; color:#9CA3AF; font-size:12px; line-height:1.6;">
                                Este es un mensaje automático de <strong style="color:#E5E7EB;">{{ $appName }}</strong>. Por tu seguridad, <strong style="color:#FACC15;">no respondas a este correo</strong>: el buzón no es monitoreado.
                            </p>
                            <p style="margin:0 0 10px 0; font-size:12px;">
                                <a href="{{ $appUrl }}" style="color:#FACC15; text-decoration:none;">Ir al sitio</a>
                                <span style="color:#4B5563;"> &nbsp;·&nbsp; </span>
                                <a href="{{ $appUrl }}/politicas" style="color:#FACC15; text-decoration:none;">Políticas de privacidad</a>
                            </p>
                            <p style="margin:0; color:#6B7280; font-size:11px;">
                                © {{ date('Y') }} {{ $appName }}. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>

                </table>

                <p style="max-width:600px; margin:16px auto 0; color:#9CA3AF; font-size:11px; line-height:1.5; text-align:center;">
                    Recibiste este correo porque tienes una cuenta registrada en {{ $appName }}.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
