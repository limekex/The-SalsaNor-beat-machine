# API Specification for SalsaNor Beat Machine Backend

## Base URL
```
Production: https://api.salsabeatmachine.org/v1
Development: http://localhost:3009/api/v1
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { /* optional additional info */ }
  }
}
```

## Endpoints

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "Salsa Dancer",
  "acceptTerms": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123abc",
      "email": "user@example.com",
      "displayName": "Salsa Dancer",
      "createdAt": "2024-01-17T12:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123abc",
      "email": "user@example.com",
      "displayName": "Salsa Dancer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/logout
Logout current user (invalidate token).

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### POST /auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Password reset email sent"
  }
}
```

### POST /auth/reset-password
Reset password with token from email.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

### POST /auth/oauth/google
Authenticate with Google OAuth.

**Request Body:**
```json
{
  "idToken": "google_id_token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt_token"
  }
}
```

---

## User Profile Endpoints

### GET /users/me
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_123abc",
    "email": "user@example.com",
    "displayName": "Salsa Dancer",
    "avatar": "https://cdn.example.com/avatars/usr_123abc.jpg",
    "bio": "Passionate salsa dancer and musician",
    "preferences": {
      "defaultBpm": 120,
      "defaultKey": 0,
      "defaultFlavor": "Salsa",
      "useGlassUI": true
    },
    "stats": {
      "patternsCreated": 15,
      "patternsShared": 8,
      "followers": 23,
      "following": 45
    },
    "createdAt": "2024-01-17T12:00:00Z",
    "updatedAt": "2024-01-17T15:30:00Z"
  }
}
```

### PUT /users/me
Update current user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "displayName": "New Name",
  "bio": "Updated bio",
  "avatar": "base64_encoded_image_or_url"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_123abc",
    "displayName": "New Name",
    "bio": "Updated bio",
    "avatar": "https://cdn.example.com/avatars/usr_123abc.jpg",
    "updatedAt": "2024-01-17T16:00:00Z"
  }
}
```

### PUT /users/me/preferences
Update user preferences.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "defaultBpm": 130,
  "defaultKey": 7,
  "defaultFlavor": "Merengue",
  "useGlassUI": false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "preferences": {
      "defaultBpm": 130,
      "defaultKey": 7,
      "defaultFlavor": "Merengue",
      "useGlassUI": false
    }
  }
}
```

### GET /users/:userId
Get public profile of another user.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_456def",
    "displayName": "Other User",
    "avatar": "https://cdn.example.com/avatars/usr_456def.jpg",
    "bio": "Salsa instructor",
    "stats": {
      "patternsShared": 25,
      "followers": 120
    },
    "isFollowing": false
  }
}
```

---

## Beat Pattern Endpoints

### GET /patterns
List beat patterns with filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 20, max: 100): Items per page
- `sort` (string, default: "recent"): Sort order (recent, popular, liked)
- `flavor` (string): Filter by flavor (Salsa, Merengue)
- `userId` (string): Filter by user ID
- `search` (string): Search in title and description

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "patterns": [
      {
        "id": "pat_123abc",
        "title": "My Salsa Beat",
        "description": "A groovy salsa pattern with complex cowbell",
        "flavor": "Salsa",
        "bpm": 120,
        "keyNote": 0,
        "isPublic": true,
        "thumbnail": "https://cdn.example.com/thumbnails/pat_123abc.png",
        "author": {
          "id": "usr_123abc",
          "displayName": "Salsa Dancer",
          "avatar": "https://cdn.example.com/avatars/usr_123abc.jpg"
        },
        "stats": {
          "plays": 245,
          "likes": 38,
          "comments": 5
        },
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### GET /patterns/:patternId
Get a specific beat pattern.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "pat_123abc",
    "title": "My Salsa Beat",
    "description": "A groovy salsa pattern with complex cowbell",
    "flavor": "Salsa",
    "bpm": 120,
    "keyNote": 0,
    "isPublic": true,
    "configuration": {
      "instruments": [
        {
          "id": "clave",
          "enabled": true,
          "activeProgram": 0,
          "volume": 1.0
        }
      ]
    },
    "author": {
      "id": "usr_123abc",
      "displayName": "Salsa Dancer",
      "avatar": "https://cdn.example.com/avatars/usr_123abc.jpg"
    },
    "stats": {
      "plays": 245,
      "likes": 38,
      "comments": 5,
      "isLikedByCurrentUser": false
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### POST /patterns
Create a new beat pattern.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "My New Beat",
  "description": "Description of the beat",
  "flavor": "Salsa",
  "bpm": 125,
  "keyNote": 0,
  "isPublic": true,
  "configuration": {
    "instruments": [
      {
        "id": "clave",
        "enabled": true,
        "activeProgram": 0,
        "volume": 1.0,
        "pitchOffset": 0
      }
    ]
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "pat_789xyz",
    "title": "My New Beat",
    "description": "Description of the beat",
    "flavor": "Salsa",
    "bpm": 125,
    "keyNote": 0,
    "isPublic": true,
    "shareUrl": "https://salsabeatmachine.org/patterns/pat_789xyz",
    "createdAt": "2024-01-17T18:00:00Z"
  }
}
```

