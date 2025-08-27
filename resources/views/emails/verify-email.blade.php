@component('mail::message')
# Hola

Para continuar, haz clic en el botón para verificar tu correo electrónico:

@component('mail::button', ['url' => $url])
Verificar correo
@endcomponent

Gracias,<br>
{{ config('app.name') }}
@endcomponent
