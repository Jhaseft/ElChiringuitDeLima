@component('mail::message')
# 📌 Estimado cliente

Le informamos que su operación ha sido registrada correctamente con el número de operación **{{ $data['transferNumber'] }}**.

---

## 📊 Resumen de la operación

<table style="width:100%; border-collapse: collapse; margin-top:10px; margin-bottom:20px;">
    <tr>
        <td style="border:1px solid #ddd; padding:8px; font-weight:bold;">Monto registrado</td>
        <td style="border:1px solid #ddd; padding:8px;">
            {{ number_format($data['transfer']->amount, 2) }} {{ $data['depositCurrency'] }}
        </td>
    </tr>
    <tr>
        <td style="border:1px solid #ddd; padding:8px; font-weight:bold;">Recibirá</td>
        <td style="border:1px solid #ddd; padding:8px;">
            {{ number_format($data['convertedAmount'], 2) }} {{ $data['receiveCurrency'] }}
        </td>
    </tr>
    <tr>
        <td style="border:1px solid #ddd; padding:8px; font-weight:bold;">Tipo de cambio</td>
        <td style="border:1px solid #ddd; padding:8px;">
            {{ $data['transfer']->exchange_rate }}
        </td>
    </tr>
    <tr>
        <td style="border:1px solid #ddd; padding:8px; font-weight:bold;">Fecha de operación</td>
        <td style="border:1px solid #ddd; padding:8px;">
            {{ $data['transfer']->created_at->format('d/m/Y H:i') }}
        </td>
    </tr>
</table>

---

⚠️ **Nota importante:**  
Las operaciones realizadas fuera de horario serán atendidas al siguiente día hábil.  

### ⏰ Horarios de atención
- **Perú:** Lunes a Viernes 09:00 - 18:00, Sábados 09:00 - 13:00  
- **Bolivia:** Lunes a Viernes 09:00 - 18:00, Sábados 09:00 - 13:00  

---

📩 En breve recibirá un nuevo correo con el **comprobante de depósito correspondiente**.  

Si tiene alguna consulta o necesita asistencia adicional, no dude en contactarnos.  

---

Atentamente,  
**Equipo de Atención al Cliente**  
{{ config('app.name') }}
@endcomponent
