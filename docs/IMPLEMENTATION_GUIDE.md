# Backend Implementation Guide

## Overview

This guide provides practical steps for implementing the backend architecture for the SalsaNor Beat Machine. It includes code examples, configuration files, and deployment instructions.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ or access to a managed database service
- Redis (optional, for caching)
- Basic understanding of Next.js, TypeScript, and REST APIs

## Project Structure

```
/
├── pages/
│   ├── api/                    # API routes (Next.js API Routes)
│   │   ├── auth/
│   │   │   ├── register.ts
│   │   │   ├── login.ts
│   │   │   └── logout.ts
│   │   ├── users/
│   │   │   ├── me.ts
│   │   │   └── [userId].ts
│   │   ├── patterns/
│   │   │   ├── index.ts
│   │   │   ├── [patternId].ts
│   │   │   └── [patternId]/
│   │   │       ├── like.ts
│   │   │       └── comments.ts
│   │   └── analytics/
│   │       └── popular-instruments.ts
│   └── ...existing frontend pages
├── lib/
│   ├── prisma.ts              # Prisma client instance
│   ├── auth.ts                # Authentication utilities
│   ├── redis.ts               # Redis client (optional)
│   └── validations.ts         # Input validation schemas
├── services/
│   ├── user.service.ts        # User business logic
│   ├── pattern.service.ts     # Pattern business logic
│   ├── auth.service.ts        # Auth business logic
│   └── analytics.service.ts   # Analytics business logic
├── middleware/
│   ├── auth.middleware.ts     # JWT verification
│   └── ratelimit.middleware.ts
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed data
├── types/
│   └── api.ts                 # API types
└── .env.local                 # Environment variables
```

## Step 1: Install Dependencies

```bash
# Core dependencies
npm install @prisma/client bcrypt jsonwebtoken
npm install --save-dev prisma @types/bcrypt @types/jsonwebtoken

# Validation and utilities
npm install zod

# Optional: Redis for caching
npm install redis
npm install --save-dev @types/redis
```

## Step 2: Set Up Prisma

### Initialize Prisma

```bash
npx prisma init
```

### Configure Database Connection

Create/update `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/salsabeatmachine?schema=public"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Optional: Redis
REDIS_URL="redis://localhost:6379"

# App Config
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3009/api/v1"
```

### Create Prisma Schema

Copy the schema from `DATABASE_SCHEMA.md` into `prisma/schema.prisma`, starting with a minimal version:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String?   @map("password_hash")
  displayName   String    @map("display_name")
  avatarUrl     String?   @map("avatar_url")
  bio           String?
  emailVerified Boolean   @default(false) @map("email_verified")
  isActive      Boolean   @default(true) @map("is_active")
  isAdmin       Boolean   @default(false) @map("is_admin")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  lastLoginAt   DateTime? @map("last_login_at")

  preferences   UserPreference?
  patterns      Pattern[]
  likes         Like[]
  comments      Comment[]

  @@index([email])
  @@map("users")
}

model UserPreference {
  id             String  @id @default(uuid())
  userId         String  @unique @map("user_id")
  defaultBpm     Int     @default(120) @map("default_bpm")
  defaultKeyNote Int     @default(0) @map("default_key_note")
  defaultFlavor  String  @default("Salsa") @map("default_flavor")
  useGlassUI     Boolean @default(true) @map("use_glass_ui")

  user           User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_preferences")
}

model Pattern {
  id            String    @id @default(uuid())
  userId        String    @map("user_id")
  title         String
  description   String?
  flavor        String
  bpm           Int
  keyNote       Int       @map("key_note")
  isPublic      Boolean   @default(true) @map("is_public")
  configuration Json
  playCount     Int       @default(0) @map("play_count")
  likeCount     Int       @default(0) @map("like_count")
  commentCount  Int       @default(0) @map("comment_count")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  likes         Like[]
  comments      Comment[]

  @@index([userId])
  @@index([isPublic])
  @@index([createdAt(sort: Desc)])
  @@map("patterns")
}

model Like {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  patternId String   @map("pattern_id")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  pattern   Pattern  @relation(fields: [patternId], references: [id], onDelete: Cascade)

  @@unique([userId, patternId])
  @@map("likes")
}