### PUT /patterns/:patternId
Update an existing beat pattern.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "bpm": 130,
  "configuration": { /* updated configuration */ }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "pat_789xyz",
    "title": "Updated Title",
    "updatedAt": "2024-01-17T19:00:00Z"
  }
}
```

### DELETE /patterns/:patternId
Delete a beat pattern.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Pattern deleted successfully"
  }
}
```

### GET /patterns/me
Get current user's beat patterns.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `includePrivate` (boolean, default: true)

**Response:** `200 OK` (same format as GET /patterns)

### POST /patterns/:patternId/like
Like a beat pattern.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "liked": true,
    "likeCount": 39
  }
}
```

### DELETE /patterns/:patternId/like
Unlike a beat pattern.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "liked": false,
    "likeCount": 38
  }
}
```

### POST /patterns/:patternId/play
Track a play/view of a pattern.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "playCount": 246
  }
}
```

### POST /patterns/:patternId/fork
Create a copy of a pattern.

**Headers:** `Authorization: Bearer <token>`

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "pat_999zzz",
    "title": "My New Beat (Fork)",
    "originalId": "pat_123abc",
    "createdAt": "2024-01-17T20:00:00Z"
  }
}
```

---

## Comment Endpoints

### GET /patterns/:patternId/comments
Get comments for a pattern.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "cmt_123abc",
        "text": "Great beat! Love the cowbell pattern.",
        "author": {
          "id": "usr_456def",
          "displayName": "Another User",
          "avatar": "https://cdn.example.com/avatars/usr_456def.jpg"
        },
        "createdAt": "2024-01-16T12:00:00Z",
        "updatedAt": "2024-01-16T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5
    }
  }
}
```

### POST /patterns/:patternId/comments
Add a comment to a pattern.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "This is an amazing beat!"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "cmt_789xyz",
    "text": "This is an amazing beat!",
    "author": {
      "id": "usr_123abc",
      "displayName": "Salsa Dancer"
    },
    "createdAt": "2024-01-17T21:00:00Z"
  }
}
```

### PUT /comments/:commentId
Update a comment.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "Updated comment text"
}
```

**Response:** `200 OK`

### DELETE /comments/:commentId
Delete a comment.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Social Endpoints

### POST /users/:userId/follow
Follow a user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "following": true,
    "followerCount": 121
  }
}
```

### DELETE /users/:userId/follow
Unfollow a user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "following": false,
    "followerCount": 120
  }
}
```

### GET /users/:userId/followers
Get list of user's followers.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "usr_123abc",
        "displayName": "User Name",
        "avatar": "https://cdn.example.com/avatars/usr_123abc.jpg",
        "isFollowedByCurrentUser": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 120
    }
  }
}
```

