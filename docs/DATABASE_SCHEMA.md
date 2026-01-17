# Database Schema for SalsaNor Beat Machine

## Overview

This document defines the database schema for the SalsaNor Beat Machine backend. The schema is designed to be database-agnostic but examples use PostgreSQL syntax with Prisma ORM conventions.

## Technology Choice

**Recommended**: PostgreSQL with Prisma ORM
- Strong typing support
- Excellent JSON support for flexible instrument configurations
- ACID compliance for data integrity
- Strong community and tooling
- Easy migration management with Prisma

**Alternative**: MongoDB with Mongoose
- More flexible schema for rapidly evolving data models
- Native JSON storage
- Good for real-time features

## Schema Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    Users    │────────<│   Patterns   │>────────│  Comments   │
└─────────────┘         └──────────────┘         └─────────────┘
       │                       │                         │
       │                       │                         │
       ▼                       ▼                         ▼
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Sessions  │         │    Likes     │         │  Analytics  │
└─────────────┘         └──────────────┘         └─────────────┘
       │                       
       │                 ┌──────────────┐
       └────────────────>│   Follows    │
                         └──────────────┘
```

## Tables

### Users

Stores user account information and authentication data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- NULL for OAuth-only users
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  oauth_provider VARCHAR(50), -- 'google', 'facebook', 'apple', NULL
  oauth_id VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT unique_oauth UNIQUE (oauth_provider, oauth_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Prisma Schema:**
```prisma
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  passwordHash    String?   @map("password_hash")
  displayName     String    @map("display_name")
  avatarUrl       String?   @map("avatar_url")
  bio             String?
  oauthProvider   String?   @map("oauth_provider")
  oauthId         String?   @map("oauth_id")
  emailVerified   Boolean   @default(false) @map("email_verified")
  isActive        Boolean   @default(true) @map("is_active")
  isAdmin         Boolean   @default(false) @map("is_admin")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  lastLoginAt     DateTime? @map("last_login_at")

  preferences     UserPreference?
  sessions        Session[]
  patterns        Pattern[]
  likes           Like[]
  comments        Comment[]
  followers       Follow[]  @relation("UserFollowers")
  following       Follow[]  @relation("UserFollowing")
  activities      Activity[]

  @@unique([oauthProvider, oauthId], name: "unique_oauth")
  @@index([email])
  @@index([oauthProvider, oauthId])
  @@index([createdAt])
  @@map("users")
}
```

---

### UserPreferences

Stores user-specific application preferences and settings.

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  default_bpm INTEGER DEFAULT 120,
  default_key_note INTEGER DEFAULT 0,
  default_flavor VARCHAR(20) DEFAULT 'Salsa',
  use_glass_ui BOOLEAN DEFAULT TRUE,
  auto_play BOOLEAN DEFAULT FALSE,
  show_beat_numbers BOOLEAN DEFAULT TRUE,
  default_volume DECIMAL(3,2) DEFAULT 1.0,
  theme VARCHAR(20) DEFAULT 'light', -- 'light', 'dark', 'auto'
  language VARCHAR(10) DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

**Prisma Schema:**
```prisma
model UserPreference {
  id                    String   @id @default(uuid())
  userId                String   @unique @map("user_id")
  defaultBpm            Int      @default(120) @map("default_bpm")
  defaultKeyNote        Int      @default(0) @map("default_key_note")
  defaultFlavor         String   @default("Salsa") @map("default_flavor")
  useGlassUI            Boolean  @default(true) @map("use_glass_ui")
  autoPlay              Boolean  @default(false) @map("auto_play")
  showBeatNumbers       Boolean  @default(true) @map("show_beat_numbers")
  defaultVolume         Decimal  @default(1.0) @map("default_volume")
  theme                 String   @default("light")
  language              String   @default("en")
  notificationsEnabled  Boolean  @default(true) @map("notifications_enabled")
  emailNotifications    Boolean  @default(true) @map("email_notifications")
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("user_preferences")
}
```

---

### Sessions

Stores user session tokens for authentication.

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

**Prisma Schema:**
```prisma
model Session {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  token       String   @unique
  ipAddress   String?  @map("ip_address")
  userAgent   String?  @map("user_agent")
  expiresAt   DateTime @map("expires_at")
  createdAt   DateTime @default(now()) @map("created_at")
  lastUsedAt  DateTime @default(now()) @map("last_used_at")

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@index([expiresAt])
  @@map("sessions")
}
```

---

### Patterns

Stores user-created beat patterns.

```sql
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  flavor VARCHAR(20) NOT NULL, -- 'Salsa', 'Merengue'
  bpm INTEGER NOT NULL,
  key_note INTEGER NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  configuration JSONB NOT NULL, -- Stores full machine configuration
  thumbnail_url TEXT,
  original_pattern_id UUID REFERENCES patterns(id) ON DELETE SET NULL, -- For forks
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  fork_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_bpm CHECK (bpm >= 80 AND bpm <= 250),
  CONSTRAINT valid_key_note CHECK (key_note >= 0 AND key_note <= 11)
);

