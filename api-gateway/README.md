# API Gateway - Blog Project

API Gateway service that routes requests to microservices (Auth, Content, Comment).

## Features

- ✅ Centralized routing for all microservices
- ✅ Authentication middleware with JWT validation
- ✅ Rate limiting protection
- ✅ CORS enabled
- ✅ Error handling and service availability checks

## Environment Variables

Create a `.env` file:

```env
PORT=8080

# Service URLs
AUTH_SERVICE_URL=http://auth-user-service:8000
CONTENT_SERVICE_URL=http://content-service:3000
COMMENT_SERVICE_URL=http://comment-service:4000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Installation

```bash
npm install
```

## Run

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Health Check

- `GET /health` - Check gateway status

### Auth Routes (Proxied to Auth Service)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Content Routes (Proxied to Content Service)

- `POST /api/content/create` - Create content (protected)
- `GET /api/content/getAllContent` - Get all content
- `GET /api/content/getContent/:id` - Get single content
- `PUT /api/content/update/:id` - Update content (protected)
- `DELETE /api/content/delete/:id` - Delete content (protected)

### Comment Routes (Proxied to Comment Service)

- `POST /api/comment/create` - Create comment (protected)
- `GET /api/comment/content/:contentId` - Get comments by content ID
- `DELETE /api/comment/delete/:id` - Delete comment (protected)

## Protected Routes

Routes marked as **(protected)** require an `Authorization` header with a valid JWT token:

```
Authorization: Bearer <your-token-here>
```

## Docker

```bash
docker build -t api-gateway .
docker run -p 8080:8080 --env-file .env api-gateway
```