model Comment {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  patternId String   @map("pattern_id")
  text      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  pattern   Pattern  @relation(fields: [patternId], references: [id], onDelete: Cascade)

  @@index([patternId])
  @@map("comments")
}
```

### Run Migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## Step 3: Create Core Utilities

### Prisma Client Singleton

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
```

### Authentication Utilities

```typescript
// lib/auth.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const SALT_ROUNDS = 10;

export interface JWTPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
```

### Input Validation with Zod

```typescript
// lib/validations.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(100),
  acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createPatternSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  flavor: z.enum(['Salsa', 'Merengue']),
  bpm: z.number().int().min(80).max(250),
  keyNote: z.number().int().min(0).max(11),
  isPublic: z.boolean().default(true),
  configuration: z.object({
    instruments: z.array(z.object({
      id: z.string(),
      enabled: z.boolean(),
      activeProgram: z.number().int().min(0),
      volume: z.number().min(0).max(1),
      pitchOffset: z.number().int().optional(),
    })),
  }),
});

export const updateUserSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

export const updatePreferencesSchema = z.object({
  defaultBpm: z.number().int().min(80).max(250).optional(),
  defaultKeyNote: z.number().int().min(0).max(11).optional(),
  defaultFlavor: z.enum(['Salsa', 'Merengue']).optional(),
  useGlassUI: z.boolean().optional(),
});
```

## Step 4: Create API Response Utilities

```typescript
// lib/api-response.ts
import { NextApiResponse } from 'next';

export function successResponse<T>(res: NextApiResponse, data: T, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

export function errorResponse(
  res: NextApiResponse,
  code: string,
  message: string,
  statusCode = 400,
  details?: any
) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  });
}
```

## Step 5: Create Authentication Middleware

```typescript
// middleware/auth.middleware.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { extractTokenFromHeader, verifyToken } from '../lib/auth';
import { errorResponse } from '../lib/api-response';
import { prisma } from '../lib/prisma';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    displayName: string;
    isAdmin: boolean;
  };
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = extractTokenFromHeader(req.headers.authorization);
      
      if (!token) {
        return errorResponse(res, 'AUTH_REQUIRED', 'Authentication required', 401);
      }

      const payload = verifyToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, displayName: true, isAdmin: true, isActive: true },
      });

      if (!user || !user.isActive) {
        return errorResponse(res, 'USER_NOT_FOUND', 'User not found or inactive', 401);
      }

      req.user = user;
      return handler(req, res);
    } catch (error) {
      return errorResponse(res, 'INVALID_TOKEN', 'Invalid or expired token', 401);
    }
  };
}
```

## Step 6: Create API Endpoints

### Register Endpoint

```typescript
// pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { hashPassword, generateToken } from '../../../lib/auth';
import { successResponse, errorResponse } from '../../../lib/api-response';
import { registerSchema } from '../../../lib/validations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const validation = registerSchema.safeParse(req.body);
    
    if (!validation.success) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Invalid input', 400, validation.error.errors);
    }

    const { email, password, displayName } = validation.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'USER_EXISTS', 'User with this email already exists', 400);
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        preferences: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    return successResponse(res, { user, token }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 'SERVER_ERROR', 'An error occurred during registration', 500);
  }
}
```

### Login Endpoint

```typescript
// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { verifyPassword, generateToken } from '../../../lib/auth';
import { successResponse, errorResponse } from '../../../lib/api-response';
import { loginSchema } from '../../../lib/validations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const validation = loginSchema.safeParse(req.body);
    
    if (!validation.success) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Invalid input', 400, validation.error.errors);
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        displayName: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user || !user.passwordHash) {
      return errorResponse(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'USER_INACTIVE', 'User account is inactive', 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return errorResponse(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    return successResponse(res, {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'SERVER_ERROR', 'An error occurred during login', 500);
  }
}
```

### Get Current User