### GET /users/:userId/following
Get list of users that a user follows.

**Response:** Same format as GET /users/:userId/followers

### GET /feed
Get activity feed for current user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "act_123abc",
        "type": "pattern_created",
        "user": {
          "id": "usr_456def",
          "displayName": "Other User"
        },
        "pattern": {
          "id": "pat_123abc",
          "title": "New Beat"
        },
        "createdAt": "2024-01-17T15:00:00Z"
      },
      {
        "id": "act_456def",
        "type": "pattern_liked",
        "user": {
          "id": "usr_789ghi",
          "displayName": "Third User"
        },
        "pattern": {
          "id": "pat_456def",
          "title": "Cool Pattern"
        },
        "createdAt": "2024-01-17T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45
    }
  }
}
```

---

## Machine Configuration Endpoints

### GET /machines
Get available machine configurations (Salsa, Merengue, etc.).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "machines": [
      {
        "id": "salsa",
        "title": "Salsa",
        "flavor": "Salsa",
        "description": "Traditional Salsa rhythm machine"
      },
      {
        "id": "merengue",
        "title": "Merengue",
        "flavor": "Merengue",
        "description": "Traditional Merengue rhythm machine"
      }
    ]
  }
}
```

### GET /machines/:machineId
Get detailed machine configuration.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "salsa",
    "title": "Salsa",
    "flavor": "Salsa",
    "bpm": 120,
    "keyNote": 0,
    "instruments": [
      {
        "id": "clave",
        "title": "Clave",
        "enabled": true,
        "activeProgram": 0,
        "respectsClave": true,
        "programs": [
          {
            "title": "Son Clave",
            "length": 16,
            "notes": [
              {"index": 2, "pitch": 0},
              {"index": 4, "pitch": 0}
            ]
          }
        ]
      }
    ]
  }
}
```

---

## Analytics Endpoints

### GET /analytics/popular-instruments
Get most popular instruments.

**Query Parameters:**
- `timeRange` (string): "day", "week", "month", "year", "all"
- `limit` (number, default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "instruments": [
      {
        "id": "clave",
        "title": "Clave",
        "usageCount": 1234,
        "percentage": 85.5
      },
      {
        "id": "cowbell",
        "title": "Cowbell",
        "usageCount": 1150,
        "percentage": 79.8
      }
    ]
  }
}
```

### GET /analytics/popular-patterns
Get trending beat patterns.

**Query Parameters:**
- `timeRange` (string): "day", "week", "month", "year"
- `limit` (number, default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "patterns": [
      {
        "id": "pat_123abc",
        "title": "Popular Beat",
        "plays": 5432,
        "likes": 234,
        "author": {
          "id": "usr_123abc",
          "displayName": "User Name"
        }
      }
    ]
  }
}
```

### GET /analytics/tempo-distribution
Get BPM usage distribution.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "distribution": [
      {"bpm": 120, "count": 450},
      {"bpm": 125, "count": 380},
      {"bpm": 130, "count": 320}
    ]
  }
}
```

---

## Error Codes

- `AUTH_REQUIRED`: Authentication required
- `INVALID_CREDENTIALS`: Invalid email or password
- `USER_EXISTS`: User already exists
- `USER_NOT_FOUND`: User not found
- `PATTERN_NOT_FOUND`: Pattern not found
- `UNAUTHORIZED`: Insufficient permissions
- `VALIDATION_ERROR`: Request validation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error

---

## Rate Limiting

- Anonymous users: 100 requests per 15 minutes
- Authenticated users: 1000 requests per 15 minutes
- Pattern creation: 20 per hour
- Comment posting: 60 per hour

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1705512000
```

---

## Webhooks (Future Feature)

Allow external services to subscribe to events like:
- `pattern.created`
- `pattern.liked`
- `user.followed`
- `comment.created`
