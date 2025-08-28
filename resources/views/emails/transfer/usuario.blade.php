<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Operación registrada</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:40px 0;">
        <tr>
            <td align="center">
                <!-- Contenedor principal -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">

                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding:30px 0;">
                            <img src="https://res.cloudinary.com/dnbklbswg/image/upload/v1756305635/logo_n6nqqr.jpg" alt="{{ config('app.name') }}" style="width:150px; height:auto;">
                        </td>
                    </tr>

                    <!-- Encabezado -->
                    <tr>
                        <td style="padding:0 30px 20px 30px; text-align:center;">
                            <h1 style="color:#333333;">📌 Estimado cliente</h1>
                            <p style="color:#555555; font-size:14px; line-height:1.5;">
                                Le informamos que su operación ha sido registrada correctamente con el número de operación <strong>{{ $data['transferNumber'] }}</strong>.
                            </p>
                        </td>
                    </tr>

                    <!-- Resumen de la operación -->
                    <tr>
                        <td style="padding:0 30px 20px 30px;">
                            <h2 style="color:#333333;">📊 Resumen de la operación</h2>
                            <table style="width:100%; border-collapse: collapse; margin-top:10px; margin-bottom:20px;">
                                <tr>
                                    <td style="border:1px solid #ddd; padding:8px; font-weight:bold;">Monto registrado</td>
                                    <td style="border:1px solid #ddd; padding:8px;">{{ number_format($data['transfer']->amount, 2) }} {{ $data['depositCurrency'] }}</td>
                                </tr>
                                <tr>
                                    <td style="border:1px solid #ddd; padding:8px; font-weight:bold;">Recibirá</td>
                                    <td style="border:1px solid #ddd; padding:8px;">{{ number_format($data['convertedAmount'], 2) }} {{ $data['receiveCurrency'] }}</td>
                                </tr>
                                <tr>
                                    <td style="border:1px solid #ddd; padding:8px; font-weight:bold;">Tipo de cambio</td>
                                    <td style="border:1px solid #ddd; padding:8px;">{{ $data['transfer']->exchange_rate }}</td>
                                </tr>
                                <tr>
                                    <td style="border:1px solid #ddd; padding:8px; font-weight:bold;">Fecha de operación</td>
                                    <td style="border:1px solid #ddd; padding:8px;">{{ $data['transfer']->created_at->format('d/m/Y H:i') }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Nota importante -->
                    <tr>
                        <td style="padding:0 30px 20px 30px; color:#555555; font-size:14px; line-height:1.5;">
                            <p>⚠️ <strong>Nota importante:</strong><br>
                            Las operaciones realizadas fuera de horario serán atendidas al siguiente día hábil.</p>

                            <h3 style="color:#333333;">⏰ Horarios de atención</h3>
                            <ul style="padding-left:20px; list-style-type:disc;">
                                <li><strong>Perú:</strong> Lunes a Viernes 09:00 - 18:00, Sábados 09:00 - 13:00</li>
                                <li><strong>Bolivia:</strong> Lunes a Viernes 09:00 - 18:00, Sábados 09:00 - 13:00</li>
                            </ul>
                        </td>
                    </tr>

                    <!-- Mensaje final -->
                    <tr>
                        <td style="padding:0 30px 30px 30px; color:#555555; font-size:14px; line-height:1.5;">
                            <p>📩 En breve recibirá un nuevo correo con el <strong>comprobante de depósito correspondiente</strong>.</p>
                            <p>Si tiene alguna consulta o necesita asistencia adicional, no dude en contactarnos.</p>
                            <p>Atentamente,<br>
                            <strong>Equipo de Atención al Cliente</strong><br>
                            {{ config('app.name') }}</p>
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
