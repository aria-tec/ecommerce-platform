# E-Commerce Platform

A full-stack e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js) integrated with Stripe, PayPal, Redis, and containerized with Podman.

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Product Management**: Browse, search, and filter products by category
- **Shopping Cart**: Add, remove, and update items in the cart
- **Payment Processing**: Integrated Stripe and PayPal payment gateways
- **Order Management**: Complete order history and tracking
- **Caching**: Redis integration for improved performance
- **Responsive UI**: Modern, responsive design with Tailwind CSS
- **Containerization**: Podman support for easy deployment and development

## Tech Stack

### Frontend
- **React 18** - Modern UI library for building user interfaces
- **Vite** - Fast build tool and development server
- **Tailwind CSS 3.3** - Utility-first CSS framework for rapid UI development
- **@stripe/stripe-js** & **@stripe/react-stripe-js** - Stripe React SDK for payment processing
- **Axios** - HTTP client for API requests

### Backend
- **Node.js 18** - JavaScript runtime environment
- **Express.js 4.18** - Web application framework
- **MongoDB 7.0** with **Mongoose 7.5** - NoSQL database and ODM
- **Redis 7** - In-memory data store for caching
- **jsonwebtoken 9.0** - JSON Web Token implementation for authentication
- **Stripe 13.5** - Payment processing API for credit card transactions
- **PayPal REST SDK 1.8** - PayPal payment integration
- **bcryptjs 2.4** - Password hashing library
- **express-validator 7.0** - Input validation middleware
- **dotenv** - Environment variable management

### Infrastructure
- **Podman 5.6+** - Container runtime (Docker alternative)
- **podman-compose** - Multi-container orchestration
- **MongoDB 7.0** - Document database
- **Redis 7 Alpine** - Caching layer
- **Nginx Alpine** - Web server for frontend

## Project Structure

```
ecommerce-platform/
├── backend/
│   ├── config/
│   │   └── redis.js          # Redis configuration
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── models/
│   │   ├── User.js           # User model
│   │   ├── Product.js        # Product model
│   │   └── Order.js          # Order model
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── products.js       # Product routes
│   │   ├── orders.js         # Order routes
│   │   └── payments.js       # Payment routes
│   ├── server.js             # Express server
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── context/          # React context providers
│   │   ├── pages/            # Page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js 18+** and npm (for local development)
- **Podman 5.6+** and **podman-compose** (for containerized deployment)
- MongoDB 7.0 (if not using containers)
- Redis 7 (if not using containers)
- **Stripe account** - Get API keys from [Stripe Dashboard](https://dashboard.stripe.com)
- **PayPal Developer account** - Get credentials from [PayPal Developer](https://developer.paypal.com)

### Installation

#### Option 1: Using Podman (Recommended)

**Prerequisites:**
- Install Podman: `sudo dnf install podman` (Fedora/RHEL) or `brew install podman` (macOS)
- Install podman-compose: `pip3 install --user podman-compose` or `pip install podman-compose`
- Ensure `~/.local/bin` is in your PATH (add to `~/.zshrc` or `~/.bashrc`)

1. **Clone/Navigate to the project:**
```bash
cd ecommerce-platform
```

2. **Set up environment variables:**
```bash
# Create .env file in the root directory
cp backend/env.example .env
# Edit .env with your configuration (JWT_SECRET, Stripe keys, PayPal credentials)
```

3. **Start all services with Podman Compose:**
```bash
export PATH="$HOME/.local/bin:$PATH"  # If not already in your shell profile
podman compose up --build
```

Or use detached mode:
```bash
podman compose up --build -d
```

This will start:
- **MongoDB** on port `27017`
- **Redis** on port `6379`
- **Backend API** on port `5000`
- **Frontend** on port `3000`

4. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017
- Redis: localhost:6379

5. **Seed the database (optional):**
```bash
podman compose exec backend npm run seed
```

#### Option 2: Local Development

1. **Backend Setup:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

2. **Frontend Setup:**
```bash
cd frontend
npm install
# Create .env file with VITE_STRIPE_PUBLISHABLE_KEY
npm run dev
```

3. **Start MongoDB and Redis:**
- MongoDB: Ensure MongoDB is running on port 27017
- Redis: Ensure Redis is running on port 6379

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
PAYPAL_RETURN_URL=http://localhost:3000/checkout/success
PAYPAL_CANCEL_URL=http://localhost:3000/checkout/cancel
```

