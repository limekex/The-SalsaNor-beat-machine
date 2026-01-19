# Backend Quick Start Guide

This is a streamlined guide to get you started with adding backend functionality to the SalsaNor Beat Machine. For more detailed information, see the complete [Implementation Guide](./IMPLEMENTATION_GUIDE.md).

## Prerequisites

✅ Node.js 18 or higher  
✅ PostgreSQL 14 or higher (or a managed service like Supabase)  
✅ Basic understanding of Next.js and TypeScript  

## Quick Setup (5 Minutes)

### 1. Install Dependencies

```bash
npm install @prisma/client bcrypt jsonwebtoken zod
npm install --save-dev prisma @types/bcrypt @types/jsonwebtoken
```

### 2. Initialize Database

```bash
# Initialize Prisma
npx prisma init

# This creates:
# - prisma/schema.prisma (database schema)
# - .env (environment variables)
```

### 3. Configure Environment

Copy `.env.example` from the project root to `.env.local` and update:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/salsabeatmachine"
JWT_SECRET="your-super-secret-key-here"
```

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

### 4. Set Up Database Schema

Copy the minimal schema from `docs/DATABASE_SCHEMA.md` into `prisma/schema.prisma`, then run:

```bash
# Create database tables
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 5. Create Your First API Endpoint

Create `pages/api/health.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({ 
    success: true, 
    message: 'Backend API is running!',
    timestamp: new Date().toISOString()
  });
}
```

Test it: http://localhost:3009/api/health

> **Note:** This app uses port 3009 (configured in package.json), not the default Next.js port 3000.

### 6. Add Authentication

Create the files from the Implementation Guide:
- `lib/prisma.ts` - Database client
- `lib/auth.ts` - Auth utilities
- `pages/api/auth/register.ts` - Registration endpoint
- `pages/api/auth/login.ts` - Login endpoint

### 7. Test Authentication

```bash
# Register a new user
curl -X POST http://localhost:3009/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User",
    "acceptTerms": true
  }'

# Login
curl -X POST http://localhost:3009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## What's Next?

### Week 1-2: Core Backend
- ✅ Authentication (register, login, logout)
- ✅ User profiles
- ✅ Pattern CRUD operations

### Week 3-4: Features
- 🔲 Pattern sharing (public URLs)
- 🔲 Like/favorite system
- 🔲 User preferences

### Week 5-6: Social
- 🔲 Comments
- 🔲 User following
- 🔲 Activity feed

### Week 7-8: Polish
- 🔲 Analytics
- 🔲 Search and discovery
- 🔲 Performance optimization

## Common Commands

```bash
# Database
npx prisma migrate dev          # Create and apply migration
npx prisma generate             # Regenerate Prisma client
npx prisma studio               # Open database GUI
npx prisma db push              # Sync schema without migration

# Development
npm run dev                     # Start dev server
npm run build                   # Build for production
npm run start                   # Start production server

# Testing
npm run test                    # Run tests
npm run test:watch              # Watch mode
```

## Project Structure

```
/
├── pages/api/              # API endpoints
│   ├── auth/              # Authentication
│   ├── users/             # User management
│   ├── patterns/          # Pattern CRUD
│   └── analytics/         # Analytics
├── lib/                   # Utilities
│   ├── prisma.ts         # DB client
│   ├── auth.ts           # Auth utils
│   └── validations.ts    # Input validation
├── middleware/            # Middleware
│   └── auth.middleware.ts
├── prisma/               # Database
│   ├── schema.prisma     # Schema
│   └── migrations/       # Migrations
└── docs/                 # Documentation
```

## Useful Resources

### Documentation
- [Backend Summary](./BACKEND_SUMMARY.md) - Feature overview
- [API Specification](./API_SPECIFICATION.md) - All endpoints
- [Database Schema](./DATABASE_SCHEMA.md) - Data model
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Detailed guide
- [Backend Architecture](./BACKEND_ARCHITECTURE.md) - Architecture

### External Resources
- [Prisma Docs](https://www.prisma.io/docs) - Database ORM
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [JWT.io](https://jwt.io/) - JWT debugger
- [Zod](https://zod.dev/) - Schema validation

## Deployment Options

### Option 1: Vercel (Easiest)
```bash
# Deploy to Vercel
vercel

# Add environment variables in Vercel dashboard
# Use Supabase or PlanetScale for database
```

### Option 2: Railway
```bash
# Install Railway CLI
npm install -g railway

# Deploy
railway login
railway init
railway up
```

### Option 3: Docker
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]
```

## Troubleshooting

### "Module not found: @prisma/client"
```bash
npx prisma generate
```

### "Connection refused" database errors
Check your DATABASE_URL in .env.local

### JWT verification fails
Ensure JWT_SECRET is the same everywhere

### Prisma schema changes not applied
```bash
npx prisma generate
npx prisma migrate dev
```

### Port 3009 already in use
```bash
# Kill process on port 3009
lsof -ti:3009 | xargs kill -9

# Or use a different port
npm run dev -- -p 3010
```

## Getting Help

1. Check the [Implementation Guide](./IMPLEMENTATION_GUIDE.md) for detailed steps
2. Review the [API Specification](./API_SPECIFICATION.md) for endpoint details
3. Look at the [Database Schema](./DATABASE_SCHEMA.md) for data structure
4. Open an issue on GitHub if you're stuck

## Security Checklist

Before deploying to production:

- [ ] Use strong JWT_SECRET (32+ characters, random)
- [ ] Enable HTTPS/SSL
- [ ] Set up CORS properly
- [ ] Add rate limiting
- [ ] Validate all inputs
- [ ] Use parameterized queries (Prisma does this)
- [ ] Don't log sensitive data
- [ ] Set up error monitoring (Sentry)
- [ ] Regular security updates
- [ ] Database backups configured

## Success!

If you can:
1. Register a user
2. Login and get a JWT token
3. Save a beat pattern
4. Load it back

**Congratulations!** 🎉 You have a working backend!

Now you can add more features from the [Backend Summary](./BACKEND_SUMMARY.md).

---

**Need more details?** Check out the complete [Implementation Guide](./IMPLEMENTATION_GUIDE.md)!
