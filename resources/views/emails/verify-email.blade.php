<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Verificación de correo</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f7fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0; background-color:#f5f7fa;">
        <tr>
            <td align="center">
                
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                    
                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding:30px 20px;">
                            <img src="https://res.cloudinary.com/dnbklbswg/image/upload/v1772202747/logo_n6nqqr__2_-removebg-preview_qngiau.png" alt="{{ config('app.name') }}" style="width:140px; height:auto;">
                        </td>
                    </tr>

                    <!-- Contenido -->
                    <tr>
                        <td style="padding:10px 40px 30px 40px; text-align:center;">
                            <h2 style="color:#2d2d2d; margin-bottom:10px;">Verificación de correo electrónico</h2>

                            <p style="color:#555555; font-size:15px; line-height:1.6;">
                                Gracias por registrarte en <strong>{{ config('app.name') }}</strong>.  
                                Para completar tu proceso de registro y asegurar tu cuenta, por favor verifica tu dirección de correo electrónico haciendo clic en el siguiente botón:
                            </p>


                            <a href="{{ $url }}" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               style="display:inline-block; padding:14px 28px; margin:25px 0; background-color:#FF6600; color:#ffffff; text-decoration:none; border-radius:6px; font-weight:bold; font-size:15px;">
                                Verificar correo
                            </a>

                            <p style="color:#777777; font-size:13px; line-height:1.6;">
                                Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                            </p>

                            <p style="color:#FF6600; font-size:13px; word-break:break-all;">
                                {{ $url }}
                            </p>

                            <p style="color:#555555; font-size:14px; line-height:1.6; margin-top:25px;">
                                Si no solicitaste este correo, puedes ignorarlo de forma segura.
                            </p>

                            <p style="color:#555555; font-size:14px; margin-top:20px;">
                                Saludos cordiales,<br>
                                <strong>Equipo {{ config('app.name') }}</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color:#f0f0f0; color:#888888; font-size:12px; padding:15px;">
                            © {{ date('Y') }} {{ config('app.name') }}. Todos los derechos reservados.
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>