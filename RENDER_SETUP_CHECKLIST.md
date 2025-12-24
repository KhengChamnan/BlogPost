# Render Deployment Checklist

## Before Deploying

- [ ] All code pushed to GitHub
- [ ] `render.yaml` is in repository root
- [ ] Health endpoints working locally
- [ ] Render account created

## Step 1: Deploy via Blueprint

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml`
5. Click **"Apply"** to create all services

## Step 2: Configure Environment Variables (CRITICAL)

After services are created, you MUST update these manually:

### For `mysql-database` service:
- [ ] Set `MYSQL_ROOT_PASSWORD` to a secure password (SAVE THIS!)

### For `auth-user-service`:
- [ ] Update `DB_HOST` to actual MySQL hostname (from mysql-database service)
- [ ] Update `DB_PASSWORD` to match MySQL root password
- [ ] Set `APP_KEY` (run `php artisan key:generate` or generate manually)

### For `content-service`:
- [ ] Update `MONGO_URL` to: `mongodb://<mongo-hostname>:27017/blog_content`
  - Replace `<mongo-hostname>` with actual MongoDB service hostname

### For `comment-service`:
- [ ] Update `MONGO_URL` to: `mongodb://<mongo-hostname>:27017/blog_comments`
  - Replace `<mongo-hostname>` with actual MongoDB service hostname

### For `api-gateway`:
- [ ] Update `AUTH_SERVICE_URL` to: `https://<auth-service-hostname>`
- [ ] Update `CONTENT_SERVICE_URL` to: `https://<content-service-hostname>`
- [ ] Update `COMMENT_SERVICE_URL` to: `https://<comment-service-hostname>`
  - Replace with actual service hostnames from Render

## Step 3: Deployment Order

1. [ ] **Deploy databases first** (wait for them to be fully running)
   - mysql-database
   - mongo-database

2. [ ] **Deploy backend services** (after databases are ready)
   - auth-user-service
   - content-service
   - comment-service

3. [ ] **Deploy API Gateway last** (after all services are ready)
   - api-gateway

## Step 4: Verify Deployment

Test each health endpoint:
- [ ] `curl https://api-gateway.onrender.com/health`
- [ ] `curl https://auth-user-service.onrender.com/api/health`
- [ ] `curl https://content-service.onrender.com/health`
- [ ] `curl https://comment-service.onrender.com/health`

## Common Issues & Solutions

### Services won't start
- Check build logs for errors
- Verify all environment variables are set
- Ensure databases are running first

### Database connection errors
- Verify hostnames are correct (use Render's provided hostnames)
- Check passwords match between services
- Ensure databases are fully deployed before services

### Service communication errors
- Verify all service URLs in API Gateway are correct
- Check that services are deployed and running
- Test health endpoints individually

## Important Notes

1. **Hostnames**: Render provides hostnames like `service-name.onrender.com` - use these exact values
2. **Passwords**: Save all passwords securely - you'll need them for service connections
3. **Free Tier**: Services may sleep after inactivity on free tier
4. **Persistent Disks**: Ensure disks are attached for database data persistence
5. **Environment Variables**: Variables marked `sync: false` must be set manually in Render dashboard

## Quick Reference: Finding Service Hostnames

1. Go to Render Dashboard
2. Click on each service
3. Find the hostname in the service details (usually at the top)
4. Copy the full hostname (e.g., `mysql-database.onrender.com`)

## After Deployment

- [ ] All services showing "Live" status
- [ ] Health checks passing
- [ ] Test API endpoints via Postman or curl
- [ ] Monitor logs for any errors
- [ ] Set up alerts (optional)

