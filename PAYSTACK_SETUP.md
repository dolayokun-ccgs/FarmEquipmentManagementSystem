# Paystack Payment Integration Setup Guide

## Overview

This application uses Paystack as the payment gateway for processing equipment rental payments. Paystack is the leading payment platform for businesses in Africa, supporting multiple payment methods including cards, bank transfers, USSD, and mobile money.

## Getting Your Paystack API Keys

### Step 1: Create a Paystack Account

1. Go to [https://paystack.com](https://paystack.com)
2. Click "Sign Up" and create your account
3. Verify your email address
4. Complete your business profile

### Step 2: Get Your API Keys

1. Log in to your Paystack Dashboard
2. Click on "Settings" in the left sidebar
3. Click on "API Keys & Webhooks"
4. You'll see two sets of keys:
   - **Test Keys** (for development)
   - **Live Keys** (for production)

### Step 3: Configure Your Application

#### Backend Configuration

Update `backend/.env` file:

```env
# Paystack Test Keys (for development)
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_CALLBACK_URL=http://localhost:5000/api/payments/callback

# For Production, use Live Keys:
# PAYSTACK_SECRET_KEY=sk_live_your_secret_key_here
# PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
# PAYSTACK_CALLBACK_URL=https://yourdomain.com/api/payments/callback
```

#### Frontend Configuration

The frontend automatically uses the backend API endpoints. No additional configuration needed.

## Testing Payments

### Test Cards

Paystack provides test cards for development:

#### Successful Payment
- **Card Number:** 4084084084084081
- **CVV:** 408
- **Expiry:** 01/99
- **PIN:** 0000
- **OTP:** 123456

#### Failed Payment
- **Card Number:** 5060666666666666666
- **CVV:** 123
- **Expiry:** 01/99

#### Insufficient Funds
- **Card Number:** 5060666666666666666
- **CVV:** 123
- **Expiry:** 01/99

### Testing Workflow

1. **Create a Booking:**
   - Log in as a farmer
   - Browse equipment
   - Create a booking for desired dates
   - Booking will be created with status "PENDING" and payment status "PENDING"

2. **Make Payment:**
   - Go to "My Bookings" in your dashboard
   - Click the "Pay with Paystack" button
   - You'll be redirected to Paystack's payment page
   - Enter the test card details above
   - Complete the payment

3. **Payment Verification:**
   - After successful payment, you'll be redirected back to the application
   - The payment will be automatically verified
   - Booking status will change to "CONFIRMED"
   - Payment status will change to "PAID"

## Payment Flow

```
1. Farmer creates booking
   ↓
2. Booking created with PENDING status
   ↓
3. Farmer clicks "Pay with Paystack"
   ↓
4. Backend initializes payment with Paystack
   ↓
5. Farmer redirected to Paystack payment page
   ↓
6. Farmer enters payment details
   ↓
7. Payment processed by Paystack
   ↓
8. Farmer redirected back to app
   ↓
9. Backend verifies payment with Paystack
   ↓
10. Booking status updated to CONFIRMED
    Payment status updated to PAID
```

## API Endpoints

### Initialize Payment
```http
POST /api/payments/initialize
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookingId": "booking-uuid",
  "email": "user@example.com"
}
```

### Verify Payment
```http
GET /api/payments/verify/:reference
```

### Get Payment Status
```http
GET /api/payments/status/:reference
Authorization: Bearer {token}
```

### Webhook (Paystack → Your App)
```http
POST /api/payments/webhook
X-Paystack-Signature: {signature}

{
  "event": "charge.success",
  "data": { ... }
}
```

## Webhook Setup (Optional but Recommended)

Webhooks allow Paystack to notify your application about payment events in real-time.

### Configure Webhook URL

1. Go to Paystack Dashboard → Settings → API Keys & Webhooks
2. Scroll to "Webhook URL" section
3. Enter your webhook URL: `https://yourdomain.com/api/payments/webhook`
4. Save the changes

### Webhook Events

The application handles these events:
- `charge.success` - Payment successful
- `charge.failed` - Payment failed

## Going Live

### Requirements

1. **Complete Business Verification:**
   - Submit business documents
   - Verify your bank account
   - Complete KYC (Know Your Customer)

2. **Switch to Live Keys:**
   - Replace test keys with live keys in `.env`
   - Update callback URLs to production URLs
   - Configure webhook URL

3. **Test in Production:**
   - Make a small test transaction
   - Verify payment flow works correctly
   - Check email notifications

### Live Checklist

- [ ] Business account verified
- [ ] Bank account connected
- [ ] Live API keys configured
- [ ] Webhook URL configured
- [ ] SSL certificate installed (HTTPS)
- [ ] Test transaction completed
- [ ] Email notifications working

## Security Best Practices

1. **Never expose secret keys:**
   - Keep `PAYSTACK_SECRET_KEY` in environment variables
   - Never commit secret keys to Git
   - Use different keys for development and production

2. **Verify webhook signatures:**
   - Always verify the `X-Paystack-Signature` header
   - Prevents unauthorized webhook calls

3. **Validate payments server-side:**
   - Never trust client-side payment confirmations
   - Always verify with Paystack API before updating booking status

4. **Use HTTPS in production:**
   - Paystack requires HTTPS for production webhooks
   - Protects sensitive payment data

## Troubleshooting

### Payment Not Initializing

**Problem:** "Failed to initialize payment" error

**Solutions:**
- Check that `PAYSTACK_SECRET_KEY` is set correctly
- Verify booking exists and payment is pending
- Check backend logs for detailed error messages

### Payment Verification Failing

**Problem:** Payment completed but booking not confirmed

**Solutions:**
- Check that reference parameter is passed in callback URL
- Verify Paystack can reach your webhook URL
- Check backend logs for verification errors

### Webhook Not Receiving Events

**Problem:** Webhooks not working

**Solutions:**
- Ensure webhook URL is publicly accessible (not localhost)
- Use ngrok for local development testing
- Verify webhook URL in Paystack dashboard
- Check webhook signature validation

## Support

- **Paystack Documentation:** [https://paystack.com/docs](https://paystack.com/docs)
- **Paystack Support:** support@paystack.com
- **Community:** [https://paystack.com/community](https://paystack.com/community)

## Test Credentials Summary

For quick reference:

```
Test Card (Success): 4084084084084081
CVV: 408
Expiry: 01/99
PIN: 0000
OTP: 123456

Amount: Any amount in Kobo (multiply Naira by 100)
Example: NGN 25,000 = 2,500,000 kobo
```

## Next Steps

1. Get your Paystack API keys
2. Update the `.env` file with your keys
3. Restart the backend server
4. Test the payment flow with test cards
5. Verify booking status updates correctly
6. Prepare for live deployment

---

**Note:** Always test thoroughly with test keys before going live with real payments!
