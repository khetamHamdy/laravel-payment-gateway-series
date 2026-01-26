<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');

            // المرجع الفريد الذي سنرسله لـ Paylink
            $table->string('payment_reference')->unique();

            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('SAR');

            // نوع البوابة (مثلاً: paylink)
            $table->string('gateway');

            // المعرف الذي سنحصل عليه من Paylink بعد إنشاء الفاتورة أو نجاحها
            $table->string('gateway_transaction_id')->nullable();

            // الحالات الأساسية فقط
            $table->enum('status', ['pending', 'completed', 'failed', 'canceled'])->default('pending');

            // لتخزين كل ما يصلنا من Paylink
            $table->json('gateway_response')->nullable();

            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
