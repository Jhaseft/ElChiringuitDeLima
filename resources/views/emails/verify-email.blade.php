<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Verificación de correo</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:40px 0;">
        <tr>
            <td align="center">
                <!-- Contenedor principal -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">
                    
                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding:30px 0;">
                            <img src="https://res.cloudinary.com/dnbklbswg/image/upload/v1756305635/logo_n6nqqr.jpg" alt="{{ config('app.name') }}" style="width:150px; height:auto;">
                        </td>
                    </tr>

                    <!-- Contenido -->
                    <tr>
                        <td style="padding:20px; text-align:center;">
                            <h1 style="color:#333333;">Hola</h1>
                            <p style="color:#555555; font-size:16px; line-height:1.5;">
                                Para continuar, haz clic en el botón para verificar tu correo electrónico:
                            </p>

                            <!-- Botón -->
                            <a href="{{ $url }}" style="display:inline-block; padding:12px 25px; margin:20px 0; background-color:#FF6600; color:#ffffff; text-decoration:none; border-radius:5px; font-weight:bold;">
                                Verificar correo
                            </a>

                            <p style="color:#555555; font-size:14px; line-height:1.5; margin-top:20px;">
                                Gracias,<br>
                                <strong>{{ config('app.name') }}</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color:#f0f0f0; color:#888888; font-size:12px; padding:15px;">
                            Si no solicitaste este correo, ignóralo.<br>
                            © {{ date('Y') }} {{ config('app.name') }}. Todos los derechos reservados.
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
