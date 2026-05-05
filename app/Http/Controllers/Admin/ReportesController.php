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
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class ReportesController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Reportes');
    }

    /**
     * Tasas en BOB/PEN (cuántos BOB equivalen a 1 PEN).
     * Ej: compra = 2.77, venta = 2.84
     *
     * Utilidad BOBtoPEN: cliente da BOB, negocio da PEN
     *   → negocio aplica compra → ganancia = (BOB_recibidos / compra) - PEN_dados
     *
     * Utilidad PENtoBOB: cliente da PEN, negocio da BOB
     *   → negocio aplica venta → ganancia = PEN_recibidos - (BOB_dados / venta)
     */
    private function calcularUtilidad(float $bobEntran, float $penSalen, float $bobSalen, float $penEntran, float $compra, float $venta): float
    {
        $utilBobPen = ($bobEntran / $compra) - $penSalen;
        $utilPenBob = $penEntran - ($bobSalen / $venta);
        return round($utilBobPen + $utilPenBob, 4);
    }

    private function consultarFilas(string $inicio, string $fin)
    {
        return Transfer::query()
            ->where('status', 'completed')
            ->whereBetween('created_at', [$inicio . ' 00:00:00', $fin . ' 23:59:59'])
            ->selectRaw("
                DATE(created_at) as fecha,
                SUM(CASE WHEN modo = 'BOBtoPEN' THEN amount           ELSE 0 END) as bob_entran,
                SUM(CASE WHEN modo = 'PENtoBOB' THEN converted_amount ELSE 0 END) as bob_salen,
                SUM(CASE WHEN modo = 'PENtoBOB' THEN amount           ELSE 0 END) as pen_entran,
                SUM(CASE WHEN modo = 'BOBtoPEN' THEN converted_amount ELSE 0 END) as pen_salen,
                COUNT(*) as total_ops
            ")
            ->groupByRaw('DATE(created_at)')
            ->orderBy('fecha')
            ->get();
    }

    public function datos(Request $request)
    {
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin'    => 'required|date|after_or_equal:fecha_inicio',
            'compra'       => 'required|numeric|min:0.0001',
            'venta'        => 'required|numeric|min:0.0001',
        ]);

        $compra = (float) $request->compra;
        $venta  = (float) $request->venta;
        $filas  = $this->consultarFilas($request->fecha_inicio, $request->fecha_fin);

        $detalle = $filas->map(function ($f) use ($compra, $venta) {
            $bobEntran = (float) $f->bob_entran;
            $bobSalen  = (float) $f->bob_salen;
            $penEntran = (float) $f->pen_entran;
            $penSalen  = (float) $f->pen_salen;

            return [
                'fecha'      => $f->fecha,
                'bob_entran' => round($bobEntran, 2),
                'bob_salen'  => round($bobSalen, 2),
                'pen_entran' => round($penEntran, 2),
                'pen_salen'  => round($penSalen, 2),
                'utilidad'   => $this->calcularUtilidad($bobEntran, $penSalen, $bobSalen, $penEntran, $compra, $venta),
                'total_ops'  => (int) $f->total_ops,
            ];
        });

        $totales = [
            'bob_entran' => round($detalle->sum('bob_entran'), 2),
            'bob_salen'  => round($detalle->sum('bob_salen'), 2),
            'pen_entran' => round($detalle->sum('pen_entran'), 2),
            'pen_salen'  => round($detalle->sum('pen_salen'), 2),
            'utilidad'   => round($detalle->sum('utilidad'), 2),
            'total_ops'  => $detalle->sum('total_ops'),
        ];

        return response()->json([
            'detalle' => $detalle,
            'totales' => $totales,
        ]);
    }

    public function exportarExcel(Request $request)
    {
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin'    => 'required|date|after_or_equal:fecha_inicio',
            'compra'       => 'required|numeric|min:0.0001',
            'venta'        => 'required|numeric|min:0.0001',
        ]);

        $inicio = $request->fecha_inicio;
        $fin    = $request->fecha_fin;
        $compra = (float) $request->compra;
        $venta  = (float) $request->venta;

        $filas   = $this->consultarFilas($inicio, $fin);
        $detalle = $filas->map(function ($f) use ($compra, $venta) {
            $bobEntran = (float) $f->bob_entran;
            $bobSalen  = (float) $f->bob_salen;
            $penEntran = (float) $f->pen_entran;
            $penSalen  = (float) $f->pen_salen;
            return [
                'fecha'      => $f->fecha,
                'bob_entran' => round($bobEntran, 2),
                'bob_salen'  => round($bobSalen, 2),
                'pen_entran' => round($penEntran, 2),
                'pen_salen'  => round($penSalen, 2),
                'utilidad'   => $this->calcularUtilidad($bobEntran, $penSalen, $bobSalen, $penEntran, $compra, $venta),
                'total_ops'  => (int) $f->total_ops,
            ];
        });

        $totales = [
            'bob_entran' => round($detalle->sum('bob_entran'), 2),
            'bob_salen'  => round($detalle->sum('bob_salen'), 2),
            'pen_entran' => round($detalle->sum('pen_entran'), 2),
            'pen_salen'  => round($detalle->sum('pen_salen'), 2),
            'utilidad'   => round($detalle->sum('utilidad'), 2),
            'total_ops'  => $detalle->sum('total_ops'),
        ];

        // ── Spreadsheet ───────────────────────────────────────────────────────
        $spreadsheet = new Spreadsheet();

        $colorHeader  = 'FF1E3A5F';
        $colorUtilRow = 'FFFFE599';
        $colorPos     = 'FF1A7C3E';
        $colorNeg     = 'FFB22222';

        // ── Hoja 1: Resumen ───────────────────────────────────────────────────
        $s1 = $spreadsheet->getActiveSheet();
        $s1->setTitle('Resumen');
        $s1->getColumnDimension('A')->setWidth(34);
        $s1->getColumnDimension('B')->setWidth(24);

        $s1->mergeCells('A1:B1');
        $s1->setCellValue('A1', 'REPORTE DE UTILIDAD — TransferCash');
        $s1->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorHeader]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $s1->getRowDimension(1)->setRowHeight(28);

        $meta = [
            ['Período',            $inicio . '  →  ' . $fin],
            ['Tasa de compra',     'BOB ' . number_format($compra, 4) . ' por S/ 1'],
            ['Tasa de venta',      'BOB ' . number_format($venta, 4)  . ' por S/ 1'],
            ['Solo operaciones',   'Completadas'],
        ];
        $row = 3;
        foreach ($meta as [$label, $val]) {
            $s1->setCellValue("A{$row}", $label);
            $s1->setCellValue("B{$row}", $val);
            $s1->getStyle("A{$row}")->getFont()->setBold(true);
            $row++;
        }

        $row++;
        foreach (['A' => 'Concepto', 'B' => 'Valor'] as $col => $hdr) {
            $s1->setCellValue("{$col}{$row}", $hdr);
        }
        $s1->getStyle("A{$row}:B{$row}")->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorHeader]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $row++;

        $resumen = [
            ['BOB que entraron (recibidos de clientes)', 'BOB ' . number_format($totales['bob_entran'], 2), $colorPos],
            ['BOB que salieron (enviados a clientes)',   'BOB ' . number_format($totales['bob_salen'],  2), $colorNeg],
            ['PEN que entraron (recibidos de clientes)', 'S/ '  . number_format($totales['pen_entran'], 2), $colorPos],
            ['PEN que salieron (enviados a clientes)',   'S/ '  . number_format($totales['pen_salen'],  2), $colorNeg],
            ['Total operaciones completadas',            $totales['total_ops'], 'FF444444'],
        ];

        foreach ($resumen as [$label, $val, $color]) {
            $s1->setCellValue("A{$row}", $label);
            $s1->setCellValue("B{$row}", $val);
            $s1->getStyle("B{$row}")->getFont()->setBold(true)->getColor()->setARGB($color);
            $s1->getStyle("A{$row}:B{$row}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
            $row++;
        }

        $uColor = $totales['utilidad'] >= 0 ? $colorPos : $colorNeg;
        $s1->setCellValue("A{$row}", 'UTILIDAD TOTAL (PEN)');
        $s1->setCellValue("B{$row}", 'S/ ' . number_format($totales['utilidad'], 2));
        $s1->getStyle("A{$row}:B{$row}")->applyFromArray([
            'font'      => ['bold' => true, 'size' => 13, 'color' => ['argb' => $uColor]],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorUtilRow]],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        // ── Hoja 2: Detalle ───────────────────────────────────────────────────
        $s2 = $spreadsheet->createSheet();
        $s2->setTitle('Detalle por día');

        foreach (['A' => 14, 'B' => 16, 'C' => 16, 'D' => 16, 'E' => 16, 'F' => 18, 'G' => 14] as $col => $w) {
            $s2->getColumnDimension($col)->setWidth($w);
        }

        $s2->mergeCells('A1:G1');
        $s2->setCellValue('A1', 'DETALLE POR DÍA  —  ' . $inicio . ' al ' . $fin);
        $s2->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 13, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorHeader]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $s2->getRowDimension(1)->setRowHeight(24);

        $cabeceras = ['Fecha', 'BOB Entran', 'BOB Salen', 'PEN Entran', 'PEN Salen', 'Utilidad (PEN)', 'Ops.'];
        foreach ($cabeceras as $i => $c) {
            $s2->setCellValue(chr(65 + $i) . '3', $c);
        }
        $s2->getStyle('A3:G3')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2E5090']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ]);

        $dr = 4;
        foreach ($detalle as $d) {
            $s2->setCellValue("A{$dr}", $d['fecha']);
            $s2->setCellValue("B{$dr}", $d['bob_entran']);
            $s2->setCellValue("C{$dr}", $d['bob_salen']);
            $s2->setCellValue("D{$dr}", $d['pen_entran']);
            $s2->setCellValue("E{$dr}", $d['pen_salen']);
            $s2->setCellValue("F{$dr}", $d['utilidad']);
            $s2->setCellValue("G{$dr}", $d['total_ops']);

            foreach (['B','C','D','E','F'] as $col) {
                $s2->getStyle("{$col}{$dr}")->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED2);
            }
            $uc = $d['utilidad'] >= 0 ? $colorPos : $colorNeg;
            $s2->getStyle("F{$dr}")->getFont()->setBold(true)->getColor()->setARGB($uc);

            $bg = $dr % 2 === 0 ? 'FFF2F6FF' : 'FFFFFFFF';
            $s2->getStyle("A{$dr}:G{$dr}")->applyFromArray([
                'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bg]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFCCCCCC']]],
            ]);
            $dr++;
        }

        $s2->setCellValue("A{$dr}", 'TOTALES');
        $s2->setCellValue("B{$dr}", $totales['bob_entran']);
        $s2->setCellValue("C{$dr}", $totales['bob_salen']);
        $s2->setCellValue("D{$dr}", $totales['pen_entran']);
        $s2->setCellValue("E{$dr}", $totales['pen_salen']);
        $s2->setCellValue("F{$dr}", $totales['utilidad']);
        $s2->setCellValue("G{$dr}", $totales['total_ops']);
        $s2->getStyle("A{$dr}:G{$dr}")->applyFromArray([
            'font'    => ['bold' => true, 'size' => 11],
            'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $colorUtilRow]],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM]],
        ]);
        foreach (['B','C','D','E','F'] as $col) {
            $s2->getStyle("{$col}{$dr}")->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED2);
        }

        // ── Respuesta ─────────────────────────────────────────────────────────
        $spreadsheet->setActiveSheetIndex(0);
        $filename = 'reporte_utilidad_' . $inicio . '_' . $fin . '.xlsx';

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Cache-Control: max-age=0');

        (new Xlsx($spreadsheet))->save('php://output');
        exit;
    }
}
