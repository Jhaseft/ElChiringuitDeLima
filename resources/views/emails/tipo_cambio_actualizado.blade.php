<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Nuevo tipo de cambio - Transfer Cash</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">
                    
                    <tr>
                        <td align="center" style="padding:30px 0;">
                            <img src="https://res.cloudinary.com/dnbklbswg/image/upload/v1756305635/logo_n6nqqr.jpg" alt="Transfer Cash" style="width:150px; height:auto;">
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:20px; text-align:center;">
                            <h1 style="color:#333333; margin-bottom:10px;">📢 Nuevo tipo de cambio</h1>
                            <p style="color:#555555; font-size:16px; line-height:1.5; margin:0;">
                                El tipo de cambio ha sido actualizado en <strong>Transfer Cash</strong>.
                            </p>

                            <p style="color:#222222; font-size:20px; font-weight:bold; margin:20px 0;">
                                Compra: 💵 {{ number_format($tipoCambio->compra, 2) }} <br>
                                Venta: 💵 {{ number_format($tipoCambio->venta, 2) }}
                            </p>

                            <p style="color:#777777; font-size:14px; margin-bottom:30px;">
                                Fecha de actualización: <strong>{{ $tipoCambio->fecha_actualizacion }}</strong>
                            </p>

                            <a href="{{ config('app.url') }}" style="display:inline-block; padding:12px 25px; background-color:#FF6600; color:#ffffff; text-decoration:none; border-radius:5px; font-weight:bold;">
                                Ir al sitio
                            </a>

                            <p style="color:#555555; font-size:14px; line-height:1.5; margin-top:30px;">
                                Gracias por confiar en nosotros,<br>
                                <strong>Transfer Cash</strong>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="background-color:#f0f0f0; color:#888888; font-size:12px; padding:15px;">
                            Este mensaje es informativo. No respondas a este correo.<br>
                            © {{ date('Y') }} Transfer Cash. Todos los derechos reservados.
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
