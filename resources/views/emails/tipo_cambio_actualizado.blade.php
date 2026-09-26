@extends('emails.layout', ['title' => 'Nuevo tipo de cambio'])

@section('content')
    <h1 style="margin:8px 0 14px 0; color:#111827; font-size:26px; font-weight:800; line-height:1.25;">
        Nuevo tipo de cambio
    </h1>

    <p style="margin:0 0 22px 0; color:#374151; font-size:15px; line-height:1.6;">
        El tipo de cambio ha sido actualizado en {{ config('app.name') }}. Estos son los valores vigentes:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td width="50%" style="padding:0 6px 0 0;">
                <div style="background-color:#F9FAFB; border:1px solid #E5E7EB; border-radius:12px; padding:18px; text-align:center;">
                    <p style="margin:0 0 6px 0; color:#6B7280; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Compra</p>
                    <p style="margin:0; color:#111827; font-size:28px; font-weight:800;">{{ number_format($tipoCambio->compra, 2) }}</p>
                </div>
            </td>
            <td width="50%" style="padding:0 0 0 6px;">
                <div style="background-color:#F9FAFB; border:1px solid #E5E7EB; border-radius:12px; padding:18px; text-align:center;">
                    <p style="margin:0 0 6px 0; color:#6B7280; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Venta</p>
                    <p style="margin:0; color:#111827; font-size:28px; font-weight:800;">{{ number_format($tipoCambio->venta, 2) }}</p>
                </div>
            </td>
        </tr>
    </table>

    <p style="margin:20px 0 24px 0; color:#6B7280; font-size:13px;">
        Fecha de actualización: <strong style="color:#374151;">{{ $tipoCambio->fecha_actualizacion }}</strong>
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                @include('emails.partials.button', ['url' => config('app.site_url', config('app.url')), 'label' => 'Ir al sitio'])
            </td>
        </tr>
    </table>
@endsection
