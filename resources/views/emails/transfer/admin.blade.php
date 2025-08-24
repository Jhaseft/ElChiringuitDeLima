@component('mail::message')
# 📌 Nueva transferencia registrada  

---

## 📝 Detalles de la operación
- **Número de operación:** {{ $data['transferNumber'] }}
- **Fecha:** {{ $data['transfer']->created_at->format('d/m/Y H:i') }}
- **Tipo de cambio aplicado:** {{ $data['transfer']->exchange_rate }}

---

## 💰 Depósito recibido
- **Monto recibido:** {{ number_format($data['transfer']->amount, 2) }} {{ $data['depositCurrency'] }}
- **Banco origen:** {{ $data['transfer']->originAccount->bank->name ?? 'Banco N/D' }}
- **Número de cuenta origen:** {{ $data['transfer']->origin_account_number }}

### 👤 Propietario de la cuenta origen
- **Nombre:** {{ $data['transfer']->user->first_name }} {{ $data['transfer']->user->last_name }}
- **Email:** {{ $data['transfer']->user->email }}
- **Teléfono:** {{ $data['transfer']->user->phone ?? 'N/D' }}
- **Nacionalidad:** {{ ucfirst($data['transfer']->user->nationality ?? 'N/D') }}
- **Documento:** {{ $data['transfer']->user->document_number ?? 'N/D' }}

---

## 📤 Monto a enviar
- **Monto convertido:** {{ number_format($data['convertedAmount'], 2) }} {{ $data['receiveCurrency'] }}
- **Banco destino:** {{ $data['transfer']->destinationAccount->bank->name ?? 'Banco N/D' }}
- **Número de cuenta destino:** {{ $data['transfer']->destination_account_number }}

@php
    $destOwner = $data['transfer']->destinationAccount->owner ?? null;
@endphp

@if($destOwner)
### 👤 Titular de la cuenta destino
- **Nombre:** {{ $destOwner->full_name ?? 'N/D' }}
- **Documento:** {{ $destOwner->document_number ?? 'N/D' }}
- **Teléfono:** {{ $destOwner->phone ?? 'N/D' }}
- **Email:** {{ $destOwner->email ?? 'N/D' }}
@endif

---

## 📎 Comprobante
> Verificar con el comprobante adjunto.

---

@component('mail::button', ['url' => url('/admin/transfers')])
🔗 Ir al panel de administración
@endcomponent

Gracias,<br>
**{{ config('app.name') }}**
@endcomponent
