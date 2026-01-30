<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إتمام الدفع - HyperPay</title>

    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .payment-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 100%; max-width: 500px; text-align: center; }
        .payment-card h2 { color: #333; margin-bottom: 1rem; }
        .payment-card p { color: #666; margin-bottom: 2rem; }
        /* ستايل لتهيئة مكان الـ Widget قبل التحميل */
        .wpwl-form { margin: 0 auto !important; }
    </style>
</head>
<body>

    <div class="payment-card">
        <h2>إتمام عملية الدفع</h2>
        <p>المبلغ المطلوب: <strong>{{ $amount }} {{ $currency }}</strong></p>

        <script src="{{ $payment_url }}"></script>

        <form action="{{ route('payment.result', ['payment_id' => $payment_id]) }}"
              class="paymentWidgets"
              data-brands="VISA MASTER MADA AMEX">
        </form>
    </div>

</body>
</html>
