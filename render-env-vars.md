# Render Environment Variables Configuration

This document lists all required environment variables for deploying the BlogPost microservices to Render.

## Database Services

### MySQL Database (mysql-database)

**Service Type:** Background Worker (Docker Container)

**Environment Variables:**
- `MYSQL_ROOT_PASSWORD` - Root password for MySQL (set manually in Render dashboard, keep secure)
- `MYSQL_DATABASE` - Database name: `blog_auth`

**Connection Details:**
- Host: `mysql-database.onrender.com` (or internal hostname provided by Render)
- Port: `3306`
- Database: `blog_auth`
- Username: `root`
- Password: Set in Render dashboard

### MongoDB Database (mongo-database)

**Service Type:** Background Worker (Docker Container)

**Environment Variables:**
- None required (MongoDB runs with default settings)

**Connection Details:**
- Host: `mongo-database.onrender.com` (or internal hostname provided by Render)
- Port: `27017`
- Shared instance with multiple databases:
  - `blog_content` (for content-service)
  - `blog_comments` (for comment-service)

## Application Services

### Auth User Service (auth-user-service)

**Service Type:** Web Service (Laravel/PHP)

**Required Environment Variables:**
```
DB_CONNECTION=mysql
DB_HOST=<mysql-database-host>
DB_PORT=3306
DB_DATABASE=blog_auth
DB_USERNAME=root
DB_PASSWORD=<mysql-root-password>
APP_ENV=production
APP_DEBUG=false
APP_KEY=<laravel-app-key>
```

**Notes:**
- `DB_HOST` should be set to the MySQL service hostname (provided by Render)
- `DB_PASSWORD` should match `MYSQL_ROOT_PASSWORD` from MySQL service
- `APP_KEY` should be generated using `php artisan key:generate` (can be done in build command)

**Health Check:** `/api/health`

### Content Service (content-service)

**Service Type:** Web Service (Node.js/Express)

**Required Environment Variables:**
```
PORT=3001
MONGO_URL=mongodb://mongo-database.onrender.com:27017/blog_content
```

**Notes:**
- `MONGO_URL` connects to the shared MongoDB instance with database name `blog_content`
- Port is set to 3001 (can be overridden by Render's $PORT variable)

**Health Check:** `/health`

### Comment Service (comment-service)

**Service Type:** Web Service (Node.js/Express)

**Required Environment Variables:**
```
PORT=4000
MONGO_URL=mongodb://mongo-database.onrender.com:27017/blog_comments
```

**Notes:**
- `MONGO_URL` connects to the shared MongoDB instance with database name `blog_comments`
- Port is set to 4000 (can be overridden by Render's $PORT variable)

**Health Check:** `/health`

### API Gateway (api-gateway)

**Service Type:** Web Service (Node.js/Express)

**Required Environment Variables:**
```
PORT=8080
AUTH_SERVICE_URL=<auth-user-service-url>
CONTENT_SERVICE_URL=<content-service-url>
COMMENT_SERVICE_URL=<comment-service-url>
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Notes:**
- Service URLs should be set to Render service hostnames (e.g., `https://auth-user-service.onrender.com`)
- Rate limiting: 100 requests per 15 minutes (900000ms)

**Health Check:** `/health`

## Setting Environment Variables in Render

### Option 1: Using Render Dashboard

1. Navigate to each service in Render dashboard
2. Go to **Environment** tab
3. Add each environment variable manually
4. Click **Save Changes**

### Option 2: Using Render Blueprint (render.yaml)

Environment variables can be defined in `render.yaml`:
```yaml
envVars:
  - key: VARIABLE_NAME
    value: variable_value
  - key: SECRET_VARIABLE
    sync: false  # Set manually in dashboard
```

### Option 3: Using Render CLI

```bash
render env:set VARIABLE_NAME=value --service <service-name>
```

## Service URL References

When services need to reference each other, use Render's service discovery:

- **Internal Networking:** Services can use internal hostnames (faster, more secure)
- **Public URLs:** Use `https://service-name.onrender.com` format
- **From Service References:** Use `fromService` in render.yaml for automatic URL injection

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use Render's secret management** for sensitive values
3. **Set `sync: false`** for sensitive environment variables in blueprints
4. **Use different passwords** for production vs development
5. **Rotate credentials** regularly

## Environment-Specific Configuration

### Development
- `APP_DEBUG=true`
- `APP_ENV=local`
- Use local database connections

### Production
- `APP_DEBUG=false`
- `APP_ENV=production`
- Use Render service URLs
- Enable rate limiting
- Use secure passwords

## Troubleshooting

### Database Connection Issues
- Verify database service is running
- Check hostname and port are correct
- Ensure password matches between services
- Check network connectivity (services must be in same region)

### Service Communication Issues
- Verify service URLs are correct
- Check health endpoints are accessible
- Ensure services are deployed and running
- Check CORS settings if needed

