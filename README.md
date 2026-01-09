# 🚀 Laravel Payment Gateway Series

Welcome to the **Laravel Payment Gateway Series**, a professional and educational journey into integrating **multiple payment gateways** using **REST APIs** in Laravel. This repository provides **clean, reusable, and scalable code** that can be adapted to **any payment gateway**, making it perfect for **real-world projects** and **hands-on learning**. Many developers feel intimidated by payment integrations, but fear comes from lack of experience 💡. This series emphasizes **learning by doing**, showing that with practice and small steps, anyone can confidently handle payments in Laravel projects.

The architecture is **gateway-agnostic**, meaning you can implement any payment provider such as **Stripe, Paylink, Telr, or others** without changing the core logic. The `PaymentGatewayManager` class acts as a **central hub** that dynamically resolves the active gateway, delegates **checkout creation**, and handles **webhook requests**. Each gateway implementation lives in the `Gateways` folder, while the `Contracts` folder contains the interface defining the contract for all gateways. This ensures a **clean, maintainable, and extensible structure** suitable for multiple projects and long-term use.

To use this repository, clone it locally using:

```bash
git clone https://github.com/khetamHamdy/laravel-payment-gateway-series.git
