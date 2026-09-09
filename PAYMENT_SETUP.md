# S-Express Payment Configuration (No API Keys Required)

This app now supports **two payment methods without any API keys**:

## 🎯 Payment Methods

### 1. Mock Payment (Default)
- **What it does**: Simulates payment processing for testing
- **Use case**: Development, testing, demos
- **Success rate**: 90% (10% fails randomly for testing error handling)
- **Configuration**: `PAYMENT_METHOD=mock`

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order123",
    "amount": 29.99,
    "paymentMethod": "mock",
    "customerEmail": "user@example.com",
    "customerName": "John Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully (Mock)",
  "transactionId": "MOCK-1694123456789-abc123def45",
  "orderId": "order123",
  "amount": 29.99,
  "status": "completed",
  "timestamp": "2026-09-09T18:45:00.000Z"
}
```

---

### 2. Cash on Delivery (COD)
- **What it does**: Accepts orders with payment due at delivery
- **Use case**: Real orders, production
- **Success rate**: 100% (always succeeds)
- **Configuration**: `PAYMENT_METHOD=cod`

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order456",
    "amount": 45.50,
    "paymentMethod": "cod",
    "customerEmail": "customer@example.com",
    "customerName": "Jane Smith"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Order confirmed - Payment due on delivery",
  "transactionId": "COD-1694123456789-xyz789abc12",
  "orderId": "order456",
  "amount": 45.50,
  "status": "pending_delivery",
  "paymentCollectedAt": "delivery",
  "timestamp": "2026-09-09T18:45:00.000Z"
}
```

---

## 🚀 Setup Instructions

### Step 1: Update `.env` file
```env
PAYMENT_METHOD=mock
# Or use: PAYMENT_METHOD=cod
```

### Step 2: No Additional Setup Needed!
- ❌ No Stripe API keys
- ❌ No payment provider account
- ❌ No API configuration
- ✅ Just set `PAYMENT_METHOD` and go!

### Step 3: Start the server
```bash
npm install
npm start
# Or for development: npm run dev
```

---

## 📡 Available Endpoints

### Process Payment
- **POST** `/api/payments/process`
- Handles both mock and COD payments

### Check Payment Status
- **GET** `/api/payments/status/:transactionId`
- Returns payment status

### Verify Payment
- **POST** `/api/payments/verify`
- Verify completed payments

### Get Available Methods
- **GET** `/api/payments/methods`
- Returns all available payment methods

### Server Health
- **GET** `/api/health`
- Shows payment method and configuration

### Payment Info
- **GET** `/api/payment-info`
- Get payment configuration details

---

## 🔄 Real-time Updates (Socket.io)

The app emits real-time payment updates:

```javascript
// Mock payment completed
io.emit('payment-completed', {
  orderId: 'order123',
  transactionId: 'MOCK-...',
  status: 'completed'
});

// COD order created
io.emit('cod-order-created', {
  orderId: 'order456',
  transactionId: 'COD-...',
  status: 'pending_delivery'
});
```

---

## ✨ Features

✅ **No API Keys** - Works out of the box
✅ **Two Payment Methods** - Mock & COD
✅ **Real-time Updates** - Socket.io integration
✅ **Error Handling** - Built-in payment failure simulation
✅ **Production Ready** - Can be extended with real payment providers

---

## 🔮 Future: Adding Real Payment Providers

To upgrade to real payments (Stripe, PayPal, etc.), simply:
1. Add provider API keys to `.env`
2. Create a new route handler in `routes/payments.js`
3. Update payment method in `server.js`

No breaking changes to existing code!

---

## 🎓 Testing

### Test Mock Payment Success
```bash
curl -X POST http://localhost:5000/api/payments/process \
  -H "Content-Type: application/json" \
  -d '{"orderId":"test1","amount":25.00,"paymentMethod":"mock","customerEmail":"test@test.com","customerName":"Test User"}'
```

### Test COD Payment
```bash
curl -X POST http://localhost:5000/api/payments/process \
  -H "Content-Type: application/json" \
  -d '{"orderId":"test2","amount":35.00,"paymentMethod":"cod","customerEmail":"test@test.com","customerName":"Test User"}'
```

### Check Available Methods
```bash
curl http://localhost:5000/api/payments/methods
```

### Check Server Health
```bash
curl http://localhost:5000/api/health
```

---

**Questions?** Check the `/api/health` endpoint or review the `routes/payments.js` file.
