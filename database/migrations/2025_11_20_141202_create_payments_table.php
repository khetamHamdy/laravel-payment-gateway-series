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
            $table->id(); // المعرف الفريد
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // معرف المستخدم
            $table->foreignId('subscription_id')->nullable()->constrained('user_subscriptions')->nullOnDelete(); // معرف الاشتراك
            $table->string('payment_reference', 100)->unique(); // مرجع الدفعة الفريد
            $table->decimal('amount', 10, 2); // مبلغ الدفعة
            $table->string('currency', 3); // العملة
            $table->decimal('tax_amount', 10, 2)->default(0); // مبلغ الضريبة
            $table->decimal('fee_amount', 10, 2)->default(0); // رسوم الدفع
            $table->decimal('net_amount', 10, 2); // المبلغ الصافي
            $table->enum('payment_method', ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'mobile_payment']); // طريقة الدفع
            $table->string('gateway', 50); // بوابة الدفع
            $table->string('gateway_transaction_id', 100)->nullable(); // معرف المعاملة في البوابة
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'canceled', 'refunded'])->default('pending'); // حالة الدفعة
            $table->json('gateway_response')->nullable(); // رد البوابة
            $table->text('failure_reason')->nullable(); // سبب الفشل
            $table->timestamp('processed_at')->nullable(); // تاريخ المعالجة
            $table->timestamp('failed_at')->nullable(); // تاريخ الفشل
            $table->timestamp('refunded_at')->nullable(); // تاريخ الاسترداد
            $table->decimal('refunded_amount', 10, 2)->default(0); // مبلغ الاسترداد
            $table->timestamps(); // تواريخ الإنشاء والتحديث
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
