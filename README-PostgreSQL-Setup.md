# PostgreSQL Setup Guide for SaaS Platform

## Current Status
Your project currently uses **mock APIs** with no real database. This guide will help you add PostgreSQL support.

## Prerequisites

### 1. Install PostgreSQL
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql`
- **Ubuntu**: `sudo apt-get install postgresql postgresql-contrib`

### 2. Install Node.js Backend Dependencies
```bash
cd server
npm install
```

## Database Setup

### 1. Create Database
```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create database
CREATE DATABASE generic_saas;

# Create user (optional)
CREATE USER saas_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE generic_saas TO saas_user;

# Exit psql
\q
```

### 2. Environment Configuration
```bash
# Copy environment template
cp server/env.example server/.env

# Edit .env file with your database credentials
nano server/.env
```

### 3. Run Database Migration
```bash
cd server
npm run db:migrate
```

### 4. Seed Initial Data (Optional)
```bash
npm run db:seed
```

## Backend Server Setup

### 1. Start the Backend Server
```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`

### 2. Test the Connection
Visit `http://localhost:3001/api/health` to verify the server is running.

## Frontend Configuration

### 1. Update API Configuration
Edit `src/services/api.js`:
```javascript
// Change this line:
const USE_MOCK_API = true;

// To:
const USE_MOCK_API = false;
```

### 2. Update API Base URL
Make sure the API base URL points to your backend:
```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

## Database Schema Overview

### Tables Created:
- **users** - User accounts and authentication
- **companies** - Organization/company data
- **subscriptions** - Stripe subscription management
- **invoices** - Billing and payment records
- **user_invitations** - User invitation system
- **audit_logs** - Activity tracking
- **settings** - Company-specific settings
- **global_settings** - Platform-wide settings

### Key Features:
- **UUID Primary Keys** - Secure, non-sequential IDs
- **Role-based Access** - user, admin, super_admin roles
- **Multi-tenant Support** - Company-based data isolation
- **Audit Logging** - Track all user actions
- **Stripe Integration** - Subscription and billing
- **Email Verification** - Account security

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/verify-email` - Email verification

### Users
- `GET /api/users` - Get users (role-based)
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Companies
- `GET /api/companies` - Get companies
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Subscriptions
- `GET /api/subscriptions` - Get subscription info
- `POST /api/subscriptions/create-checkout-session` - Create Stripe checkout
- `POST /api/subscriptions/cancel` - Cancel subscription

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/user-growth` - User growth data
- `GET /api/analytics/revenue` - Revenue statistics

## Development Workflow

### 1. Start Both Servers
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server
npm run dev
```

### 2. Database Changes
When you modify the schema:
```bash
# Update schema.sql
# Then run migration
npm run db:migrate
```

### 3. Testing
- Frontend: `http://localhost:4100`
- Backend API: `http://localhost:3001/api/health`

## Production Deployment

### Environment Variables
Set these in production:
- `NODE_ENV=production`
- `DB_HOST` - Production database host
- `DB_PASSWORD` - Strong database password
- `JWT_SECRET` - Strong JWT secret
- `STRIPE_SECRET_KEY` - Production Stripe key

### Security Considerations
- Use strong passwords
- Enable SSL for database connections
- Set up proper firewall rules
- Use environment variables for secrets
- Enable rate limiting
- Set up monitoring and logging

## Troubleshooting

### Common Issues:

1. **Connection Refused**
   - Check if PostgreSQL is running
   - Verify database credentials in `.env`

2. **Permission Denied**
   - Check database user permissions
   - Ensure database exists

3. **CORS Errors**
   - Verify `FRONTEND_URL` in backend `.env`
   - Check CORS configuration

4. **JWT Errors**
   - Ensure `JWT_SECRET` is set
   - Check token expiration

### Useful Commands:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Connect to database
psql -U postgres -d generic_saas

# View tables
\dt

# View table structure
\d users
```

## Next Steps

1. **Set up Stripe** - Configure payment processing
2. **Email Service** - Set up SMTP for notifications
3. **File Storage** - Add S3 or similar for file uploads
4. **Monitoring** - Add logging and monitoring
5. **Testing** - Write unit and integration tests
6. **CI/CD** - Set up automated deployment 