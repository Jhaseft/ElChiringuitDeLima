<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transfer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ReportesController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Reportes');
    }

    private function consultarTransferencias(string $inicio, string $fin)
    {
        return Transfer::query()
            ->where('status', 'completed')
            ->whereBetween('created_at', [$inicio . ' 00:00:00', $fin . ' 23:59:59'])
            ->select('created_at', 'amount', 'exchange_rate', 'converted_amount', 'modo')
            ->orderBy('created_at')
            ->get();
    }

    private function mapearFilas(\Illuminate\Support\Collection $transfers, string $modo): array
    {
        $filas = $transfers->where('modo', $modo)->values();
        return $filas->map(fn($t, $i) => [
            'item'    => $i + 1,
            'hora'    => \Carbon\Carbon::parse($t->created_at)->format('H:i'),
            'ingreso' => round((float) $t->amount, 2),
            'tc'      => round((float) $t->exchange_rate, 2),
            'enviado' => round((float) $t->converted_amount, 2),
        ])->toArray();
    }

    public function datos(Request $request)
    {
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin'    => 'required|date|after_or_equal:fecha_inicio',
        ]);

        $transfers  = $this->consultarTransferencias($request->fecha_inicio, $request->fecha_fin);
        $penBobFilas = collect($this->mapearFilas($transfers, 'PENtoBOB'));
        $bobPenFilas = collect($this->mapearFilas($transfers, 'BOBtoPEN'));

        return response()->json([
            'pen_a_bob' => [
                'filas'         => $penBobFilas->values(),
                'total_ingreso' => round($penBobFilas->sum('ingreso'), 2),
                'total_enviado' => round($penBobFilas->sum('enviado'), 2),
            ],
            'bob_a_pen' => [
                'filas'         => $bobPenFilas->values(),
                'total_ingreso' => round($bobPenFilas->sum('ingreso'), 2),
                'total_enviado' => round($bobPenFilas->sum('enviado'), 2),
            ],
        ]);
    }

    public function exportarExcel(Request $request)
    {
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin'    => 'required|date|after_or_equal:fecha_inicio',
            'monto_bob'    => 'nullable|numeric|min:0',
            'monto_pen'    => 'nullable|numeric|min:0',
        ]);

        $inicio    = $request->fecha_inicio;
        $fin       = $request->fecha_fin;
        $transfers = $this->consultarTransferencias($inicio, $fin);

        if ($request->filled('monto_bob') && $request->filled('monto_pen')) {
            $this->exportarConMontos(
                $transfers,
                $inicio,
                $fin,
                (float) $request->monto_bob,
                (float) $request->monto_pen
            );
        } else {
            $this->exportarSimple($transfers, $inicio, $fin);
        }
    }

    // ── Formato simple (cierre de caja y compatibilidad) ──────────────────────

    private function exportarSimple($transfers, string $inicio, string $fin): void
    {
        $penBobFilas = collect($this->mapearFilas($transfers, 'PENtoBOB'));
        $bobPenFilas = collect($this->mapearFilas($transfers, 'BOBtoPEN'));

        $totalPenBobIngreso = round($penBobFilas->sum('ingreso'), 2);
        $totalPenBobEnviado = round($penBobFilas->sum('enviado'), 2);
        $totalBobPenIngreso = round($bobPenFilas->sum('ingreso'), 2);
        $totalBobPenEnviado = round($bobPenFilas->sum('enviado'), 2);

        $numFilas = max($penBobFilas->count(), $bobPenFilas->count(), 14);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Reporte');

        foreach ([
            'A' => 7, 'B' => 8, 'C' => 16, 'D' => 7, 'E' => 16,
            'F' => 3,
            'G' => 7, 'H' => 8, 'I' => 16, 'J' => 7, 'K' => 16,
        ] as $col => $w) {
            $sheet->getColumnDimension($col)->setWidth($w);
        }

        $colorHeader    = 'FF1F3864';
        $colorSubHeader = 'FF2E5090';
        $colorTotales   = 'FFFFE599';
        $borderThin     = ['borderStyle' => Border::BORDER_THIN,   'color' => ['argb' => 'FF999999']];
        $borderMedium   = ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF666666']];

        $sheet->mergeCells('A1:E1');
        $sheet->setCellValue('A1', 'VENTA DE BOLIVIANOS');
        $sheet->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorHeader]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => $borderThin],
        ]);

        $sheet->mergeCells('G1:K1');
        $sheet->setCellValue('G1', 'VENTA DE SOLES');
        $sheet->getStyle('G1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorHeader]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => $borderThin],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(20);

        $headers = ['ithem', 'HORA', 'INGRESO', 'TC', 'ENVIADO'];
        foreach ($headers as $i => $h) {
            $colIzq = chr(65 + $i);
            $colDer = chr(65 + 6 + $i);
            foreach ([$colIzq, $colDer] as $col) {
                $sheet->setCellValue("{$col}2", $h);
                $sheet->getStyle("{$col}2")->applyFromArray([
                    'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                    'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorSubHeader]],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                    'borders'   => ['allBorders' => $borderThin],
                ]);
            }
        }
        $sheet->getRowDimension(2)->setRowHeight(16);

        for ($i = 0; $i < $numFilas; $i++) {
            $row = $i + 3;
            $bg  = ($i % 2 === 0) ? 'FFFFFFFF' : 'FFF2F2F2';

            $fPen = $penBobFilas[$i] ?? null;
            $sheet->setCellValue("A{$row}", $fPen ? $fPen['item'] : '');
            $sheet->setCellValue("B{$row}", $fPen ? $fPen['hora'] : '');
            $sheet->setCellValue("C{$row}", $fPen ? number_format($fPen['ingreso'], 2, '.', ' ') . ' PEN' : '');
            $sheet->setCellValue("D{$row}", $fPen ? $fPen['tc'] : '');
            $sheet->setCellValue("E{$row}", $fPen ? number_format($fPen['enviado'], 2, '.', ' ') . ' BOB' : '');
            foreach (['A', 'B', 'C', 'D', 'E'] as $col) {
                $sheet->getStyle("{$col}{$row}")->applyFromArray([
                    'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bg]],
                    'borders'   => ['allBorders' => $borderThin],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
                ]);
            }
            $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("B{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $fBob = $bobPenFilas[$i] ?? null;
            $sheet->setCellValue("G{$row}", $fBob ? $fBob['item'] : '');
            $sheet->setCellValue("H{$row}", $fBob ? $fBob['hora'] : '');
            $sheet->setCellValue("I{$row}", $fBob ? number_format($fBob['ingreso'], 2, '.', ' ') . ' BOB' : '');
            $sheet->setCellValue("J{$row}", $fBob ? $fBob['tc'] : '');
            $sheet->setCellValue("K{$row}", $fBob ? number_format($fBob['enviado'], 2, '.', ' ') . ' PEN' : '');
            foreach (['G', 'H', 'I', 'J', 'K'] as $col) {
                $sheet->getStyle("{$col}{$row}")->applyFromArray([
                    'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bg]],
                    'borders'   => ['allBorders' => $borderThin],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
                ]);
            }
            $sheet->getStyle("G{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("H{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $sheet->getRowDimension($row)->setRowHeight(15);
        }

        $totRow = $numFilas + 3;
        $sheet->setCellValue("A{$totRow}", 'Totales');
        $sheet->setCellValue("C{$totRow}", number_format($totalPenBobIngreso, 2, '.', ' ') . ' PEN');
        $sheet->setCellValue("E{$totRow}", number_format($totalPenBobEnviado, 2, '.', ' ') . ' BOB');
        $sheet->getStyle("A{$totRow}:E{$totRow}")->applyFromArray([
            'font'      => ['bold' => true],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorTotales]],
            'borders'   => ['allBorders' => $borderMedium],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        ]);
        $sheet->getStyle("A{$totRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

        $sheet->setCellValue("G{$totRow}", 'Totales');
        $sheet->setCellValue("I{$totRow}", number_format($totalBobPenIngreso, 2, '.', ' ') . ' BOB');
        $sheet->setCellValue("K{$totRow}", number_format($totalBobPenEnviado, 2, '.', ' ') . ' PEN');
        $sheet->getStyle("G{$totRow}:K{$totRow}")->applyFromArray([
            'font'      => ['bold' => true],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorTotales]],
            'borders'   => ['allBorders' => $borderMedium],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        ]);
        $sheet->getStyle("G{$totRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $sheet->getRowDimension($totRow)->setRowHeight(16);

        $tipo     = $inicio === $fin ? 'cierre_caja_' . $inicio : 'reporte_' . $inicio . '_' . $fin;
        $filename = $tipo . '.xlsx';

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Cache-Control: max-age=0');
        (new Xlsx($spreadsheet))->save('php://output');
        exit;
    }

    // ── Formato con montos y separadores por día ──────────────────────────────

    private function exportarConMontos($transfers, string $inicio, string $fin, float $montoBob, float $montoPen): void
    {
        $penBobPorDia = $transfers->where('modo', 'PENtoBOB')
            ->groupBy(fn($t) => \Carbon\Carbon::parse($t->created_at)->format('Y-m-d'));
        $bobPenPorDia = $transfers->where('modo', 'BOBtoPEN')
            ->groupBy(fn($t) => \Carbon\Carbon::parse($t->created_at)->format('Y-m-d'));

        $fechas = $penBobPorDia->keys()
            ->merge($bobPenPorDia->keys())
            ->unique()->sort()->values();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Reporte');

        // A-F tabla izquierda + saldo, G separador, H-M tabla derecha + saldo
        foreach ([
            'A' => 7,  'B' => 8, 'C' => 16, 'D' => 7, 'E' => 16, 'F' => 20,
            'G' => 3,
            'H' => 7,  'I' => 8, 'J' => 16, 'K' => 7, 'L' => 16, 'M' => 20,
        ] as $col => $w) {
            $sheet->getColumnDimension($col)->setWidth($w);
        }

        $colorHeader    = 'FF1F3864';
        $colorSubHeader = 'FF2E5090';
        $colorMontoHdr  = 'FF375623';
        $colorTotales   = 'FFFFE599';
        $colorSep       = 'FF4472C4';
        $colorSaldoPos  = 'FFE2EFDA';
        $colorSaldoNeg  = 'FFFFC7CE';
        $borderThin     = ['borderStyle' => Border::BORDER_THIN,   'color' => ['argb' => 'FF999999']];
        $borderMedium   = ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF666666']];

        // ── Fila 1: títulos ───────────────────────────────────────────────────
        $sheet->getRowDimension(1)->setRowHeight(40);

        $sheet->mergeCells('A1:E1');
        $sheet->setCellValue('A1', 'VENTA DE BOLIVIANOS');
        $sheet->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorHeader]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => $borderThin],
        ]);

        $sheet->setCellValue('F1', "Monto Inicial\nBolivianos\n" . number_format($montoBob, 2, '.', ',') . ' BOB');
        $sheet->getStyle('F1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 9],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorMontoHdr]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders'   => ['allBorders' => $borderThin],
        ]);

        $sheet->mergeCells('H1:L1');
        $sheet->setCellValue('H1', 'VENTA DE SOLES');
        $sheet->getStyle('H1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorHeader]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => $borderThin],
        ]);

        $sheet->setCellValue('M1', "Monto Inicial\nSoles\n" . number_format($montoPen, 2, '.', ',') . ' PEN');
        $sheet->getStyle('M1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 9],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorMontoHdr]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders'   => ['allBorders' => $borderThin],
        ]);

        // ── Fila 2: sub-cabeceras ─────────────────────────────────────────────
        $sheet->getRowDimension(2)->setRowHeight(16);
        $subHeaders = [
            'A' => 'ithem', 'B' => 'HORA', 'C' => 'INGRESO', 'D' => 'TC', 'E' => 'ENVIADO', 'F' => 'SALDO',
            'H' => 'ithem', 'I' => 'HORA', 'J' => 'INGRESO', 'K' => 'TC', 'L' => 'ENVIADO', 'M' => 'SALDO',
        ];
        foreach ($subHeaders as $col => $label) {
            $sheet->setCellValue("{$col}2", $label);
            $sheet->getStyle("{$col}2")->applyFromArray([
                'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorSubHeader]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'borders'   => ['allBorders' => $borderThin],
            ]);
        }

        // ── Filas de datos agrupadas por día ──────────────────────────────────
        $currentRow         = 3;
        $saldoBob           = $montoBob;
        $saldoPen           = $montoPen;
        $totalPenBobIngreso = 0.0;
        $totalPenBobEnviado = 0.0;
        $totalBobPenIngreso = 0.0;
        $totalBobPenEnviado = 0.0;

        $diasNombre = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        foreach ($fechas as $fecha) {
            // — Separador de día —
            $sheet->mergeCells("A{$currentRow}:M{$currentRow}");
            $carbonFecha = \Carbon\Carbon::parse($fecha);
            $fechaFmt    = $carbonFecha->format('d/m/Y');
            $diaNombre   = $diasNombre[$carbonFecha->dayOfWeekIso];
            $sheet->setCellValue("A{$currentRow}", "DÍA: {$fechaFmt}  —  {$diaNombre}");
            $sheet->getStyle("A{$currentRow}")->applyFromArray([
                'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 10],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorSep]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                'borders'   => ['outline' => $borderMedium],
            ]);
            $sheet->getRowDimension($currentRow)->setRowHeight(18);
            $currentRow++;

            $penBobDia   = ($penBobPorDia->get($fecha) ?? collect())->values();
            $bobPenDia   = ($bobPenPorDia->get($fecha) ?? collect())->values();
            $numFilasDia = max($penBobDia->count(), $bobPenDia->count());

            for ($i = 0; $i < $numFilasDia; $i++) {
                $row = $currentRow;
                $bg  = ($i % 2 === 0) ? 'FFFFFFFF' : 'FFF2F2F2';

                // — Lado izquierdo: PENtoBOB —
                $fPen    = $penBobDia[$i] ?? null;
                $bgSaldoBob = $bg;
                if ($fPen) {
                    $enviado = round((float) $fPen->converted_amount, 2);
                    $saldoBob -= $enviado;
                    $totalPenBobIngreso += round((float) $fPen->amount, 2);
                    $totalPenBobEnviado += $enviado;
                    $bgSaldoBob = $saldoBob >= 0 ? $colorSaldoPos : $colorSaldoNeg;

                    $sheet->setCellValue("A{$row}", $i + 1);
                    $sheet->setCellValue("B{$row}", $carbonFecha->format('H:i') === '00:00'
                        ? \Carbon\Carbon::parse($fPen->created_at)->format('H:i')
                        : \Carbon\Carbon::parse($fPen->created_at)->format('H:i'));
                    $sheet->setCellValue("C{$row}", number_format(round((float) $fPen->amount, 2), 2, '.', ' ') . ' PEN');
                    $sheet->setCellValue("D{$row}", round((float) $fPen->exchange_rate, 2));
                    $sheet->setCellValue("E{$row}", number_format($enviado, 2, '.', ' ') . ' BOB');
                    $sheet->setCellValue("F{$row}", number_format($saldoBob, 2, '.', ',') . ' BOB');
                }
                foreach (['A', 'B', 'C', 'D', 'E'] as $col) {
                    $sheet->getStyle("{$col}{$row}")->applyFromArray([
                        'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bg]],
                        'borders'   => ['allBorders' => $borderThin],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
                    ]);
                }
                $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("B{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("F{$row}")->applyFromArray([
                    'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bgSaldoBob]],
                    'borders'   => ['allBorders' => $borderThin],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
                    'font'      => ['bold' => (bool) $fPen],
                ]);

                // — Lado derecho: BOBtoPEN —
                $fBob    = $bobPenDia[$i] ?? null;
                $bgSaldoPen = $bg;
                if ($fBob) {
                    $enviado = round((float) $fBob->converted_amount, 2);
                    $saldoPen -= $enviado;
                    $totalBobPenIngreso += round((float) $fBob->amount, 2);
                    $totalBobPenEnviado += $enviado;
                    $bgSaldoPen = $saldoPen >= 0 ? $colorSaldoPos : $colorSaldoNeg;

                    $sheet->setCellValue("H{$row}", $i + 1);
                    $sheet->setCellValue("I{$row}", \Carbon\Carbon::parse($fBob->created_at)->format('H:i'));
                    $sheet->setCellValue("J{$row}", number_format(round((float) $fBob->amount, 2), 2, '.', ' ') . ' BOB');
                    $sheet->setCellValue("K{$row}", round((float) $fBob->exchange_rate, 2));
                    $sheet->setCellValue("L{$row}", number_format($enviado, 2, '.', ' ') . ' PEN');
                    $sheet->setCellValue("M{$row}", number_format($saldoPen, 2, '.', ',') . ' PEN');
                }
                foreach (['H', 'I', 'J', 'K', 'L'] as $col) {
                    $sheet->getStyle("{$col}{$row}")->applyFromArray([
                        'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bg]],
                        'borders'   => ['allBorders' => $borderThin],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
                    ]);
                }
                $sheet->getStyle("H{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("I{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("M{$row}")->applyFromArray([
                    'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bgSaldoPen]],
                    'borders'   => ['allBorders' => $borderThin],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
                    'font'      => ['bold' => (bool) $fBob],
                ]);

                $sheet->getRowDimension($row)->setRowHeight(15);
                $currentRow++;
            }
        }

        // ── Fila de totales ───────────────────────────────────────────────────
        $totRow = $currentRow;
        $bgSaldoFinalBob = $saldoBob >= 0 ? $colorSaldoPos : $colorSaldoNeg;
        $bgSaldoFinalPen = $saldoPen >= 0 ? $colorSaldoPos : $colorSaldoNeg;

        $sheet->setCellValue("A{$totRow}", 'Totales');
        $sheet->setCellValue("C{$totRow}", number_format($totalPenBobIngreso, 2, '.', ' ') . ' PEN');
        $sheet->setCellValue("E{$totRow}", number_format($totalPenBobEnviado, 2, '.', ' ') . ' BOB');
        $sheet->setCellValue("F{$totRow}", number_format($saldoBob, 2, '.', ',') . ' BOB');
        $sheet->getStyle("A{$totRow}:E{$totRow}")->applyFromArray([
            'font'      => ['bold' => true],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorTotales]],
            'borders'   => ['allBorders' => $borderMedium],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        ]);
        $sheet->getStyle("A{$totRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $sheet->getStyle("F{$totRow}")->applyFromArray([
            'font'      => ['bold' => true],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bgSaldoFinalBob]],
            'borders'   => ['allBorders' => $borderMedium],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        ]);

        $sheet->setCellValue("H{$totRow}", 'Totales');
        $sheet->setCellValue("J{$totRow}", number_format($totalBobPenIngreso, 2, '.', ' ') . ' BOB');
        $sheet->setCellValue("L{$totRow}", number_format($totalBobPenEnviado, 2, '.', ' ') . ' PEN');
        $sheet->setCellValue("M{$totRow}", number_format($saldoPen, 2, '.', ',') . ' PEN');
        $sheet->getStyle("H{$totRow}:L{$totRow}")->applyFromArray([
            'font'      => ['bold' => true],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorTotales]],
            'borders'   => ['allBorders' => $borderMedium],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        ]);
        $sheet->getStyle("H{$totRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $sheet->getStyle("M{$totRow}")->applyFromArray([
            'font'      => ['bold' => true],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bgSaldoFinalPen]],
            'borders'   => ['allBorders' => $borderMedium],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        ]);
        $sheet->getRowDimension($totRow)->setRowHeight(16);

        // ── Enviar archivo ────────────────────────────────────────────────────
        $filename = 'reporte_' . $inicio . '_' . $fin . '.xlsx';
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Cache-Control: max-age=0');
        (new Xlsx($spreadsheet))->save('php://output');
        exit;
    }
}