```typescript
// pages/api/users/me.ts
import { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { successResponse, errorResponse } from '../../../lib/api-response';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth.middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: {
          preferences: true,
          _count: {
            select: {
              patterns: true,
              likes: true,
            },
          },
        },
      });

      if (!user) {
        return errorResponse(res, 'USER_NOT_FOUND', 'User not found', 404);
      }

      return successResponse(res, {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        preferences: user.preferences,
        stats: {
          patternsCreated: user._count.patterns,
          patternsLiked: user._count.likes,
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      console.error('Get user error:', error);
      return errorResponse(res, 'SERVER_ERROR', 'An error occurred', 500);
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
```

### Create Pattern

```typescript
// pages/api/patterns/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { successResponse, errorResponse } from '../../../lib/api-response';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { createPatternSchema } from '../../../lib/validations';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const validation = createPatternSchema.safeParse(req.body);
      
      if (!validation.success) {
        return errorResponse(res, 'VALIDATION_ERROR', 'Invalid input', 400, validation.error.errors);
      }

      const pattern = await prisma.pattern.create({
        data: {
          ...validation.data,
          userId: req.user!.id,
        },
      });

      return successResponse(res, pattern, 201);
    } catch (error) {
      console.error('Create pattern error:', error);
      return errorResponse(res, 'SERVER_ERROR', 'An error occurred', 500);
    }
  }

  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '20', flavor, sort = 'recent' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = Math.min(parseInt(limit as string), 100);
      const skip = (pageNum - 1) * limitNum;

      const where: any = { isPublic: true };
      if (flavor) where.flavor = flavor;

      const orderBy: any = {};
      if (sort === 'popular') orderBy.likeCount = 'desc';
      else if (sort === 'played') orderBy.playCount = 'desc';
      else orderBy.createdAt = 'desc';

      const [patterns, total] = await Promise.all([
        prisma.pattern.findMany({
          where,
          orderBy,
          skip,
          take: limitNum,
          include: {
            user: {
              select: { id: true, displayName: true, avatarUrl: true },
            },
          },
        }),
        prisma.pattern.count({ where }),
      ]);

      return successResponse(res, {
        patterns,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error('List patterns error:', error);
      return errorResponse(res, 'SERVER_ERROR', 'An error occurred', 500);
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
```

## Step 7: Frontend Integration

### Create API Client

```typescript
// lib/api-client.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; displayName: string; acceptTerms: boolean }) =>
    apiClient.post('/auth/register', data),
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
};

// User API
export const userAPI = {
  getMe: () => apiClient.get('/users/me'),
  updateMe: (data: { displayName?: string; bio?: string }) =>
    apiClient.put('/users/me', data),
  updatePreferences: (preferences: any) =>
    apiClient.put('/users/me/preferences', preferences),
};

// Pattern API
export const patternAPI = {
  list: (params?: { page?: number; limit?: number; flavor?: string; sort?: string }) =>
    apiClient.get('/patterns', { params }),
  get: (patternId: string) => apiClient.get(`/patterns/${patternId}`),
  create: (data: any) => apiClient.post('/patterns', data),
  update: (patternId: string, data: any) => apiClient.put(`/patterns/${patternId}`, data),
  delete: (patternId: string) => apiClient.delete(`/patterns/${patternId}`),
  like: (patternId: string) => apiClient.post(`/patterns/${patternId}/like`),
  unlike: (patternId: string) => apiClient.delete(`/patterns/${patternId}/like`),
};
```

## Step 8: Testing

Create tests for your API endpoints:

```bash
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

```typescript
// __tests__/api/auth/register.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/auth/register';

describe('/api/auth/register', () => {
  it('should register a new user', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
        acceptTerms: true,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe('test@example.com');
  });
});
```

## Step 9: Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Database Setup (Production)

**Option 1: Supabase**
```bash
# Create project at supabase.com
# Copy connection string
# Add to Vercel environment variables
```

**Option 2: PlanetScale**
```bash
# Create database at planetscale.com
# Get connection string
# Add to Vercel environment variables
```

### Environment Variables (Production)

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="production-secret-key"
NODE_ENV="production"
```

## Next Steps

1. Implement rate limiting
2. Add email verification
3. Set up monitoring (Sentry)
4. Add API documentation (Swagger)
5. Implement caching with Redis
6. Add comprehensive tests
7. Set up CI/CD pipeline

## Resources

- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Vercel Deployment](https://vercel.com/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
