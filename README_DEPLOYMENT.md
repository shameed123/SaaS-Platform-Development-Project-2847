# 🚀 SaaS Platform Deployment Guide

This guide provides step-by-step instructions for deploying the SaaS Platform with PostgreSQL backend.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **Git** (for cloning the repository)

## 🏗️ Project Structure

```
SaaS-Platform-Development-Project-2847/
├── src/                    # React frontend
├── server/                 # Node.js backend
│   ├── database/          # Database schema and connection
│   ├── scripts/           # Migration and seeding scripts
│   └── routes/            # API routes
└── README_DEPLOYMENT.md   # This file
```

## 🚀 Quick Start (Full Setup)

### 1. Clone and Setup Project

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd SaaS-Platform-Development-Project-2847

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Database Setup

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create database and user
CREATE DATABASE generic_saas;
CREATE USER saas_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE generic_saas TO saas_user;
\q
```

### 3. Environment Configuration

```bash
# Navigate to server directory
cd server

# Copy environment template
cp env.example .env

# Edit environment file with your credentials
nano .env
# OR
code .env
# OR
vim .env
```

**Required environment variables:**
```ini
# Server Configuration
PORT=3001
NODE_ENV=development

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=generic_saas
DB_USER=saas_user
DB_PASSWORD=your_secure_password

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:4100
```

### 4. Database Migration and Seeding

```bash
# Create all database tables
npm run db:migrate

# Populate with test data
npm run db:seed
```

### 5. Start Services
```bash
npm run dev:all
```
OR

```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend (from project root)
npm run dev
```

## 🔧 Detailed Commands Reference

### Database Management

```bash
# Navigate to server directory
cd server

# Run database migration
npm run db:migrate

# Seed database with test data
npm run db:seed

# Re-run migration (safe for existing databases)
npm run db:migrate

# Re-seed database (will add duplicate data)
npm run db:seed
```

### Development Commands

#### Frontend (Main Directory)
```bash
# Start React development server (port 4100)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

#### Backend (Server Directory)
```bash
cd server

# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Install dependencies
npm install
```

### Database Commands

```bash
# Connect to PostgreSQL
psql -U postgres
psql -U saas_user -d generic_saas

# View all tables
\dt

# View table structure
\d users
\d companies
\d subscriptions

# View sample data
SELECT * FROM users LIMIT 5;
SELECT * FROM companies LIMIT 5;

# Exit PostgreSQL
\q
```

### Testing Commands

```bash
# Test backend health endpoint
curl http://localhost:3001/api/health

# Test database connection
psql -U saas_user -d generic_saas -c "SELECT 1;"

# Check if services are running
netstat -tulpn | grep :3001  # Backend
netstat -tulpn | grep :4100  # Frontend
```

## 🧪 Test Credentials

After running `npm run db:seed`, you can login with these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `super@example.com` | `password123` |
| Admin | `admin@example.com` | `password123` |
| User | `user@example.com` | `password123` |
| Admin 2 | `admin2@example.com` | `password123` |
| User 2 | `user2@example.com` | `password123` |

## 🔍 Troubleshooting

### Common Issues

#### PostgreSQL Connection Issues
```bash
# Check if PostgreSQL is running
# Windows:
pg_ctl status

# Linux:
sudo systemctl status postgresql

# macOS:
brew services list | grep postgresql

# Start PostgreSQL if not running
# Windows:
pg_ctl start

# Linux:
sudo systemctl start postgresql

# macOS:
brew services start postgresql
```

#### Port Already in Use
```bash
# Check what's using the ports
netstat -tulpn | grep :3001
netstat -tulpn | grep :4100

# Kill process using port (replace PID with actual process ID)
kill -9 <PID>
```

#### Database Migration Errors
```bash
# Check database connection
psql -U saas_user -d generic_saas -c "SELECT version();"

# Verify environment variables
cd server
cat .env

# Re-run migration with verbose output
npm run db:migrate
```

#### Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf dist .vite
npm run dev
```

### Logs and Debugging

```bash
# Backend logs
cd server
npm run dev

# Frontend logs (in browser console)
# Open Developer Tools (F12) and check Console tab

# Database logs
# Check PostgreSQL logs in your system's log directory
```

## 🚀 Production Deployment

### Environment Setup
```bash
# Set production environment
export NODE_ENV=production

# Update .env for production
# - Use strong JWT_SECRET
# - Set proper FRONTEND_URL
# - Use production database credentials
```

### Build and Deploy
```bash
# Build frontend
npm run build

# Start backend in production mode
cd server
npm start
```

### Database Backup
```bash
# Create database backup
pg_dump -U saas_user -d generic_saas > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -U saas_user -d generic_saas < backup_file.sql
```

## 📊 Monitoring

### Health Checks
```bash
# Backend health
curl http://localhost:3001/api/health

# Database health
psql -U saas_user -d generic_saas -c "SELECT COUNT(*) FROM users;"
```

### Performance Monitoring
```bash
# Check database size
psql -U saas_user -d generic_saas -c "SELECT pg_size_pretty(pg_database_size('generic_saas'));"

# Check table sizes
psql -U saas_user -d generic_saas -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

## 🔐 Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong database passwords
- [ ] Enable SSL in production
- [ ] Set up proper CORS configuration
- [ ] Configure rate limiting
- [ ] Set up firewall rules
- [ ] Regular database backups
- [ ] Monitor for security updates

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure environment variables are correctly set
4. Check service logs for error messages
5. Verify database connectivity

## 🎯 Next Steps

After successful deployment:

1. **Customize the application** - Update branding, colors, and features
2. **Set up email services** - Configure SMTP for password reset emails
3. **Integrate payment processing** - Set up Stripe for subscriptions
4. **Add monitoring** - Set up application and database monitoring
5. **Plan scaling** - Consider load balancing and database clustering

---

**Happy Deploying! 🚀** 