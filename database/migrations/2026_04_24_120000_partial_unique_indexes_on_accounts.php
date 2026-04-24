<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE accounts DROP INDEX uq_qr_active');
        DB::statement('ALTER TABLE accounts DROP INDEX uq_bank_active');

        DB::statement("
            ALTER TABLE accounts
            ADD COLUMN qr_active_flag TINYINT(1)
                GENERATED ALWAYS AS (
                    CASE WHEN method_type = 'qr' AND desactivate = 0 THEN 1 ELSE NULL END
                ) VIRTUAL
        ");

        DB::statement("
            ALTER TABLE accounts
            ADD COLUMN bank_active_flag TINYINT(1)
                GENERATED ALWAYS AS (
                    CASE WHEN method_type = 'bank' AND desactivate = 0 THEN 1 ELSE NULL END
                ) VIRTUAL
        ");

        DB::statement('
            ALTER TABLE accounts
            ADD UNIQUE KEY uq_qr_active (user_id, qr_country, qr_active_flag)
        ');

        DB::statement('
            ALTER TABLE accounts
            ADD UNIQUE KEY uq_bank_active (user_id, account_number, account_type, bank_active_flag)
        ');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE accounts DROP INDEX uq_qr_active');
        DB::statement('ALTER TABLE accounts DROP INDEX uq_bank_active');
        DB::statement('ALTER TABLE accounts DROP COLUMN qr_active_flag');
        DB::statement('ALTER TABLE accounts DROP COLUMN bank_active_flag');

        DB::statement('ALTER TABLE accounts ADD UNIQUE KEY uq_qr_active (user_id, qr_country, desactivate)');
        DB::statement('ALTER TABLE accounts ADD UNIQUE KEY uq_bank_active (user_id, account_number, account_type, desactivate)');
    }
};
