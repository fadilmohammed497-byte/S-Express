const express = require('express');
const router = express.Router();

// Payment method from environment (default: 'mock')
const PAYMENT_METHOD = process.env.PAYMENT_METHOD || 'mock';

/**
 * POST /api/payments/process
 * Process payment without API keys
 * Supports: Mock Payments & Cash on Delivery
 */
router.post('/process', async (req, res) => {
  try {
    const {
      orderId,
      amount,
      paymentMethod,
      customerEmail,
      customerName
    } = req.body;

    // Validate required fields
    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, amount, paymentMethod'
      });
    }

    // Validate payment method
    const validMethods = ['mock', 'cod'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Supported: ${validMethods.join(', ')}`
      });
    }

    // Process based on payment method
    if (paymentMethod === 'mock') {
      return processMockPayment(req, res, orderId, amount, customerEmail, customerName);
    } else if (paymentMethod === 'cod') {
      return processCoD(req, res, orderId, amount, customerEmail, customerName);
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
});

/**
 * Mock Payment Processor
 * Simulates successful payment (90% success rate for testing)
 */
function processMockPayment(req, res, orderId, amount, customerEmail, customerName) {
  // Simulate 90% success rate for testing
  const isSuccess = Math.random() < 0.9;

  if (isSuccess) {
    // Simulate payment processing
    const transactionId = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const paymentData = {
      success: true,
      message: 'Payment processed successfully (Mock)',
      transactionId,
      orderId,
      amount,
      currency: 'USD',
      paymentMethod: 'mock',
      status: 'completed',
      timestamp: new Date().toISOString(),
      customerName,
      customerEmail
    };

    console.log('✓ Mock Payment Processed:', paymentData);

    // Emit real-time update if socket.io available
    if (req.io) {
      req.io.emit('payment-completed', {
        orderId,
        transactionId,
        status: 'completed'
      });
    }

    return res.status(200).json(paymentData);
  } else {
    // Simulate payment failure
    return res.status(402).json({
      success: false,
      message: 'Mock payment failed (simulated for testing)',
      orderId,
      amount,
      status: 'failed'
    });
  }
}

/**
 * Cash on Delivery (COD) Processor
 * No payment processing needed - payment collected at delivery
 */
function processCoD(req, res, orderId, amount, customerEmail, customerName) {
  const transactionId = `COD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const paymentData = {
    success: true,
    message: 'Order confirmed - Payment due on delivery',
    transactionId,
    orderId,
    amount,
    currency: 'USD',
    paymentMethod: 'cod',
    status: 'pending_delivery',
    paymentCollectedAt: 'delivery',
    timestamp: new Date().toISOString(),
    customerName,
    customerEmail
  };

  console.log('✓ COD Order Created:', paymentData);

  // Emit real-time update if socket.io available
  if (req.io) {
    req.io.emit('cod-order-created', {
      orderId,
      transactionId,
      status: 'pending_delivery'
    });
  }

  return res.status(200).json(paymentData);
}

/**
 * GET /api/payments/status/:transactionId
 * Check payment status
 */
router.get('/status/:transactionId', (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    // Mock status check - in production, query your database
    const statusData = {
      success: true,
      transactionId,
      status: 'completed',
      amount: 0,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(statusData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.message
    });
  }
});

/**
 * POST /api/payments/verify
 * Verify payment webhook (for testing)
 */
router.post('/verify', (req, res) => {
  try {
    const { transactionId, status } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    const verificationData = {
      success: true,
      message: 'Payment verified',
      transactionId,
      status: status || 'completed',
      verified: true,
      verifiedAt: new Date().toISOString()
    };

    console.log('✓ Payment Verified:', verificationData);
    res.status(200).json(verificationData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message
    });
  }
});

/**
 * GET /api/payments/methods
 * Get available payment methods
 */
router.get('/methods', (req, res) => {
  res.status(200).json({
    success: true,
    availableMethods: [
      {
        id: 'mock',
        name: 'Mock Payment',
        description: 'Simulates payment processing (for testing)',
        requiresApiKey: false
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Payment collected at delivery',
        requiresApiKey: false
      }
    ],
    currentMethod: PAYMENT_METHOD,
    message: 'All payment methods work without API keys!'
  });
});

module.exports = router;