CREATE INDEX idx_patterns_user_id ON patterns(user_id);
CREATE INDEX idx_patterns_flavor ON patterns(flavor);
CREATE INDEX idx_patterns_is_public ON patterns(is_public);
CREATE INDEX idx_patterns_created_at ON patterns(created_at DESC);
CREATE INDEX idx_patterns_play_count ON patterns(play_count DESC);
CREATE INDEX idx_patterns_like_count ON patterns(like_count DESC);
CREATE INDEX idx_patterns_original_pattern_id ON patterns(original_pattern_id);
```

**Configuration JSONB Example:**
```json
{
  "instruments": [
    {
      "id": "clave",
      "enabled": true,
      "activeProgram": 0,
      "volume": 1.0,
      "pitchOffset": 0
    },
    {
      "id": "cowbell",
      "enabled": true,
      "activeProgram": 1,
      "volume": 0.8,
      "pitchOffset": 0
    }
  ]
}
```

**Prisma Schema:**
```prisma
model Pattern {
  id                String    @id @default(uuid())
  userId            String    @map("user_id")
  title             String
  description       String?
  flavor            String
  bpm               Int
  keyNote           Int       @map("key_note")
  isPublic          Boolean   @default(true) @map("is_public")
  configuration     Json
  thumbnailUrl      String?   @map("thumbnail_url")
  originalPatternId String?   @map("original_pattern_id")
  playCount         Int       @default(0) @map("play_count")
  likeCount         Int       @default(0) @map("like_count")
  commentCount      Int       @default(0) @map("comment_count")
  forkCount         Int       @default(0) @map("fork_count")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  publishedAt       DateTime? @map("published_at")

  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  originalPattern   Pattern?  @relation("PatternForks", fields: [originalPatternId], references: [id], onDelete: SetNull)
  forks             Pattern[] @relation("PatternForks")
  likes             Like[]
  comments          Comment[]
  activities        Activity[]

  @@index([userId])
  @@index([flavor])
  @@index([isPublic])
  @@index([createdAt(sort: Desc)])
  @@index([playCount(sort: Desc)])
  @@index([likeCount(sort: Desc)])
  @@index([originalPatternId])
  @@map("patterns")
}
```

---

### Likes

Stores user likes on patterns.

```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pattern_id UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_pattern_like UNIQUE (user_id, pattern_id)
);

CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_pattern_id ON likes(pattern_id);
CREATE INDEX idx_likes_created_at ON likes(created_at);
```

**Prisma Schema:**
```prisma
model Like {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  patternId String   @map("pattern_id")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  pattern   Pattern  @relation(fields: [patternId], references: [id], onDelete: Cascade)

  @@unique([userId, patternId], name: "unique_user_pattern_like")
  @@index([userId])
  @@index([patternId])
  @@index([createdAt])
  @@map("likes")
}
```

---

### Comments

Stores comments on patterns.

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pattern_id UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested comments
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_comment_length CHECK (LENGTH(text) >= 1 AND LENGTH(text) <= 5000)
);

CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_pattern_id ON comments(pattern_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
```

**Prisma Schema:**
```prisma
model Comment {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  patternId       String    @map("pattern_id")
  text            String
  parentCommentId String?   @map("parent_comment_id")
  isEdited        Boolean   @default(false) @map("is_edited")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  pattern         Pattern   @relation(fields: [patternId], references: [id], onDelete: Cascade)
  parentComment   Comment?  @relation("CommentReplies", fields: [parentCommentId], references: [id], onDelete: Cascade)
  replies         Comment[] @relation("CommentReplies")

  @@index([userId])
  @@index([patternId])
  @@index([parentCommentId])
  @@index([createdAt])
  @@map("comments")
}
```

---

### Follows

Stores user follow relationships.

```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_follower_following UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_follows_created_at ON follows(created_at);
```

**Prisma Schema:**
```prisma
model Follow {
  id          String   @id @default(uuid())
  followerId  String   @map("follower_id")
  followingId String   @map("following_id")
  createdAt   DateTime @default(now()) @map("created_at")

  follower    User     @relation("UserFollowers", fields: [followerId], references: [id], onDelete: Cascade)
  following   User     @relation("UserFollowing", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId], name: "unique_follower_following")
  @@index([followerId])
  @@index([followingId])
  @@index([createdAt])
  @@map("follows")
}
```

---

### Activities

