#!/bin/bash

# StreamScribe Production Deployment Script
# This script automates the production deployment process

set -e  # Exit on any error

echo "🚀 Starting StreamScribe Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_error ".env.local not found. Please create it with production values first."
    exit 1
fi

# Check if NODE_ENV is set to production
if [ "$NODE_ENV" != "production" ]; then
    print_warning "NODE_ENV is not set to 'production'. Setting it now..."
    export NODE_ENV=production
fi

print_status "Running pre-deployment checks..."

# Run linting
print_status "Running ESLint..."
npm run lint

# Run type checking
print_status "Running TypeScript type checking..."
npm run type-check

# Clean previous builds
print_status "Cleaning previous builds..."
npm run clean

# Install production dependencies
print_status "Installing production dependencies..."
npm ci --only=production

# Build the application
print_status "Building application for production..."
npm run build

# Run tests (if available)
if npm run test > /dev/null 2>&1; then
    print_status "Running tests..."
    npm run test
else
    print_warning "No tests configured. Skipping test execution."
fi

# Check build output
if [ ! -d ".next" ]; then
    print_error "Build failed - .next directory not found"
    exit 1
fi

print_success "Build completed successfully!"

# Database migration check
print_status "Checking database migrations..."
if npm run db:migrate > /dev/null 2>&1; then
    print_status "Running database migrations..."
    npm run db:migrate
else
    print_warning "No database migrations configured. Skipping."
fi

# Health check
print_status "Performing health check..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "Health check passed!"
else
    print_warning "Health check failed - server may not be running"
fi

# Deployment summary
echo ""
print_success "🎉 Deployment preparation completed!"
echo ""
echo "Next steps:"
echo "1. Update your domain DNS settings"
echo "2. Configure your hosting platform (Vercel, Netlify, etc.)"
echo "3. Set production environment variables"
echo "4. Deploy using your platform's deployment method"
echo ""
echo "For Vercel:"
echo "  vercel --prod"
echo ""
echo "For Netlify:"
echo "  netlify deploy --prod"
echo ""
echo "For manual deployment:"
echo "  npm start"
echo ""

# Optional: Start production server
read -p "Would you like to start the production server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting production server..."
    npm start
else
    print_status "Production server not started. Run 'npm start' when ready."
fi

print_success "Deployment script completed successfully!"
