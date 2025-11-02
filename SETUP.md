# Setup Guide

This guide will help you set up the E-Commerce Platform on your local machine using Podman or local installation.

## Tech Stack

This platform uses:
- **Frontend**: React 18, Vite, Tailwind CSS 3.3, Stripe React SDK
- **Backend**: Node.js 18, Express.js 4.18, MongoDB 7.0, Redis 7
- **Authentication**: JWT (jsonwebtoken 9.0), bcryptjs 2.4
- **Payments**: Stripe 13.5, PayPal REST SDK 1.8
- **Containerization**: Podman 5.6+, podman-compose
- **Web Server**: Nginx (for production frontend)

## Quick Start with Podman

### Prerequisites

1. **Install Podman:**
   - Fedora/RHEL: `sudo dnf install podman`
   - macOS: `brew install podman`
   - Ubuntu/Debian: `sudo apt-get install podman`

2. **Install podman-compose:**
   ```bash
   pip3 install --user podman-compose
   ```

3. **Add to PATH:**
   Add `~/.local/bin` to your PATH in `~/.zshrc` or `~/.bashrc`:
   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   ```
   Then reload: `source ~/.zshrc` or `source ~/.bashrc`

### Setup Steps

1. **Clone/Navigate to the project directory:**
```bash
cd ecommerce-platform
```

2. **Set up environment variables:**

Create a `.env` file in the root directory (copy from backend/env.example):
```bash
cp backend/env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://mongodb:27017/ecommerce

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
PAYPAL_RETURN_URL=http://localhost:3000/checkout/success
PAYPAL_CANCEL_URL=http://localhost:3000/checkout/cancel
```

3. **Ensure podman-compose is in PATH:**
```bash
export PATH="$HOME/.local/bin:$PATH"
```

4. **Start all services:**
```bash
podman compose up --build
```

Or in detached mode:
```bash
podman compose up --build -d
```

5. **Seed the database (optional):**
```bash
podman compose exec backend npm run seed
```

6. **Access the application:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## Manual Setup (Without Containers)

### Prerequisites
- **Node.js 18+** and npm
- **MongoDB 7.0** (running on port 27017)
- **Redis 7** (running on port 6379)

### Install MongoDB and Redis

**MongoDB:**
```bash
# Fedora/RHEL
sudo dnf install mongodb-org

# macOS
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

**Redis:**
```bash
# Fedora/RHEL
sudo dnf install redis

# macOS
brew install redis

# Start Redis
sudo systemctl start redis  # Linux
brew services start redis  # macOS
```

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp env.example .env
# Edit .env with your configuration
# Update MONGODB_URI and REDIS_URL for local connections:
# MONGODB_URI=mongodb://localhost:27017/ecommerce
# REDIS_URL=redis://localhost:6379
```

4. **Start the server:**
```bash
npm run dev
```

5. **Seed the database (optional):**
```bash
npm run seed
```

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
Create a `.env` file in the frontend directory:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

**Note:** This key should match the `STRIPE_PUBLISHABLE_KEY` in your backend `.env` file.

4. **Start the development server:**
```bash
npm run dev
```

## Payment Setup

### Stripe Integration

1. **Create a Stripe account:**
   - Sign up at https://stripe.com
   - Access the [Dashboard](https://dashboard.stripe.com)

2. **Get your API keys:**
   - Go to Developers → API keys
   - Copy your **Publishable key** (starts with `pk_test_` for test mode)
   - Copy your **Secret key** (starts with `sk_test_` for test mode)

3. **Add to environment variables:**
   - **Backend `.env`**: 
     ```env
     STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
     STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
     ```
   - **Frontend `.env`** (if running locally):
     ```env
     VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
     ```

4. **Test cards:**
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date and any 3-digit CVC

### PayPal Integration

1. **Create a PayPal Developer account:**
   - Sign up at https://developer.paypal.com
   - Create a new application in the Dashboard

2. **Get your credentials:**
   - Go to My Apps & Credentials
   - Create a new app (for sandbox testing)
   - Copy your **Client ID** and **Secret**

3. **Add to backend `.env`:**
   ```env
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PAYPAL_MODE=sandbox  # Use 'live' for production
   PAYPAL_RETURN_URL=http://localhost:3000/checkout/success
   PAYPAL_CANCEL_URL=http://localhost:3000/checkout/cancel
   ```

4. **PayPal Sandbox:**
   - Use PayPal sandbox test accounts from your developer dashboard
   - Configure return/cancel URLs in PayPal app settings

## Testing the Application

### Create a Test User

1. Go to http://localhost:3000
2. Click "Register"
3. Create an account

### Test Products

If you seeded the database, you should see 8 sample products across different categories.

### Test Payments

**Stripe Test Card:**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**PayPal Sandbox:**
- Use the PayPal sandbox test accounts from your PayPal developer dashboard

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod` or through a service
- Check the connection string in `.env`

### Redis Connection Issues
- Ensure Redis is running: `redis-server` or through a service
- Check the Redis URL in `.env`

### Payment Issues
- Verify your API keys are correct
- For Stripe, ensure you're using test keys (starting with `sk_test_` and `pk_test_`)
- For PayPal, ensure you're in sandbox mode

### Podman Issues

**podman-compose not found:**
```bash
# Install podman-compose
pip3 install --user podman-compose

# Add to PATH (add to ~/.zshrc or ~/.bashrc)
export PATH="$HOME/.local/bin:$PATH"
source ~/.zshrc  # or source ~/.bashrc
```

**Compose provider error:**
- Ensure `podman-compose` is installed and in PATH
- Verify: `which podman-compose`
- Use full path: `~/.local/bin/podman-compose` if needed

**Port conflicts:**
- Check if ports 3000, 5000, 27017, and 6379 are available:
  ```bash
  sudo lsof -i :3000
  sudo lsof -i :5000
  sudo lsof -i :27017
  sudo lsof -i :6379
  ```
- Modify ports in `docker-compose.yml` if needed

**Rebuild containers:**
```bash
podman compose up --build
```

**Container networking issues:**
- Ensure Podman network is running: `podman network ls`
- Restart Podman service: `systemctl restart podman.socket` (if using systemd)

**Permission issues:**
- Run Podman in rootless mode (default)
- If needed: `sudo podman compose up --build`

## Next Steps

- Customize the product catalog
- Configure production environment variables
- Set up SSL certificates for production
- Configure email notifications
- Add more payment methods if needed

