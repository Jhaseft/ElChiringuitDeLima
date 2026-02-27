<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación de correo</title>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Arial, sans-serif; background-color:#f0f2f5;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f5; padding:50px 20px;">
        <tr>
            <td align="center">


                <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.10);">

                    
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #FF6600 0%, #ff8c42 100%); padding:40px 30px 30px 30px;">
                            <img src="https://res.cloudinary.com/dnbklbswg/image/upload/v1772202747/logo_n6nqqr__2_-removebg-preview_qngiau.png"
                                 alt="{{ config('app.name') }}"
                                 style="width:140px; height:auto; display:block; margin:0 auto;">
                        </td>
                    </tr>

                     <tr>
                        <td align="center" style="padding:0; background-color:#ffffff;">
                            <div style="display:inline-block; background-color:#FFF3EA; border-radius:50%; width:70px; height:70px; text-align:center; line-height:70px; margin-top:-20px; border:4px solid #ffffff;">
                                <span style="font-size:32px; line-height:62px; display:block;">✉️</span>
                            </div>
                        </td>
                    </tr>

                    
                    <tr>
                        <td style="padding:30px 50px 10px 50px; text-align:center;">
                            <h1 style="color:#1a1a2e; font-size:26px; font-weight:700; margin:16px 0 10px 0; letter-spacing:-0.5px;">
                                Verifica tu correo electrónico
                            </h1>
                            <p style="color:#6b7280; font-size:16px; line-height:1.7; margin:0 0 28px 0;">
                                Gracias por registrarte. Para activar tu cuenta y comenzar a usar
                                <strong style="color:#FF6600;">{{ config('app.name') }}</strong>,
                                haz clic en el botón de abajo.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding:0 50px 30px 50px;">
                            <a href="{{ $url }}"
                               target="_blank"
                               style="display:inline-block;
                                      padding:16px 40px;
                                      background: linear-gradient(135deg, #FF6600 0%, #ff8c42 100%);
                                      color:#ffffff;
                                      text-decoration:none;
                                      border-radius:50px;
                                      font-size:16px;
                                      font-weight:700;
                                      letter-spacing:0.3px;
                                      box-shadow:0 6px 20px rgba(255,102,0,0.35);">
                                Verificar mi cuenta &rarr;
                            </a>
                        </td>
                    </tr>

                    
                    <tr>
                        <td style="padding:0 50px;">
                            <hr style="border:none; border-top:1px solid #f0f2f5; margin:0;">
                        </td>
                    </tr>

                  
                    <tr>
                        <td style="padding:20px 50px; text-align:center;">
                            <p style="color:#9ca3af; font-size:13px; line-height:1.6; margin:0;">
                                Si el botón no funciona, copia y pega este enlace en tu navegador:
                            </p>
                            <p style="margin:8px 0 0 0;">
                                <a href="{{ $url }}" target="_blank"
                                   style="color:#FF6600; font-size:12px; word-break:break-all; text-decoration:none;">
                                    {{ $url }}
                                </a>
                            </p>
                        </td>
                    </tr>

               
                    <tr>
                        <td style="padding:0 50px 30px 50px;">
                            <table width="100%" cellpadding="0" cellspacing="0"
                                   style="background-color:#FFF8F5; border-left:4px solid #FF6600; border-radius:0 8px 8px 0;">
                                <tr>
                                    <td style="padding:14px 16px;">
                                        <p style="color:#92400e; font-size:13px; line-height:1.5; margin:0;">
                                            <strong>Nota:</strong> Si no creaste una cuenta en {{ config('app.name') }}, puedes ignorar este mensaje con total seguridad.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

              
                    <tr>
                        <td align="center" style="background-color:#f8f9fa; padding:20px 30px; border-top:1px solid #e5e7eb;">
                            <p style="color:#9ca3af; font-size:12px; margin:0; line-height:1.6;">
                                &copy; {{ date('Y') }} <strong>{{ config('app.name') }}</strong>. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