Stores activity feed events.

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'pattern_created', 'pattern_liked', 'user_followed', 'comment_created'
  pattern_id UUID REFERENCES patterns(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  metadata JSONB, -- Additional context-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_activity_type ON activities(activity_type);
CREATE INDEX idx_activities_pattern_id ON activities(pattern_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
```

**Prisma Schema:**
```prisma
model Activity {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  activityType String   @map("activity_type")
  patternId    String?  @map("pattern_id")
  targetUserId String?  @map("target_user_id")
  metadata     Json?
  createdAt    DateTime @default(now()) @map("created_at")

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  pattern      Pattern? @relation(fields: [patternId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([activityType])
  @@index([patternId])
  @@index([createdAt(sort: Desc)])
  @@map("activities")
}
```

---

### Analytics

Stores aggregated analytics data.

```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL, -- 'instrument_usage', 'tempo_distribution', 'key_usage'
  metric_key VARCHAR(100) NOT NULL, -- 'clave', '120_bpm', 'key_0'
  metric_value INTEGER NOT NULL,
  time_period DATE NOT NULL,
  aggregation_level VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_analytics_entry UNIQUE (metric_type, metric_key, time_period, aggregation_level)
);

CREATE INDEX idx_analytics_metric_type ON analytics(metric_type);
CREATE INDEX idx_analytics_time_period ON analytics(time_period DESC);
CREATE INDEX idx_analytics_aggregation_level ON analytics(aggregation_level);
```

**Prisma Schema:**
```prisma
model Analytics {
  id               String   @id @default(uuid())
  metricType       String   @map("metric_type")
  metricKey        String   @map("metric_key")
  metricValue      Int      @map("metric_value")
  timePeriod       DateTime @map("time_period") @db.Date
  aggregationLevel String   @map("aggregation_level")
  createdAt        DateTime @default(now()) @map("created_at")

  @@unique([metricType, metricKey, timePeriod, aggregationLevel], name: "unique_analytics_entry")
  @@index([metricType])
  @@index([timePeriod(sort: Desc)])
  @@index([aggregationLevel])
  @@map("analytics")
}
```

---

## Complete Prisma Schema

Here's the complete `schema.prisma` file:

```prisma
// This is your Prisma schema file
// Learn more: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// All models defined above would go here
// See individual model definitions above
```

---

## Migrations

### Initial Migration

```bash
# Create initial migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed database (optional)
npx prisma db seed
```

### Sample Seed Data

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@salsabeatmachine.org',
      passwordHash: hashedPassword,
      displayName: 'Demo User',
      emailVerified: true,
      preferences: {
        create: {
          defaultBpm: 120,
          defaultKeyNote: 0,
          defaultFlavor: 'Salsa',
          useGlassUI: true,
        },
      },
    },
  });

  // Create demo pattern
  await prisma.pattern.create({
    data: {
      userId: demoUser.id,
      title: 'Classic Salsa Beat',
      description: 'A traditional salsa rhythm with clave and cowbell',
      flavor: 'Salsa',
      bpm: 120,
      keyNote: 0,
      isPublic: true,
      configuration: {
        instruments: [
          {
            id: 'clave',
            enabled: true,
            activeProgram: 0,
            volume: 1.0,
            pitchOffset: 0,
          },
          {
            id: 'cowbell',
            enabled: true,
            activeProgram: 0,
            volume: 0.8,
            pitchOffset: 0,
          },
        ],
      },
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Database Indexes Summary

Key indexes for optimal query performance:

1. **Users**: email, oauth credentials, created_at
2. **Patterns**: user_id, flavor, is_public, created_at, play_count, like_count
3. **Likes**: user_id, pattern_id, created_at
4. **Comments**: user_id, pattern_id, created_at
5. **Follows**: follower_id, following_id
6. **Sessions**: token, expires_at
7. **Activities**: user_id, created_at
8. **Analytics**: metric_type, time_period

---

## Data Retention Policy

- **Sessions**: Expire after 30 days of inactivity, cleaned up daily
- **Activities**: Keep for 90 days, archived after that
- **Analytics**: Keep daily data for 1 year, monthly aggregates indefinitely
- **Deleted Users**: Soft delete with 30-day grace period before hard delete
- **Deleted Patterns**: Keep for 7 days in case of accidental deletion

---

## Backup Strategy

1. **Daily automated backups** of entire database
2. **Point-in-time recovery** enabled (last 7 days)
3. **Weekly full backups** stored off-site
4. **Monthly backup testing** to ensure recoverability
5. **Critical data replication** to secondary region

---

## Performance Considerations

1. **Use connection pooling** (e.g., PgBouncer)
2. **Implement query result caching** with Redis
3. **Use read replicas** for analytics queries
4. **Partition large tables** (activities, analytics) by date
5. **Regular vacuum and analyze** for PostgreSQL maintenance
6. **Monitor slow query log** and optimize problematic queries
