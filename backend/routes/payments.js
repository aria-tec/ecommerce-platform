const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('paypal-rest-sdk');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Configure PayPal
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
  client_id: process.env.PAYPAL_CLIENT_ID || '',
  client_secret: process.env.PAYPAL_CLIENT_SECRET || ''
});

// @route   POST /api/payments/charge
// @desc    Process payment (Stripe or PayPal)
// @access  Private
router.post('/charge', authenticate, async (req, res) => {
  try {
    const { paymentMethod, amount, currency, items, shippingAddress } = req.body;

    if (!paymentMethod || !amount || !items) {
      return res.status(400).json({ message: 'Missing required payment information' });
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0 || amount > 100000) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items must be a non-empty array' });
    }

    let paymentResult;

    // Process Stripe payment
    if (paymentMethod === 'stripe') {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: 'Stripe token is required' });
      }

      try {
        const charge = await stripe.charges.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency || 'usd',
          source: token,
          description: `Order payment for user ${req.user._id}`,
          metadata: {
            userId: req.user._id.toString(),
            items: JSON.stringify(items)
          }
        });

        paymentResult = {
          success: true,
          paymentId: charge.id,
          method: 'stripe',
          amount: charge.amount / 100,
          status: charge.status
        };
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        return res.status(400).json({ 
          message: 'Payment processing failed',
          error: stripeError.message 
        });
      }
    }
    // Process PayPal payment
    else if (paymentMethod === 'paypal') {
      const { paymentId, payerId } = req.body;

      if (!paymentId || !payerId) {
        return res.status(400).json({ message: 'PayPal payment ID and payer ID are required' });
      }

      const execute_payment_json = {
        payer_id: payerId,
        transactions: [{
          amount: {
            currency: currency || 'USD',
            total: amount.toFixed(2)
          }
        }]
      };

      return new Promise((resolve, reject) => {
        paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
          if (error) {
            console.error('PayPal error:', error);
            return res.status(400).json({ 
              message: 'Payment processing failed',
              error: error.response ? error.response.message : error.message 
            });
          }

          paymentResult = {
            success: true,
            paymentId: payment.id,
            method: 'paypal',
            amount: parseFloat(payment.transactions[0].amount.total),
            status: payment.state
          };

          res.json({
            message: 'Payment processed successfully',
            payment: paymentResult
          });
        });
      });
    }
    else {
      return res.status(400).json({ message: 'Invalid payment method. Use "stripe" or "paypal"' });
    }

    // Return result for Stripe
    if (paymentMethod === 'stripe') {
      res.json({
        message: 'Payment processed successfully',
        payment: paymentResult
      });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Server error processing payment' });
  }
});

// @route   POST /api/payments/create-paypal-payment
// @desc    Create PayPal payment intent
// @access  Private
router.post('/create-paypal-payment', authenticate, async (req, res) => {
  try {
    const { amount, currency, items } = req.body;

    if (!amount || !items) {
      return res.status(400).json({ message: 'Amount and items are required' });
    }

    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: process.env.PAYPAL_RETURN_URL || 'http://localhost:3000/checkout/success',
        cancel_url: process.env.PAYPAL_CANCEL_URL || 'http://localhost:3000/checkout/cancel'
      },
      transactions: [{
        item_list: {
          items: items.map(item => ({
            name: item.name,
            sku: item.id,
            price: item.price.toFixed(2),
            currency: currency || 'USD',
            quantity: item.quantity
          }))
        },
        amount: {
          currency: currency || 'USD',
          total: amount.toFixed(2)
        },
        description: 'E-commerce purchase'
      }]
    };

    paypal.payment.create(create_payment_json, (error, payment) => {
      if (error) {
        console.error('PayPal payment creation error:', error);
        return res.status(400).json({ 
          message: 'Failed to create PayPal payment',
          error: error.response ? error.response.message : error.message 
        });
      }

      // Find approval URL
      const approvalUrl = payment.links.find(link => link.rel === 'approval_url');

      res.json({
        paymentId: payment.id,
        approvalUrl: approvalUrl ? approvalUrl.href : null,
        payment
      });
    });
  } catch (error) {
    console.error('Create PayPal payment error:', error);
    res.status(500).json({ message: 'Server error creating PayPal payment' });
  }
});

module.exports = router;

