<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'payment_reference',
        'amount',
        'currency',
        'gateway',
        'gateway_transaction_id',
        'status',
        'gateway_response',
        'failure_reason',
        'processed_at',
        'failed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
        'processed_at' => 'datetime',
        'failed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        // توليد مرجع فريد تلقائياً عند إنشاء السجل
        static::creating(function ($payment) {
            $payment->payment_reference = 'PAY-' . strtoupper(Str::random(12));
            $payment->gateway = $payment->gateway ?? 'paylink'; // القيمة الافتراضية
        });
    }

    // --- العلاقات ---
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // --- Accessors (للعرض في الواجهات) ---
    public function getFormattedAmountAttribute()
    {
        return $this->currency . ' ' . number_format($this->amount, 2);
    }

    public function getStatusTextAttribute()
    {
        $statuses = [
            'pending'   => app()->getLocale() === 'ar' ? 'معلق' : 'Pending',
            'completed' => app()->getLocale() === 'ar' ? 'مكتمل' : 'Completed',
            'failed'    => app()->getLocale() === 'ar' ? 'فاشل' : 'Failed',
            'canceled'  => app()->getLocale() === 'ar' ? 'ملغي' : 'Canceled',
        ];
        return $statuses[$this->status] ?? $this->status;
    }

    // --- Methods (لتسهيل العمل في الكنترولر والـ Webhook) ---

    /**
     * تحديث الحالة إلى مكتمل وحفظ بيانات العملية
     */
    public function markAsCompleted($gatewayTransactionId = null, $gatewayResponse = null)
    {
        $this->update([
            'status' => 'completed',
            'gateway_transaction_id' => $gatewayTransactionId,
            'gateway_response' => $gatewayResponse,
            'processed_at' => now()
        ]);
    }

    /**
     * تحديث الحالة إلى فشل وحفظ السبب
     */
    public function markAsFailed($reason = null, $gatewayResponse = null)
    {
        $this->update([
            'status' => 'failed',
            'failure_reason' => $reason,
            'gateway_response' => $gatewayResponse,
            'failed_at' => now()
        ]);
    }

    // --- Scopes (للفلترة السهلة) ---
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year);
    }
}
