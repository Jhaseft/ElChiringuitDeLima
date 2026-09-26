@extends('emails.layout', ['title' => 'Código de verificación'])

@section('content')
    <h1 style="margin:8px 0 14px 0; color:#111827; font-size:26px; font-weight:800; line-height:1.25;">
        Tu código de verificación
    </h1>

    <p style="margin:0 0 22px 0; color:#374151; font-size:15px; line-height:1.6;">
        Usa el siguiente código para activar tu cuenta en {{ config('app.name') }}. Ingrésalo en la app o en el sitio web.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <div style="background-color:#F9FAFB; border:1px solid #E5E7EB; border-radius:12px; padding:18px 34px;">
                    <span style="font-size:38px; font-weight:800; letter-spacing:10px; color:#111827; font-family:'Courier New', Courier, monospace;">{{ $code }}</span>
                </div>
            </td>
        </tr>
    </table>

    <p style="margin:22px 0 0 0; color:#6B7280; font-size:13px; line-height:1.6;">
        Este código tiene una duración limitada; si expira, deberás solicitar uno nuevo.
    </p>
    <p style="margin:10px 0 0 0; color:#6B7280; font-size:13px; line-height:1.6;">
        <strong style="color:#374151;">Importante:</strong> si no fuiste tú quien intentó registrarse o iniciar sesión, ignora este mensaje y considera reforzar la seguridad de tu cuenta.
    </p>
@endsection
