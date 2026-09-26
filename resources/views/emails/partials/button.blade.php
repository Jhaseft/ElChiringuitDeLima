@php($__variant = $variant ?? 'primary')
@php($__bg = $__variant === 'dark' ? '#111827' : '#FACC15')
@php($__fg = $__variant === 'dark' ? '#ffffff' : '#111827')
<a href="{{ $url }}" target="_blank" style="display:inline-block; margin:5px; padding:13px 28px; background-color:{{ $__bg }}; color:{{ $__fg }}; text-decoration:none; border-radius:10px; font-weight:700; font-size:14px;">{{ $label }}</a>
