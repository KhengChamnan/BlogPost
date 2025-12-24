# Quick Render Deployment Guide

## Using render.yaml Blueprint

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add render.yaml for deployment"
git push origin main
```

### Step 2: Deploy via Render Blueprint

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. Click **"Apply"** to create all services

### Step 3: Set Manual Environment Variables

After services are created, you need to manually set these in Render dashboard:

#### For `mysql-database` service:
- Go to the service → **Environment** tab
- Set `MYSQL_ROOT_PASSWORD` to a secure password (save this!)

#### For `auth-user-service`:
- Go to the service → **Environment** tab
- Update `DB_HOST` to: `mysql-database.onrender.com` (or use the actual hostname from mysql-database service)
- Update `DB_PASSWORD` to match the `MYSQL_ROOT_PASSWORD` you set above
- Add `APP_KEY` (generate using: `php artisan key:generate` or set manually)

#### For `content-service`:
- Go to the service → **Environment** tab
- Update `MONGO_URL` to: `mongodb://mongo-database.onrender.com:27017/blog_content`
  (Replace `mongo-database.onrender.com` with actual MongoDB service hostname)

#### For `comment-service`:
- Go to the service → **Environment** tab
- Update `MONGO_URL` to: `mongodb://mongo-database.onrender.com:27017/blog_comments`
  (Replace `mongo-database.onrender.com` with actual MongoDB service hostname)

#### For `api-gateway`:
- Go to the service → **Environment** tab
- Update service URLs to actual Render URLs:
  - `AUTH_SERVICE_URL=https://auth-user-service.onrender.com`
  - `CONTENT_SERVICE_URL=https://content-service.onrender.com`
  - `COMMENT_SERVICE_URL=https://comment-service.onrender.com`

### Step 4: Deploy Order

1. **Deploy databases first** (mysql-database, mongo-database)
2. Wait for databases to be fully running
3. **Deploy backend services** (auth-user-service, content-service, comment-service)
4. **Deploy API Gateway last** (api-gateway)

### Step 5: Verify Deployment

Test health endpoints:
```bash
curl https://api-gateway.onrender.com/health
curl https://auth-user-service.onrender.com/api/health
curl https://content-service.onrender.com/health
curl https://comment-service.onrender.com/health
```

## Alternative: Manual Deployment (If Blueprint Fails)

If the blueprint doesn't work, follow the manual steps in `DEPLOYMENT.md`.

## Troubleshooting

### Services won't start
- Check build logs for errors
- Verify all environment variables are set
- Ensure databases are running first

### Database connection errors
- Verify hostnames are correct (use Render's internal hostnames)
- Check passwords match
- Ensure databases are fully deployed

### Service communication errors
- Verify all service URLs in API Gateway are correct
- Check that services are deployed and running
- Test health endpoints individually

## Important Notes

1. **Free Tier Limitations**: Services may sleep after inactivity
2. **Database Persistent Disks**: Ensure disks are attached for data persistence
3. **Environment Variables**: Some may need to be set manually after blueprint deployment
4. **Service URLs**: Use Render's provided hostnames, not hardcoded values

