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

    private function mapearFilas($transfers, string $modo): array
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
        ]);

        $inicio = $request->fecha_inicio;
        $fin    = $request->fecha_fin;

        $transfers   = $this->consultarTransferencias($inicio, $fin);
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

        // Anchos de columna: A-E tabla izquierda, F separador, G-K tabla derecha
        foreach ([
            'A' => 7, 'B' => 8, 'C' => 16, 'D' => 7, 'E' => 16,
            'F' => 3,
            'G' => 7, 'H' => 8, 'I' => 16, 'J' => 7, 'K' => 16,
        ] as $col => $w) {
            $sheet->getColumnDimension($col)->setWidth($w);
        }

        $colorHeader    = 'FF1F3864'; // azul oscuro como en la imagen
        $colorSubHeader = 'FF2E5090';
        $colorTotales   = 'FFFFE599'; // amarillo
        $borderThin     = ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF999999']];
        $borderMedium   = ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF666666']];

        // ── Fila 1: títulos de cada tabla ─────────────────────────────────────
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

        // ── Fila 2: cabeceras de columna ──────────────────────────────────────
        $headers = ['ithem', 'HORA', 'INGRESO', 'TC', 'ENVIADO'];
        foreach ($headers as $i => $h) {
            $colIzq = chr(65 + $i);       // A-E
            $colDer = chr(65 + 6 + $i);   // G-K
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

        // ── Filas de datos ────────────────────────────────────────────────────
        for ($i = 0; $i < $numFilas; $i++) {
            $row = $i + 3;
            $bg  = ($i % 2 === 0) ? 'FFFFFFFF' : 'FFF2F2F2';

            // — Tabla izquierda: PENtoBOB —
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

            // — Tabla derecha: BOBtoPEN —
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

        // ── Fila de totales ───────────────────────────────────────────────────
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

        // ── Enviar archivo ────────────────────────────────────────────────────
        $tipo     = $inicio === $fin ? 'cierre_caja_' . $inicio : 'reporte_' . $inicio . '_' . $fin;
        $filename = $tipo . '.xlsx';

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Cache-Control: max-age=0');

        (new Xlsx($spreadsheet))->save('php://output');
        exit;
    }
}
