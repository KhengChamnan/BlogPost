# Deployment Guide: BlogPost Microservices on Render

This guide provides step-by-step instructions for deploying the BlogPost microservices application to Render with CI/CD automation.

## Prerequisites

- Render account ([sign up here](https://dashboard.render.com/register))
- GitHub account with repository containing the project
- Docker knowledge (basic)
- Git installed locally

## Architecture Overview

The application consists of:
- **4 Web Services:** API Gateway, Auth Service, Content Service, Comment Service
- **2 Database Services:** MySQL (for auth), MongoDB (shared by content and comment)
- **CI/CD Pipeline:** GitHub Actions for automated testing and deployment

## Deployment Steps

### Step 1: Prepare Your Repository

1. Ensure all services have Dockerfiles
2. Verify health check endpoints exist:
   - API Gateway: `/health`
   - Auth Service: `/api/health`
   - Content Service: `/health`
   - Comment Service: `/health`
3. Push all changes to GitHub

### Step 2: Set Up Render Account

1. Create account at [Render Dashboard](https://dashboard.render.com)
2. Connect your GitHub repository
3. Generate API key (Settings > API Keys) for CI/CD automation

### Step 3: Deploy Databases First

#### Deploy MySQL Database

1. In Render Dashboard, click **New** > **Background Worker**
2. Select **Existing Image**
3. Enter Docker image: `mysql:8.0`
4. Configure:
   - **Name:** `mysql-database`
   - **Region:** Choose closest to your services
   - **Docker Command:** `mysqld --default-authentication-plugin=mysql_native_password`
5. Add Environment Variables:
   - `MYSQL_ROOT_PASSWORD` - Set a secure password (save this!)
   - `MYSQL_DATABASE` - `blog_auth`
6. Add Persistent Disk:
   - **Name:** `mysql-data`
   - **Mount Path:** `/var/lib/mysql`
   - **Size:** 10GB (adjust as needed)
7. Click **Create Background Worker**

#### Deploy MongoDB Database

1. In Render Dashboard, click **New** > **Background Worker**
2. Select **Existing Image**
3. Enter Docker image: `mongo:7.0`
4. Configure:
   - **Name:** `mongo-database`
   - **Region:** Same as MySQL
   - **Docker Command:** `mongod`
5. Add Persistent Disk:
   - **Name:** `mongo-data`
   - **Mount Path:** `/data/db`
   - **Size:** 10GB (adjust as needed)
6. Click **Create Background Worker**

**Note:** Wait for both databases to be fully deployed before proceeding.

### Step 4: Deploy Application Services

#### Deploy Auth User Service

1. Click **New** > **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `auth-user-service`
   - **Root Directory:** `auth-user-service`
   - **Environment:** `PHP`
   - **Build Command:** `composer install --no-dev --no-scripts --no-autoloader && composer dump-autoload --optimize && php artisan migrate --force`
   - **Start Command:** `php artisan serve --host=0.0.0.0 --port=$PORT`
4. Add Environment Variables:
   ```
   DB_CONNECTION=mysql
   DB_HOST=<mysql-database-host>
   DB_PORT=3306
   DB_DATABASE=blog_auth
   DB_USERNAME=root
   DB_PASSWORD=<mysql-root-password>
   APP_ENV=production
   APP_DEBUG=false
   ```
   - Replace `<mysql-database-host>` with MySQL service hostname
   - Replace `<mysql-root-password>` with the password you set for MySQL
5. Set Health Check Path: `/api/health`
6. Click **Create Web Service**

#### Deploy Content Service

1. Click **New** > **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `content-service`
   - **Root Directory:** `content-service`
   - **Environment:** `Node`
   - **Build Command:** `npm install --production`
   - **Start Command:** `npm start`
4. Add Environment Variables:
   ```
   PORT=3001
   MONGO_URL=mongodb://mongo-database.onrender.com:27017/blog_content
   ```
   - Replace `mongo-database.onrender.com` with your MongoDB service hostname
5. Set Health Check Path: `/health`
6. Click **Create Web Service`

#### Deploy Comment Service

1. Click **New** > **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `comment-service`
   - **Root Directory:** `comment-service`
   - **Environment:** `Node`
   - **Build Command:** `npm install --production`
   - **Start Command:** `npm start`
4. Add Environment Variables:
   ```
   PORT=4000
   MONGO_URL=mongodb://mongo-database.onrender.com:27017/blog_comments
   ```
   - Replace `mongo-database.onrender.com` with your MongoDB service hostname
5. Set Health Check Path: `/health`
6. Click **Create Web Service**

#### Deploy API Gateway

1. Click **New** > **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `api-gateway`
   - **Root Directory:** `api-gateway`
   - **Environment:** `Node`
   - **Build Command:** `npm install --production`
   - **Start Command:** `npm start`
4. Add Environment Variables:
   ```
   PORT=8080
   AUTH_SERVICE_URL=https://auth-user-service.onrender.com
   CONTENT_SERVICE_URL=https://content-service.onrender.com
   COMMENT_SERVICE_URL=https://comment-service.onrender.com
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```
   - Replace service URLs with your actual Render service URLs
5. Set Health Check Path: `/health`
6. Click **Create Web Service**

### Step 5: Set Up CI/CD Pipeline

1. In your GitHub repository, create `.github/workflows/render-deploy.yml`
2. Add Render API key as GitHub secret:
   - Go to GitHub repo > Settings > Secrets and variables > Actions
   - Add secret: `RENDER_API_KEY` with your Render API key
3. Push the workflow file to trigger the pipeline
4. Monitor deployment in GitHub Actions tab

See `.github/workflows/render-deploy.yml` for the complete CI/CD configuration.

### Step 6: Verify Deployment

1. **Check Health Endpoints:**
   ```bash
   curl https://api-gateway.onrender.com/health
   curl https://auth-user-service.onrender.com/api/health
   curl https://content-service.onrender.com/health
   curl https://comment-service.onrender.com/health
   ```

2. **Test API Gateway:**
   ```bash
   curl https://api-gateway.onrender.com/api/auth/register \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

3. **Check Service Logs:**
   - Navigate to each service in Render dashboard
   - Check **Logs** tab for any errors

## Using Render Blueprint (Alternative Method)

Instead of manual setup, you can use the `render.yaml` blueprint:

1. Push `render.yaml` to your repository root
2. In Render Dashboard, click **New** > **Blueprint**
3. Connect your repository
4. Render will automatically detect and deploy all services
5. Manually set sensitive environment variables (passwords, API keys)

**Note:** You'll still need to set `MYSQL_ROOT_PASSWORD` and other secrets manually in the dashboard.

## Environment Variables Reference

See `render-env-vars.md` for complete environment variable documentation.

## Troubleshooting

### Services Won't Start

- Check build logs for errors
- Verify environment variables are set correctly
- Ensure database services are running
- Check health check paths are correct

### Database Connection Errors

- Verify database service hostnames
- Check passwords match between services
- Ensure databases are fully deployed
- Check network connectivity (same region)

### CI/CD Pipeline Fails

- Verify GitHub secrets are set correctly
- Check Render API key has proper permissions
- Review GitHub Actions logs
- Ensure all tests pass locally

### Service Communication Issues

- Verify service URLs in API Gateway
- Check CORS settings if needed
- Ensure all services are deployed
- Test health endpoints individually

## Monitoring and Maintenance

1. **Monitor Service Health:**
   - Use Render's built-in monitoring
   - Set up alerts for service downtime
   - Monitor database disk usage

2. **Regular Updates:**
   - Keep dependencies updated
   - Monitor security advisories
   - Update Docker images regularly

3. **Backup Strategy:**
   - Database persistent disks provide basic backup
   - Consider additional backup solutions for production
   - Document backup and restore procedures

## Cost Considerations

- **Free Tier:** Limited hours per month
- **Paid Plans:** Based on service usage
- **Database Storage:** Persistent disks have associated costs
- **Bandwidth:** Monitor usage to avoid overages

## Next Steps

- Set up custom domains (optional)
- Configure SSL certificates (automatic on Render)
- Set up monitoring and alerting
- Implement logging aggregation
- Configure auto-scaling (if needed)

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: Report bugs in your repository