### Frontend (.env)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Products
- `GET /api/products` - Get all products (with optional search/category query)
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get products by category

### Orders
- `POST /api/orders` - Create a new order (Protected)
- `GET /api/orders/:userId` - Get user's order history (Protected)
- `GET /api/orders/order/:orderId` - Get single order (Protected)

### Payments
- `POST /api/payments/charge` - Process payment (Protected)
- `POST /api/payments/create-paypal-payment` - Create PayPal payment (Protected)

## Features Implementation

### Authentication
- **JWT (JSON Web Tokens)** with **jsonwebtoken** for stateless authentication
- Password hashing with **bcryptjs** (salt rounds: 10)
- Protected routes with authentication middleware
- Token expiration: 7 days (configurable)

### Product Caching
- Redis caching for frequently accessed products
- Cache invalidation on updates
- Category-based caching

### Payment Processing
- **Stripe** integration for credit card payments using Stripe.js
- **PayPal** REST SDK integration for PayPal checkout
- Secure tokenization on frontend with Stripe React SDK
- Server-side payment verification and processing
- Support for both sandbox and production environments

### Shopping Cart
- Local storage persistence
- Real-time cart updates
- Quantity management

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

### Building for Production

Backend:
```bash
cd backend
npm run build
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm run preview
```

## Podman Commands

```bash
# Start all services
podman compose up

# Start in detached mode
podman compose up -d

# Stop all services
podman compose down

# View logs
podman compose logs -f

# View logs for specific service
podman compose logs -f backend
podman compose logs -f frontend

# Rebuild containers
podman compose up --build

# Stop and remove volumes
podman compose down -v

# Execute commands in containers
podman compose exec backend npm run seed
podman compose exec backend sh

# List running containers
podman compose ps

# Restart services
podman compose restart
```

## Testing

### Stripe Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### PayPal Sandbox
- Use PayPal sandbox accounts for testing
- Configure return/cancel URLs in PayPal dashboard

## Security Considerations

- **Password Security**: All passwords are hashed using bcryptjs with salt rounds of 10
- **JWT Authentication**: Tokens expire after 7 days, no hardcoded secrets (environment variable required)
- **Payment Security**: Payment data is never stored on the server, processed securely via Stripe/PayPal APIs
- **Environment Variables**: All sensitive data (JWT secrets, API keys) stored in environment variables
- **Input Validation**: All endpoints use express-validator for input sanitization and validation
- **CORS Configuration**: Configured to allow only specified frontend origin
- **Error Handling**: Production error messages don't expose sensitive information or stack traces
- **MongoDB Injection Protection**: Using Mongoose ODM which provides protection against NoSQL injection
- **Request Size Limits**: JSON and URL-encoded payloads limited to 10MB
- **Payment Amount Validation**: Payment amounts are validated (minimum 0, maximum 100000)
- **Authorization Checks**: Users can only access their own orders and data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Security Notes for Production

⚠️ **Before deploying to production:**

1. **Change all default secrets** - Generate strong, random JWT_SECRET
2. **Use production Stripe keys** - Switch from test keys (`sk_test_`, `pk_test_`) to live keys
3. **Configure PayPal for production** - Set `PAYPAL_MODE=live` and use production credentials
4. **Set proper CORS origins** - Configure `FRONTEND_URL` environment variable
5. **Use HTTPS** - Never use HTTP in production for payment processing
6. **Review MongoDB connection** - Ensure MongoDB is properly secured and not exposed publicly
7. **Set NODE_ENV=production** - Enables production optimizations and stricter error handling
8. **Regular security updates** - Keep all dependencies up to date

## Support

For support, email ariawork000@gmail.com or open an issue in the repository.

