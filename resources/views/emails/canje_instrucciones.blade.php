@extends('emails.layout', ['title' => 'Confirmación de canje'])

@section('content')
    @php
        $puntos = rtrim(rtrim(number_format((float) $puntosUsados, 2, '.', ','), '0'), '.');
        $tieneInstrucciones = filled($instrucciones);
        if ($tieneInstrucciones) {
            $safe   = e($instrucciones);
            $linked = preg_replace(
                '/(https?:\/\/[^\s<]+)/',
                '<a href="$1" style="color:#CA8A04; text-decoration:underline; word-break:break-all;">$1</a>',
                $safe
            );
            $instruccionesHtml = nl2br($linked);
        }
    @endphp

    <h1 style="margin:8px 0 14px 0; color:#111827; font-size:24px; font-weight:800; line-height:1.25;">
        ¡Canje confirmado!
    </h1>

    <p style="margin:0 0 22px 0; color:#374151; font-size:15px; line-height:1.6;">
        Realizaste el canje de <strong style="color:#111827;">{{ $nombreProducto }}</strong> por
        <strong style="color:#111827;">{{ $puntos }} TC Puntos</strong>. A continuación encontrarás las
        instrucciones para hacerlo efectivo.
    </p>

    @if($imagenUrl)
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px 0;">
            <tr>
                <td align="center">
                    <img src="{{ $imagenUrl }}" alt="{{ $nombreProducto }}" width="536" style="display:block; width:100%; max-width:536px; height:auto; border-radius:12px; border:1px solid #E5E7EB;">
                </td>
            </tr>
        </table>
    @endif

    @if($tieneInstrucciones)
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td style="background-color:#FEF9C3; border:1px solid #EAB308; border-radius:12px; padding:18px 20px;">
                    <p style="margin:0 0 10px 0; color:#CA8A04; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">
                        Instrucciones para tu canje
                    </p>
                    <p style="margin:0; color:#374151; font-size:15px; line-height:1.7;">{!! $instruccionesHtml !!}</p>
                </td>
            </tr>
        </table>
    @else
        <p style="margin:0; color:#374151; font-size:15px; line-height:1.6;">
            Pronto nos pondremos en contacto contigo con los pasos para hacer efectivo tu canje.
        </p>
    @endif

    <p style="margin:22px 0 0 0; color:#6B7280; font-size:13px; line-height:1.6;">
        <strong style="color:#374151;">Importante:</strong> los TC Puntos descontados no se reintegran una vez
        confirmado el canje. El tiempo de entrega o activación puede variar según el tipo de producto.
    </p>
@endsection
